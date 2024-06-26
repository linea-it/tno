import datetime

from django.core.management.base import BaseCommand
from tno.predict_job import run_prediction_for_updated_asteroids


class Command(BaseCommand):
    help = "Creates prediction jobs for asteroids that have had their current orbit updated in the MPC."

    def add_arguments(self, parser):
        parser.add_argument(
            "--debug",
            action="store_true",
            dest="debug",
            default=False,
            help="Create the prediction job in debug mode",
        )

    def handle(self, *args, **options):
        run_prediction_for_updated_asteroids(debug=options.get("debug", False))
