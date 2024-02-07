from django.core.management.base import BaseCommand
from datetime import datetime, timezone

from tno.asteroid_table.asteroid_table_manager import AsteroidTableManager


class Command(BaseCommand):
    help = "Updates the asteroid table data using data downloaded from MPC."

    def handle(self, *args, **options):
        atm = AsteroidTableManager(stdout=True)
        atm.run_update_asteroid_table()
