#!/usr/bin/env python3
"""
Cache warming script for Cartopy map data.
Runs in the container (with internet access) before Django/Celery workers start.
Logs to /logs/cache.log (inside container).
"""

import argparse
import logging
import os
import sys
from datetime import datetime, timezone
from pathlib import Path
from typing import Tuple

try:
    import colorlog
except ImportError:
    # Fallback if colorlog is not available
    colorlog = None


class FlushFileHandler(logging.FileHandler):
    """File handler that flushes immediately after each log."""

    def emit(self, record):
        super().emit(record)
        self.flush()


def get_cache_logger():
    """Get standardized logger for cache operations."""
    # Try /logs first (container standard)
    log_dir = Path("/logs")
    logfile = log_dir / "cache.log"

    # If /logs doesn't exist or isn't writable, use cache directory
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

    # Console handler with colors (if available)
    if colorlog:
        console_formatter = colorlog.ColoredFormatter(
            "%(log_color)s%(asctime)s [%(levelname)s] %(message)s",
            datefmt="%Y-%m-%d %H:%M:%S",
        )
        console_handler = colorlog.StreamHandler(sys.stdout)
    else:
        console_formatter = logging.Formatter(
            "%(asctime)s [%(levelname)s] %(message)s",
            datefmt="%Y-%m-%d %H:%M:%S",
        )
        console_handler = logging.StreamHandler(sys.stdout)
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


def warm_cartopy_cache(
    logger: logging.Logger,
    force_update: bool = False,
    max_age_days: float = 30.0,
) -> bool:
    """
    Warm Cartopy cache by downloading Natural Earth data and map features.
    Uses Cartopy's default data directory (no custom location - the library
    always downloads to its own default path).

    Args:
        logger: Logger instance
        force_update: If True, force update even if cache exists and is recent
        max_age_days: Maximum age (in days) before cache is considered expired
    """
    try:
        # Definir CARTOPY_DATA_DIR antes do primeiro import para que o Cartopy
        # grave os downloads neste diretório (e a verificação encontre os arquivos)
        cartopy_cache_dir = Path(os.path.expanduser("~/.local/share/cartopy"))
        os.environ["CARTOPY_DATA_DIR"] = str(cartopy_cache_dir)

        import cartopy
        import cartopy.crs as ccrs
        import cartopy.feature as cfeature
        import matplotlib

        logger.info(f"Warming Cartopy cache: {cartopy_cache_dir}")

        # Garantir que o diretório existe antes de escrever (ex.: .warm_cache_temp.png)
        try:
            cartopy_cache_dir.mkdir(parents=True, exist_ok=True)
        except (PermissionError, OSError) as e:
            logger.warning(
                f"Could not create Cartopy cache dir {cartopy_cache_dir}: {e}. "
                "Cartopy may create it on first download."
            )

        matplotlib.use("Agg")

        natural_earth_dir = cartopy_cache_dir / "natural_earth"
        cache_exists = natural_earth_dir.exists() and any(natural_earth_dir.rglob("*"))
        is_expired = True
        age_days = 0.0

        if cache_exists:
            # Find the most recent file to check age
            all_files = [f for f in cartopy_cache_dir.rglob("*") if f.is_file()]
            if all_files:
                # Get the most recent file
                most_recent_file = max(all_files, key=lambda f: f.stat().st_mtime)
                is_expired, age_days = check_cache_age(most_recent_file, max_age_days)

                logger.info(
                    f"Cache already exists: {len(all_files)} files found (most recent: {age_days:.1f} days old)"
                )

                if force_update:
                    logger.info(
                        "Force update requested - will download latest Cartopy data"
                    )
                elif is_expired:
                    logger.warning(
                        f"Cache is expired (age: {age_days:.1f} days > {max_age_days} days) - will update"
                    )
                else:
                    logger.info(
                        f"Cache is still valid (age: {age_days:.1f} days <= {max_age_days} days)"
                    )
                    logger.info("Verifying cache by accessing Cartopy features...")
                    try:
                        ax = matplotlib.pyplot.figure(figsize=(1, 1)).add_subplot(
                            111, projection=ccrs.PlateCarree()
                        )
                        ax.add_feature(cfeature.COASTLINE.with_scale("110m"))
                        ax.add_feature(cfeature.BORDERS.with_scale("110m"))
                        matplotlib.pyplot.close("all")
                        logger.info("Cache verification successful")
                        return True
                    except Exception as e:
                        logger.warning(f"Cache verification failed: {e}")
                        logger.info("Will re-download cache data")
            else:
                logger.info(
                    "Cache directory exists but no files found. Downloading Cartopy data..."
                )
        else:
            logger.info("Cache directory does not exist. Downloading Cartopy data...")

        should_force_download = force_update or (cache_exists and is_expired)

        if should_force_download and cache_exists:
            logger.info("Removing old cache to force fresh download...")
            for item in cartopy_cache_dir.iterdir():
                if item.is_file():
                    item.unlink()
                elif item.is_dir():
                    import shutil

                    shutil.rmtree(item)

        logger.info("Downloading Cartopy Natural Earth data...")
        try:
            # Forçar download via shapereader (respeita CARTOPY_DATA_DIR); add_feature
            # pode usar outro path. Chamar natural_earth() grava em data_dir/shapefiles/natural_earth/
            import cartopy.io.shapereader as shpreader

            datasets = [
                ("110m", "physical", "coastline"),
                ("110m", "physical", "land"),
                ("110m", "physical", "ocean"),
                ("110m", "cultural", "admin_0_countries"),
                ("50m", "physical", "coastline"),
                ("50m", "cultural", "admin_0_countries"),
                ("10m", "physical", "coastline"),
            ]
            for resolution, category, name in datasets:
                try:
                    path = shpreader.natural_earth(
                        resolution=resolution, category=category, name=name
                    )
                    logger.info(f"Downloaded {resolution} {category}/{name} -> {path}")
                except Exception as e:
                    logger.warning(f"Failed {resolution} {category}/{name}: {e}")

            import matplotlib.pyplot as plt

            fig = plt.figure(figsize=(8, 6))
            ax = fig.add_subplot(111, projection=ccrs.PlateCarree())
            ax.add_feature(cfeature.COASTLINE.with_scale("110m"), linewidth=0.5)
            ax.add_feature(cfeature.BORDERS.with_scale("110m"), linewidth=0.5)
            ax.add_feature(cfeature.LAND.with_scale("110m"), alpha=0.5)
            ax.add_feature(cfeature.OCEAN.with_scale("110m"), alpha=0.5)
            ax.set_global()

            temp_file = cartopy_cache_dir / ".warm_cache_temp.png"
            plt.savefig(temp_file, dpi=50, bbox_inches="tight")
            plt.close("all")

            if temp_file.exists():
                temp_file.unlink()

            logger.info("Cartopy data download completed")
        except Exception as e:
            logger.error(f"Failed to download Cartopy data: {e}")
            import traceback

            logger.debug(traceback.format_exc())
            return False

        # Verify cache after download (Cartopy uses its default dir)
        if cartopy_cache_dir.exists():
            all_files = [f for f in cartopy_cache_dir.rglob("*") if f.is_file()]
            if all_files:
                total_size = sum(f.stat().st_size for f in all_files)
                logger.info(
                    f"Cache verified in {cartopy_cache_dir}: {len(all_files)} files ({total_size / 1024 / 1024:.2f} MB)"
                )
                return True

        logger.warning("Cache files not found in expected location after download")
        if cartopy_cache_dir.exists():
            logger.info(
                f"Directory {cartopy_cache_dir} contains: {list(cartopy_cache_dir.iterdir())}"
            )
        return False

    except Exception as e:
        logger.error(f"Cartopy cache warming failed: {e}")
        import traceback

        logger.debug(traceback.format_exc())
        return False


def main():
    parser = argparse.ArgumentParser(description="Warm cache for backend dependencies")
    parser.add_argument("--cache-dir", help="Directory where cache should be stored")
    parser.add_argument(
        "--skip-cartopy", action="store_true", help="Skip Cartopy cache warming"
    )
    parser.add_argument("--debug", action="store_true", help="Enable debug logging")
    parser.add_argument(
        "--force-update",
        action="store_true",
        help="Force update of Cartopy cache even if it exists and is recent",
    )
    parser.add_argument(
        "--max-age-days",
        type=float,
        default=30.0,
        help="Maximum age (in days) before cache is considered expired (default: 30.0)",
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
        # Default to /app/cache inside container
        cache_dir_env = os.getenv("CACHE_DIR")
        if cache_dir_env:
            cache_dir = Path(cache_dir_env)
        else:
            cache_dir = Path("/app/cache")

    logger.info(f"Starting cache warming for: {cache_dir}")

    try:
        cache_dir.mkdir(parents=True, exist_ok=True)
    except (PermissionError, OSError) as e:
        if cache_dir.exists():
            logger.warning(
                f"Cache directory {cache_dir} exists but is not writable: {e}. "
                "Cartopy will download data to a writable location at runtime if needed."
            )
        else:
            logger.warning(f"Failed to create cache directory {cache_dir}: {e}")

    success = True
    if not args.skip_cartopy:
        if not warm_cartopy_cache(
            logger,
            force_update=args.force_update,
            max_age_days=args.max_age_days,
        ):
            logger.error("Cartopy cache warming failed or incomplete")
            success = False
        else:
            logger.info("Cartopy cache warming completed successfully")

    if success:
        logger.info("Cache warming completed successfully")
    else:
        logger.warning("Cache warming completed with warnings")

    for handler in logger.handlers[:]:
        handler.flush()
        handler.close()

    return 0


if __name__ == "__main__":
    sys.exit(main())
