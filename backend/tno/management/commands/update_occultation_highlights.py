from datetime import datetime, timezone

from django.core.management.base import BaseCommand
from tno.models import Highlights
from tno.tasks import update_occultations_highlights


class Command(BaseCommand):
    help = "Updates the occultation highlights table data."

    def handle(self, *args, **options):
        self.stdout.write("Running the update of the occultation highlights table.")
        self.stdout.write("more details in the occ_highlights.log log")

        highlight_id = update_occultations_highlights()

        record = Highlights.objects.get(pk=highlight_id)
        self.stdout.write(f"Highlight ID: {record.id}")
        self.stdout.write(f"Month Count: {record.month_count}")
        self.stdout.write(f"Next Month Count: {record.next_month_count}")
        self.stdout.write(f"Week Count: {record.week_count}")
        self.stdout.write(f"Next Week Count: {record.next_week_count}")
        self.stdout.write(f"Day Count: {record.day_count}")
        self.stdout.write(f"Unique Asteroids: {record.unique_asteroids}")
        self.stdout.write(f"Occultations Count: {record.occultations_count}")
        self.stdout.write(f"Earliest Occultation: {record.earliest_occultation}")
        self.stdout.write(f"Latest Occultation: {record.latest_occultation}")

        self.stdout.write("Finished the update of the occultation highlights table.")
