from django.core.management.base import BaseCommand
from datetime import datetime, timezone
from tno.tasks import calculate_occultation_path
from celery import group
from tno.models import Occultation


class Command(BaseCommand):
    help = "Create Occultation Paths Coeff by Period."

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
        parser.add_argument(
            "--force",
            default=False,
            type=bool,
            help="Creates the path by overwriting previous results",
        )

        parser.add_argument(
            "--id",
            default=None,
            type=int,
            help="Run only for select ID",
        )

    def handle(self, *args, **options):

        if options["id"] != None:
            to_run = [Occultation.objects.get(pk=options["id"])]
            self.stdout.write(
                f"Submitting background tasks to create occultation paths for id {options['id']}"
            )
            limit = 1
        else:
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
                    f"Submitting background tasks to create occultation paths for date {start}"
                )
            else:
                self.stdout.write(
                    f"Submitting background tasks to create occultation paths for period {start} to {end}"
                )

            to_run = Occultation.objects.filter(date_time__gte=start).order_by(
                "date_time"
            )
            if end != None:
                to_run.filter(date_time__lte=end)
            if options["force"] == False:
                to_run.filter(have_path_coeff=False)

        self.stdout.write(f"Events to run [{len(to_run)}].")
        job = group(
            calculate_occultation_path.s(
                occultation_id=event.id,
                date_time=event.date_time.isoformat(),
                ra_star_candidate=event.ra_star_candidate,
                dec_star_candidate=event.dec_star_candidate,
                closest_approach=event.closest_approach,
                position_angle=event.position_angle,
                velocity=event.velocity,
                delta_distance=event.delta,
                offset_ra=event.off_ra,
                offset_dec=event.off_dec,
                object_diameter=event.diameter,
                ring_radius=None,
            )
            for event in to_run[0:limit]
        )

        # Submete as tasks aos workers
        results = job.apply_async()

        self.stdout.write(f"All [{len(results)}] subtasks are submited.")
        self.stdout.write("For monitoring use celery*.log in log directory")
