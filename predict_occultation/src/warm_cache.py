#!/usr/bin/env python3
"""
Cache warming script for Astropy IERS data.
Runs in the container (with internet access) before workers start.
Logs to /app/logs/cache.log (inside container).
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
    logfile = log_dir / "cache.log"

    # If /app/logs doesn't exist or isn't writable, use cache directory
    if not log_dir.exists() or not os.access(log_dir, os.W_OK):
        cache_dir_env = os.getenv("CACHE_DIR")
        if cache_dir_env:
            log_dir = Path(cache_dir_env)
        else:
            log_dir = Path("/tmp")
        logfile = log_dir / "cache.log"

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

        # Check if cache already exists before attempting to load
        actual_cache_dir = Path(config.get_cache_dir())
        download_dir = actual_cache_dir / "download"
        cache_exists = False
        is_expired = True  # Default to expired if cache doesn't exist
        age_days = 0.0
        large_files = []

        if download_dir.exists():
            # Find IERS file (typically > 1MB)
            all_files = [f for f in download_dir.rglob("*") if f.is_file()]
            large_files = [f for f in all_files if f.stat().st_size > 1000000]

            if large_files:
                cache_file = large_files[0]
                file_size = cache_file.stat().st_size
                cache_exists = True

                # Check cache age
                is_expired, age_days = check_cache_age(cache_file, max_age_days)

                logger.info(
                    f"Cache already exists: {cache_file.relative_to(actual_cache_dir)} ({file_size} bytes, age: {age_days:.1f} days)"
                )

                if force_update:
                    logger.info(
                        "Force update requested - will download latest IERS data"
                    )
                elif is_expired:
                    logger.warning(
                        f"Cache is expired (age: {age_days:.1f} days > {max_age_days} days) - will update"
                    )
                else:
                    logger.info(
                        f"Cache is still valid (age: {age_days:.1f} days <= {max_age_days} days)"
                    )
                    logger.info("Loading IERS data from existing cache...")
            else:
                logger.info(
                    "Cache directory exists but no IERS file found. Downloading IERS data (finals2000A.all)..."
                )
        else:
            logger.info(
                "Cache directory does not exist. Downloading IERS data (finals2000A.all)..."
            )

        # Determine if we should force download
        should_force_download = force_update or (cache_exists and is_expired)

        # Store old cache file path for fallback (don't delete until new one is confirmed)
        old_cache_file = None
        if should_force_download and cache_exists and large_files:
            old_cache_file = large_files[0]
            logger.info(
                f"Cache update needed - will verify new download before removing old cache"
            )
            logger.info(f"Old cache file: {old_cache_file.name} (kept as fallback)")

        # IERS_Auto.open() will use existing cache if available, or download if not
        # If we need to force update, we'll need to clear the cache AFTER successful download
        if should_force_download:
            logger.info("Forcing IERS data update...")
            # Temporarily rename old cache to force download, but keep it as backup
            if old_cache_file and old_cache_file.exists():
                backup_file = old_cache_file.with_suffix(
                    old_cache_file.suffix + ".backup"
                )
                logger.info(f"Temporarily backing up old cache to: {backup_file.name}")
                old_cache_file.rename(backup_file)
                old_cache_file = backup_file  # Update reference to backup file

        # Try to download/load IERS data
        try:
            iers_table = IERS_Auto.open()
            logger.info(f"IERS table loaded. Length: {len(iers_table)}")
        except Exception as e:
            # If download fails and we have a backup, restore it
            if old_cache_file and old_cache_file.exists():
                logger.error(f"Failed to load/update IERS data: {e}")
                logger.warning("Restoring old cache file as fallback...")
                # Restore backup
                original_name = old_cache_file.with_suffix("")
                if old_cache_file.suffix == ".backup":
                    old_cache_file.rename(original_name)
                    logger.info(f"Old cache restored: {original_name.name}")
                    # Try loading again with restored cache
                    iers_table = IERS_Auto.open()
                    logger.info(
                        f"IERS table loaded from restored cache. Length: {len(iers_table)}"
                    )
                else:
                    raise
            else:
                raise

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

        # Verify cache after loading
        if download_dir.exists():
            # Find IERS file (typically > 1MB)
            all_files = [f for f in download_dir.rglob("*") if f.is_file()]
            large_files = [f for f in all_files if f.stat().st_size > 1000000]

            if large_files:
                cache_file = large_files[0]
                file_size = cache_file.stat().st_size

                # If we successfully downloaded new cache, remove old backup
                # Only remove backup if we have a NEW cache file (not the backup itself)
                if (
                    old_cache_file
                    and old_cache_file.exists()
                    and old_cache_file.suffix == ".backup"
                ):
                    # Verify new cache is different from old one (by checking it's not the backup)
                    if cache_file != old_cache_file:
                        logger.info(
                            f"New cache verified successfully. Removing old backup: {old_cache_file.name}"
                        )
                        old_cache_file.unlink()
                        logger.info(f"Old cache backup removed successfully")
                    else:
                        logger.warning(
                            "New cache file is same as backup - keeping backup as fallback"
                        )

                if cache_exists and not should_force_download:
                    logger.info(
                        f"Cache verified: {cache_file.relative_to(actual_cache_dir)} ({file_size} bytes)"
                    )
                elif should_force_download:
                    logger.info(
                        f"Cache updated: {cache_file.relative_to(actual_cache_dir)} ({file_size} bytes)"
                    )
                else:
                    logger.info(
                        f"Cache file created: {cache_file.relative_to(actual_cache_dir)} ({file_size} bytes)"
                    )
                return True
            else:
                # No cache file found after download attempt
                logger.warning(
                    f"No IERS files found in cache (found {len(all_files)} files total)"
                )
        else:
            # Download directory doesn't exist
            logger.warning(f"Download directory does not exist: {download_dir}")

        # If we have a backup and no new cache was found, restore it
        if (
            old_cache_file
            and old_cache_file.exists()
            and old_cache_file.suffix == ".backup"
        ):
            logger.warning("Restoring old cache file as fallback...")
            original_name = old_cache_file.with_suffix("")
            old_cache_file.rename(original_name)
            logger.info(f"Old cache restored: {original_name.name}")
            return True  # Return True because we have restored cache

        return False

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

    cache_dir.mkdir(parents=True, exist_ok=True)

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

    # Close all handlers to ensure logs are flushed to disk
    # This is critical to ensure logs are written even if the script exits quickly
    for handler in logger.handlers[:]:
        handler.flush()
        handler.close()

    return 0 if success else (1 if parsl_env == "linea" else 0)


if __name__ == "__main__":
    sys.exit(main())
