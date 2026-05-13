#!/usr/bin/env python3
"""
Cache warming script for Astropy IERS data.
Runs in the container (with internet access) before workers start.
Logs to /app/logs/predict_occ_cache.log (inside container).
"""

import argparse
import logging
import os
import sys
from datetime import datetime, timezone
from pathlib import Path
from typing import Tuple

import colorlog


class FlushFileHandler(logging.FileHandler):
    """File handler that flushes immediately after each log."""

    def emit(self, record):
        super().emit(record)
        self.flush()


def get_cache_logger():
    """Get standardized logger for cache operations."""
    # Try /app/logs first (container standard)
    log_dir = Path("/app/logs")
    logfile = log_dir / "predict_occ_cache.log"

    # If /app/logs doesn't exist or isn't writable, use cache directory
    if not log_dir.exists() or not os.access(log_dir, os.W_OK):
        cache_dir_env = os.getenv("CACHE_DIR")
        if cache_dir_env:
            log_dir = Path(cache_dir_env)
        else:
            log_dir = Path("/tmp")
        logfile = log_dir / "predict_occ_cache.log"

    log_dir.mkdir(parents=True, exist_ok=True)

    logger = logging.getLogger("cache")
    logger.setLevel(logging.INFO)

    # Close and remove existing handlers to prevent file handle leaks
    for handler in logger.handlers[:]:
        handler.close()
        logger.removeHandler(handler)

    # File handler with immediate flush
    file_formatter = logging.Formatter("%(asctime)s [%(levelname)s] %(message)s")
    file_handler = FlushFileHandler(logfile, mode="a")
    file_handler.setFormatter(file_formatter)
    file_handler.setLevel(logging.DEBUG)
    logger.addHandler(file_handler)

    # Console handler with colors
    console_formatter = colorlog.ColoredFormatter(
        "%(log_color)s%(asctime)s [%(levelname)s] %(message)s",
        datefmt="%Y-%m-%d %H:%M:%S",
    )
    console_handler = colorlog.StreamHandler(sys.stdout)
    console_handler.setFormatter(console_formatter)
    logger.addHandler(console_handler)

    return logger


def check_cache_age(cache_file: Path, max_age_days: float = 30.0) -> Tuple[bool, float]:
    """
    Check if cache file is older than max_age_days.

    Returns:
        (is_expired, age_days): Tuple with expiration status and age in days
    """
    if not cache_file.exists():
        return (True, float("inf"))

    file_mtime = datetime.fromtimestamp(cache_file.stat().st_mtime, tz=timezone.utc)
    now = datetime.now(timezone.utc)
    age_days = (now - file_mtime).total_seconds() / 86400.0

    is_expired = age_days > max_age_days
    return (is_expired, age_days)


def check_iers_predictive_data_age(
    iers_table, max_age_days: float = 30.0
) -> Tuple[bool, float]:
    """
    Check if IERS table predictive data is older than max_age_days.

    The IERS table contains both historical and predictive data.
    We check the last date in the table to see how far into the future it predicts.

    Returns:
        (is_expired, days_until_expiry): Tuple with expiration status and days until expiry
    """
    try:
        # Get the last MJD (Modified Julian Date) from the table
        # This represents the last date for which we have data
        last_mjd = iers_table["MJD"].max()

        # Convert MJD to datetime
        from astropy.time import Time

        last_time = Time(last_mjd, format="mjd")
        last_date = last_time.datetime

        # Calculate days until this data expires (how far into the future it predicts)
        now = datetime.now(timezone.utc)
        days_until_expiry = (
            last_date.replace(tzinfo=timezone.utc) - now
        ).total_seconds() / 86400.0

        # If predictive data covers less than max_age_days, we should update
        is_expired = days_until_expiry < max_age_days

        return (is_expired, days_until_expiry)
    except Exception as e:
        # If we can't check, assume expired to be safe
        return (True, 0.0)


def warm_astropy_cache(
    cache_dir: Path,
    logger: logging.Logger,
    force_update: bool = False,
    max_age_days: float = 30.0,
) -> bool:
    """
    Warm Astropy IERS cache by downloading finals2000A.all.

    NÃO manipula arquivos internos do astropy manualmente.
    O astropy gere o seu próprio cache (download/url/{hash}/contents).
    Para forçar refresh, apaga-se o diretório inteiro e deixa-se o astropy
    recriar tudo — sem backups manuais, sem renomeações frágeis.

    Args:
        cache_dir: Directory where cache should be stored
        logger: Logger instance
        force_update: If True, force update even if cache exists and is recent
        max_age_days: Maximum age (in days) before cache is considered expired
    """
    try:
        # Configure environment variables BEFORE importing Astropy
        # Astropy reads these variables at import time
        os.environ["XDG_CACHE_HOME"] = str(cache_dir)
        os.environ["ASTROPY_CACHE_DIR"] = str(cache_dir / "astropy")

        astropy_cache_dir = cache_dir / "astropy"
        astropy_cache_dir.mkdir(parents=True, exist_ok=True)
        logger.info(f"Warming Astropy cache in: {astropy_cache_dir}")

        # Import Astropy AFTER setting environment variables
        import astropy.config as config
        from astropy.utils.iers import IERS_Auto

        actual_cache_dir = Path(config.get_cache_dir())

        # Se force_update ou cache expirado, apagar o cache antigo por completo.
        # O astropy recria a estrutura interna corretamente no IERS_Auto.open().
        if force_update:
            if astropy_cache_dir.exists():
                import shutil

                logger.info("Force update: removing entire astropy cache directory.")
                shutil.rmtree(str(astropy_cache_dir), ignore_errors=True)
                astropy_cache_dir.mkdir(parents=True, exist_ok=True)
        else:
            # Verificar idade do cache apenas pelo ficheiro mais recente >= 1MB
            download_dir = actual_cache_dir / "download"
            if download_dir.exists():
                all_files = [f for f in download_dir.rglob("*") if f.is_file()]
                large_files = [f for f in all_files if f.stat().st_size > 1_000_000]
                if large_files:
                    cache_file = large_files[0]
                    is_expired, age_days = check_cache_age(cache_file, max_age_days)
                    logger.info(
                        f"IERS cache exists ({cache_file.stat().st_size} bytes, "
                        f"age: {age_days:.1f} days)"
                    )
                    if not is_expired:
                        # Carregar a tabela para verificar predictive data age
                        try:
                            iers_table = IERS_Auto.open()
                            predictive_expired, days_until = (
                                check_iers_predictive_data_age(iers_table, max_age_days)
                            )
                            if not predictive_expired:
                                logger.info(
                                    f"IERS cache still valid (predictive data: "
                                    f"{days_until:.1f} days). Skipping download."
                                )
                                return True
                            logger.warning(
                                f"IERS predictive data expires in {days_until:.1f} days, "
                                f"will update."
                            )
                        except Exception as e:
                            logger.warning(
                                f"Could not load existing IERS cache: {e}. Will re-download."
                            )
                    else:
                        logger.warning(
                            f"IERS cache expired (>{max_age_days} days), will update."
                        )
                    # Remover cache antigo para forçar re-download limpo
                    if astropy_cache_dir.exists():
                        import shutil

                        logger.info("Removing old astropy cache for clean re-download.")
                        shutil.rmtree(str(astropy_cache_dir), ignore_errors=True)
                        astropy_cache_dir.mkdir(parents=True, exist_ok=True)

        # IERS_Auto.open() gere o download e cache internamente.
        # Não há manipulação manual de ficheiros — o astropy faz tudo.
        iers_table = IERS_Auto.open()
        logger.info(f"IERS table loaded. Length: {len(iers_table)}")

        # Check predictive data age (how far into the future the data predicts)
        predictive_expired, days_until_expiry = check_iers_predictive_data_age(
            iers_table, max_age_days
        )
        if predictive_expired:
            logger.warning(
                f"IERS predictive data expires in {days_until_expiry:.1f} days "
                f"(less than {max_age_days} days) - consider updating cache"
            )
        else:
            logger.info(
                f"IERS predictive data valid for {days_until_expiry:.1f} more days"
            )

        logger.info("Astropy IERS cache warming completed successfully.")
        return True

    except Exception as e:
        logger.error(f"Astropy cache warming failed: {e}")
        import traceback

        logger.debug(traceback.format_exc())
        return False


def main():
    parser = argparse.ArgumentParser(description="Warm cache for pipeline dependencies")
    parser.add_argument("--cache-dir", help="Directory where cache should be stored")
    parser.add_argument(
        "--skip-astropy", action="store_true", help="Skip Astropy cache warming"
    )
    parser.add_argument("--debug", action="store_true", help="Enable debug logging")
    parser.add_argument(
        "--force-update",
        action="store_true",
        help="Force update of IERS cache even if it exists and is recent",
    )
    parser.add_argument(
        "--max-age-days",
        type=float,
        default=15.0,
        help="Maximum age (in days) before cache is considered expired (default: 15.0)",
    )

    args = parser.parse_args()

    # Get standardized logger
    logger = get_cache_logger()
    if args.debug:
        logger.setLevel(logging.DEBUG)

    # Determine cache directory
    if args.cache_dir:
        cache_dir = Path(args.cache_dir)
    else:
        # Default based on environment
        parsl_env = os.getenv("PARSL_ENV", "local")
        if parsl_env == "linea":
            # For linea: use REMOTE_PIPELINE_ROOT if available
            remote_root = os.getenv("REMOTE_PIPELINE_ROOT")
            if remote_root:
                cache_dir = Path(remote_root) / "cache"
            else:
                cache_dir = Path("/app/cache")  # fallback
        else:
            # For local: use /app/cache inside container
            cache_dir = Path("/app/cache")

    logger.info(f"Starting cache warming for: {cache_dir}")

    try:
        cache_dir.mkdir(parents=True, exist_ok=True)
    except (PermissionError, OSError) as e:
        if cache_dir.exists():
            logger.warning(
                f"Cache directory {cache_dir} exists but is not writable: {e}. "
                "This may cause issues in 'linea' environment where cache is critical."
            )
        else:
            logger.error(f"Failed to create cache directory {cache_dir}: {e}")

    success = True
    if not args.skip_astropy:
        if not warm_astropy_cache(
            cache_dir,
            logger,
            force_update=args.force_update,
            max_age_days=args.max_age_days,
        ):
            logger.error("Astropy cache warming failed or incomplete")
            success = False
        else:
            logger.info("Astropy cache warming completed successfully")

    parsl_env = os.getenv("PARSL_ENV", "local")

    if success:
        logger.info("Cache warming completed successfully")
    else:
        if parsl_env == "linea":
            logger.error("Cache warming FAILED for 'linea' environment!")
            logger.error(
                "This is CRITICAL - workers cannot download IERS without cache."
            )
        else:
            logger.warning(
                "Cache warming completed with warnings (non-critical for local)"
            )

    for handler in logger.handlers[:]:
        handler.flush()
        handler.close()

    return 0 if success else (1 if parsl_env == "linea" else 0)


if __name__ == "__main__":
    sys.exit(main())
