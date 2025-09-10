import time
from django.core.management.base import BaseCommand
from predict_occultation.models import PredictionTask, PredictionState
from predict_occultation.workflow import run_run_step
import django.db.models as models
from django.utils import timezone

class Command(BaseCommand):
    help = "Worker responsável por simular a execução no cluster"

    def add_arguments(self, parser):
        parser.add_argument("--interval", type=float, default=2.0, help="Intervalo de polling (s)")
        parser.add_argument("--batch", type=int, default=5, help="Número máximo de tasks por loop")

    def handle(self, *args, **options):
        interval = options["interval"]
        batch = options["batch"]

        self.stdout.write(self.style.SUCCESS("Iniciando simulação do cluster"))
        while True:
            self.stdout.write("-"*40)
            tasks = (
                PredictionTask.objects.filter(state=PredictionState.QUEUED, aborted=False)
                .filter(
                    models.Q(next_retry_at__isnull=True) | models.Q(next_retry_at__lte=timezone.now())
                )
                .order_by("-priority", "created_at")[:batch]
            )
            if not tasks.exists():
                self.stdout.write("No tasks found, sleeping...")
                time.sleep(interval)
                continue
            for task in tasks:
                self.stdout.write(f"Running run step for task [{task.id}] priority [{task.priority}] (asteroid {task.asteroid_id})")
                run_run_step(task)
