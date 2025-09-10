from django.core.management.base import BaseCommand
from predict_occultation.models import PredictionTask, PredictionState


class Command(BaseCommand):
    help = "Re-enfileira tasks que falharam ou foram abortadas"

    def add_arguments(self, parser):
        parser.add_argument("asteroid_id", nargs="+", help="ID(s) dos asteroids para retry")

    def handle(self, *args, **options):
        asteroid_ids = options["asteroid_id"]
        tasks = PredictionTask.objects.filter(asteroid_id__in=asteroid_ids)
        for task in tasks:
            if task.state in [PredictionState.FAILED, PredictionState.ABORTED]:
                task.retry()
                self.stdout.write(self.style.SUCCESS(f"Task {task.asteroid_id} reenfileirada"))
            else:
                self.stdout.write(f"Task {task.asteroid_id} não está em estado FAILED/ABORTED")
