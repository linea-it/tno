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
        parser.add_argument(
            "--name",
            default=None,
            type=str,
            help="Filter by object name (case-insensitive, partial match).",
        )
        parser.add_argument(
            "--base_dynclass",
            default=None,
            type=str,
            help="Filter by dynamical class (case-insensitive, exact match).",
        )

    def handle(self, *args, **options):
        # Recupera os argumentos existentes
        start_date = options.get("start")
        end_date = options.get("end")
        if end_date:
            end_date = end_date + " 23:59:59.999"
        limit = options.get("limit", 1000)
        mag = options.get("mag", 16)

        name = options.get("name")
        base_dynclass = options.get("base_dynclass")

        self.stdout.write("Fetching events with the following filters:")
        self.stdout.write(
            f"  - Date Range: {start_date or 'Now'} to {end_date or 'Now + 1 day'}"
        )
        self.stdout.write(f"  - Max Magnitude: {mag}")
        if name:
            self.stdout.write(f"  - Name contains: '{name}'")
        if base_dynclass:
            self.stdout.write(f"  - Base Class is: '{base_dynclass}'")

        # Usar argumentos nomeados (keyword arguments) torna a chamada mais clara e segura.
        to_run = upcoming_events_to_create_maps(
            date_start=start_date,
            date_end=end_date,
            mag=mag,
            limit=limit,
            name=name,
            base_dynclass=base_dynclass,
        )

        self.stdout.write(f"Tasks to be executed in this block: [{len(to_run)}].")
        if not to_run:
            self.stdout.write("No tasks to run. Exiting.")
            return

        header = [create_occ_map_task.s(**i) for i in to_run]
        job = group(header)
        job.link_error(prediction_maps_log_error.s())
        results = job.apply_async(queue="thumbnails")
        self.stdout.write(f"All [{len(results)}] subtasks are submitted.")
