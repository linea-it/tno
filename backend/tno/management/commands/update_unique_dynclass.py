from django.core.management.base import BaseCommand
from tno.tasks import update_unique_dynclass


class Command(BaseCommand):
    help = "Updates the unique dynclass and basedynclass cache table."

    def handle(self, *args, **options):
        self.stdout.write("Running the update of the unique dynclass with occultation.")
        self.stdout.write("more details in the asteroid_cache.log log")

        update_unique_dynclass()

        self.stdout.write("Finished the update of the tno_dynclasscache table.")
