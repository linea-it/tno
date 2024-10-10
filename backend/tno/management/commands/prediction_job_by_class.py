import datetime

from django.core.management.base import BaseCommand
from tno.predict_job import run_prediction_by_class


class Command(BaseCommand):
    help = "Creates prediction jobs for asteroids that have had their current orbit updated in the MPC."

    def add_arguments(self, parser):
        """
        Adds command-line arguments to the parser for the run_prediction_by_class function.

        Args:
            parser (argparse.ArgumentParser): The argument parser instance.

        Returns:
            None
        """
        parser.add_argument(
            "--base_dynclass",
            type=str,
            default=None,
            help="Specify the base dynamical class of asteroids.",
        )
        parser.add_argument(
            "--sub_class",
            type=str,
            default=None,
            help="Specify the sub dynamical class of asteroids.",
        )
        parser.add_argument(
            "--start_date",
            type=str,
            default=None,
            help="Specify the start date for the prediction range (YYYY-MM-DD).",
        )
        parser.add_argument(
            "--end_date",
            type=str,
            default=None,
            help="Specify the end date for the prediction range (YYYY-MM-DD).",
        )
        parser.add_argument(
            "--chunk_size",
            type=int,
            default=2000,
            help="Specify the number of asteroids per prediction job chunk.",
        )
        parser.add_argument(
            "--debug",
            action="store_true",
            default=False,
            help="Enable debug mode for detailed output.",
        )

    def handle(self, *args, **options):
        run_prediction_by_class(
            base_dynclass=options.get("base_dynclass"),
            sub_class=options.get("sub_class"),
            start_date=options.get("start_date"),
            end_date=options.get("end_date"),
            chunk_size=options.get("chunk_size", 2000),
            debug=options.get("debug", False),
        )
