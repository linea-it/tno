from django.core.management.base import BaseCommand
from predict_occultation.models import PredictionTask
import random


class Command(BaseCommand):
    help = "Simula a inclusão de novas PredictionTasks"

    def add_arguments(self, parser):
        parser.add_argument("--count", type=int, default=5, help="Quantidade de tasks a criar")

    def handle(self, *args, **options):
        count = options["count"]
        for i in range(count):
            priority = 100
            if random.random() < 0.2:  # 20% chance de ser alta prioridade
                priority = 500

            task = PredictionTask.objects.create(
                asteroid_id=f"AST-{i:04d}", priority=priority
            )
            self.stdout.write(self.style.SUCCESS(f"Task criada: {task}"))
