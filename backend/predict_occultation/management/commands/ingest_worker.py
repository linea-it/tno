from django.core.management.base import BaseCommand
from predict_occultation.workers.ingest_worker import ingest_worker

class Command(BaseCommand):
    help = "Worker responsável pela ingestão dos resultados"

    def add_arguments(self, parser):
        parser.add_argument("--interval", type=float, default=2.0, help="Intervalo de polling (s)")
        parser.add_argument("--batch", type=int, default=5, help="Número máximo de tasks por loop")

    def handle(self, *args, **options):
        interval = options["interval"]
        batch = options["batch"]
        ingest_worker(interval, batch)
        # self.stdout.write(self.style.SUCCESS("Iniciando ingest_worker..."))
        # while True:
        #     tasks = (
        #         PredictionTask.objects.filter(state=PredictionState.WAITING_RESULTS, aborted=False)
        #         .filter(
        #             models.Q(next_retry_at__isnull=True) | models.Q(next_retry_at__lte=timezone.now())
        #         )
        #         .order_by("-priority", "created_at")[:batch]
        #     )
        #     if not tasks.exists():
        #         time.sleep(interval)
        #         continue
        #     for task in tasks:
        #         run_ingest_step(task)
