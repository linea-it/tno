from django.core.management.base import BaseCommand
from predict_occultation.models import PredictionTask
import random


class Command(BaseCommand):
    help = "Simula a inclusão de novas PredictionTasks"

    def add_arguments(self, parser):
        parser.add_argument("--count", type=int, default=5, help="Quantidade de tasks a criar")
        # parser.add_argument("--interval", type=float, default=2.0, help="Intervalo de polling (s)")
        # parser.add_argument("--batch", type=int, default=5, help="Número máximo de tasks por loop")

    def handle(self, *args, **options):
        count = options["count"]
        for i in range(count):
            priority = 100
            if random.random() < 0.2:  # 20% chance de ser alta prioridade
                priority = 500

            input_manifest = {
                "start_date": "2025-02-14",
                "end_date": "2025-03-14",
                "maximum_visual_magnitude": 18,
                "ephemeris_step": 60,
                "star_catalog": "gaia_dr3",
                "planetary_ephemeris": "de440",
                "leap_seconds":"naif0012"
            }

            task = PredictionTask.objects.create(
                # asteroid_id=f"AST-{i:04d}",
                asteroid_id = "2008 RH167",
                priority=priority,
                # workdir= "/data/outputs/process001",
                input_manifest= input_manifest,
            )
            self.stdout.write(self.style.SUCCESS(f"Task criada: {task}"))
