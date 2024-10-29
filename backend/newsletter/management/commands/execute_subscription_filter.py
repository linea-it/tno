from datetime import datetime, timezone

from django.core.management.base import BaseCommand
from newsletter.process_event_filter import ProcessEventFilters


class Command(BaseCommand):
    help = "Executa os filtros de acordo com as preferencias do usuario."

    def add_arguments(self, parser):
        parser.add_argument(
            "--local",
            action="store_true",
            dest="local",
            default=False,
            help="Does not download the files, uses the local files in /data/asteroid_table",
        )

    def handle(self, *args, **options):
        atm = ProcessEventFilters(stdout=True)
        # passa o periodo no parametro
        # 1 para monthly, 2 para weekly
        atm.run_filter(1)
