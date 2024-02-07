from django.core.management.base import BaseCommand
from datetime import datetime, timezone
from tno.tasks import garbage_collector
from celery import group


class Command(BaseCommand):
    help = "Run Garbage Collector."

    def handle(self, *args, **options):

        self.stdout.write("Running garbage collector.")
        self.stdout.write("For monitoring use garbage_collector.log in log directory")
        garbage_collector()
        self.stdout.write("Done")
