from django.core.management.base import BaseCommand
from predict_occultation.workers.submit_worker import submit_worker

class Command(BaseCommand):
    help = "Worker responsável por submissão ao cluster"

    def add_arguments(self, parser):
        parser.add_argument("--interval", type=float, default=2.0, help="Intervalo de polling (s)")
        parser.add_argument("--batch", type=int, default=5, help="Número máximo de tasks por loop")

    def handle(self, *args, **options):
        interval = options["interval"]
        batch = options["batch"]
        submit_worker(interval, batch)

