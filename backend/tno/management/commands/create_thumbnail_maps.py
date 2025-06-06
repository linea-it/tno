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
        parser.add_argument(
            "--start", default=None, help="Start Date in format YYYY-MM-DD"
        )
        parser.add_argument("--end", default=None, help="End Date in format YYYY-MM-DD")
        parser.add_argument(
            "--limit",
            default=1000,
            type=int,
            help="Maximum number of jobs to be submitted, default is 1000",
        )
        parser.add_argument("--mag", default=16, type=float, help="Magnitude limit")

    def handle(self, *args, **options):

        start_date = options.get("start")
        end_date = options.get("end")
        if end_date:
            end_date = end_date + " 23:59:59.999"
        limit = options.get("limit", 1000)
        mag = options.get("mag", 16)
        to_run = upcoming_events_to_create_maps(start_date, end_date, mag, limit)
        self.stdout.write(f"Tasks to be executed in this block: [{len(to_run)}].")

        # Celery tasks signature
        header = [create_occ_map_task.s(**i) for i in to_run]
        job = group(header)
        job.link_error(prediction_maps_log_error.s())

        results = job.apply_async(queue="thumbnails")
        self.stdout.write(f"All [{len(results)}] subtasks are submitted.")
