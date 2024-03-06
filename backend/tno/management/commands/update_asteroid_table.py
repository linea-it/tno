from datetime import datetime, timezone

from django.core.management.base import BaseCommand
from tno.asteroid_table.asteroid_table_manager import AsteroidTableManager


class Command(BaseCommand):
    help = "Updates the asteroid table data using data downloaded from MPC."

    def add_arguments(self, parser):
        parser.add_argument(
            "--local",
            action="store_true",
            dest="local",
            default=False,
            help="Does not download the files, uses the local files in /data/asteroid_table",
        )

    def handle(self, *args, **options):

        local = options.get("local", False)

        atm = AsteroidTableManager(stdout=True)
        atm.run_update_asteroid_table(use_local_files=local)
