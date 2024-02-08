from datetime import datetime, timezone

from celery import group
from django.core.management.base import BaseCommand
from tno.tasks import (
    create_occ_map_task,
    prediction_maps_log_error,
    upcoming_events_to_create_maps,
)


class Command(BaseCommand):
    help = "Create Occultation Maps by Period."

    def add_arguments(self, parser):
        # Named (optional) arguments
        parser.add_argument(
            "start",
            help="Start Data in format YYYY-MM-DD",
        )
        parser.add_argument(
            "--end",
            default=None,
            help="End Data in format YYYY-MM-DD",
        )

        parser.add_argument(
            "--limit",
            default=1000,
            type=int,
            help="Maximum number of jobs to be submitted, default is 1000",
        )

    def handle(self, *args, **options):

        start = datetime.strptime(options["start"], "%Y-%m-%d").astimezone(
            tz=timezone.utc
        )
        end = (
            datetime.strptime(options.get("end"), "%Y-%m-%d")
            .replace(hour=23, minute=59, second=59)
            .astimezone(tz=timezone.utc)
            if options.get("end", None) != None
            else None
        )
        limit = options["limit"]

        if end == None:
            self.stdout.write(
                f"Submitting background tasks to create occultation maps for date {start}"
            )
        else:
            self.stdout.write(
                f"Submitting background tasks to create occultation maps for period {start} to {end}"
            )

        to_run = upcoming_events_to_create_maps(start, end, limit)
        self.stdout.write(f"Tasks to be executed in this block: [{len(to_run)}].")

        # Celery tasks signature
        header = [create_occ_map_task.s(**i) for i in to_run]
        job = group(header)
        job.link_error(prediction_maps_log_error.s())

        results = job.apply_async()
        self.stdout.write(f"All [{len(results)}] subtasks are submited.")
