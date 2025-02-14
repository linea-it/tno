from datetime import datetime, timezone

from django.core.management.base import BaseCommand
from tno.models import Highlights
from tno.tasks import update_unique_asteroids


class Command(BaseCommand):
    help = "Updates the unique asteroids cache table."

    def handle(self, *args, **options):
        self.stdout.write(
            "Running the update of the unique asteroids with occultation."
        )
        self.stdout.write("more details in the asteroid_cache.log log")

        update_unique_asteroids()

        self.stdout.write("Finished the update of the tno_asteroidcache table.")
