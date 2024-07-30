import datetime

from django.core.management.base import BaseCommand
from tno.predict_job import run_predicition_for_upper_end_update


class Command(BaseCommand):
    help = "Create prediction jobs to complete the last three months whenever the distance between the current date and the last prediction is less than 1.25 years."

    def add_arguments(self, parser):
        parser.add_argument(
            "--debug",
            action="store_true",
            dest="debug",
            default=False,
            help="Create the prediction job in debug mode",
        )

    def handle(self, *args, **options):
        run_predicition_for_upper_end_update(debug=options.get("debug", False))
