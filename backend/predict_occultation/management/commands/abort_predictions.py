from django.core.management.base import BaseCommand
from predict_occultation.models import PredictionTask, PredictionState


class Command(BaseCommand):
    help = "Aborta tasks em andamento ou na fila"

    def add_arguments(self, parser):
        parser.add_argument("asteroid_id", nargs="+", help="ID(s) dos asteroids para abortar")

    def handle(self, *args, **options):
        asteroid_ids = options["asteroid_id"]
        tasks = PredictionTask.objects.filter(asteroid_id__in=asteroid_ids)
        for task in tasks:
            if task.state not in [PredictionState.DONE, PredictionState.ABORTED]:
                task.mark_aborted()
                self.stdout.write(self.style.WARNING(f"Task {task.asteroid_id} abortada"))
            else:
                self.stdout.write(f"Task {task.asteroid_id} já finalizada")
