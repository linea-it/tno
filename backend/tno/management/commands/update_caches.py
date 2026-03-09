"""
Update caches used by the application (Astropy IERS, Cartopy).

Run on the server (e.g. Linea) with network access to refresh caches outside the build.
Example: python manage.py update_caches --force-update

Use the same CACHE_DIR as the pipeline so workers (predict_occultation) see the updated IERS data.
"""

import logging
import os
from pathlib import Path

from django.core.management.base import BaseCommand
from warm_cache import get_cache_logger, warm_astropy_cache, warm_cartopy_cache


class Command(BaseCommand):
    help = (
        "Update Astropy IERS and/or Cartopy caches. "
        "Use on the server (with network) to refresh caches outside the Docker build."
    )

    def add_arguments(self, parser):
        parser.add_argument(
            "--cache-dir",
            type=str,
            default=None,
            help="Cache base directory (default: CACHE_DIR env or /app/cache)",
        )
        parser.add_argument(
            "--skip-cartopy",
            action="store_true",
            help="Skip Cartopy cache update",
        )
        parser.add_argument(
            "--skip-astropy",
            action="store_true",
            help="Skip Astropy IERS cache update",
        )
        parser.add_argument(
            "--force-update",
            action="store_true",
            help="Force update even if cache exists and is recent",
        )
        parser.add_argument(
            "--max-age-days",
            type=float,
            default=30.0,
            help="Consider cache expired after this many days (default: 30)",
        )

    def handle(self, *args, **options):
        # Reduce noise from third-party libs (matplotlib, GDAL, Fiona, Cartopy)
        for name in ("matplotlib", "fiona", "cartopy", "shapely", "urllib3"):
            log = logging.getLogger(name)
            if log.level == logging.DEBUG:
                log.setLevel(logging.INFO)

        cache_dir = options.get("cache_dir")
        if cache_dir is None:
            cache_dir = os.environ.get("CACHE_DIR", "/app/cache")
        cache_dir = Path(cache_dir)

        logger = get_cache_logger()
        self.stdout.write(f"Updating caches in: {cache_dir}")
        try:
            cache_dir.mkdir(parents=True, exist_ok=True)
        except (PermissionError, OSError) as e:
            self.stderr.write(self.style.WARNING(f"Cache dir: {e}"))

        success = True
        if not options["skip_cartopy"]:
            if warm_cartopy_cache(
                logger,
                force_update=options["force_update"],
                max_age_days=options["max_age_days"],
            ):
                self.stdout.write(self.style.SUCCESS("Cartopy cache updated."))
            else:
                self.stderr.write(
                    self.style.ERROR("Cartopy cache update failed or incomplete.")
                )
                success = False

        if not options["skip_astropy"]:
            if warm_astropy_cache(
                cache_dir,
                logger,
                force_update=options["force_update"],
                max_age_days=options["max_age_days"],
            ):
                self.stdout.write(self.style.SUCCESS("Astropy IERS cache updated."))
            else:
                self.stderr.write(
                    self.style.ERROR("Astropy IERS cache update failed or incomplete.")
                )
                success = False

        if success:
            self.stdout.write(
                self.style.SUCCESS("All requested caches updated successfully.")
            )
        else:
            self.stdout.write(self.style.WARNING("Cache update finished with errors."))
