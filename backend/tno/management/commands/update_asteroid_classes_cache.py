from django.core.management.base import BaseCommand
from tno.tasks import update_asteroid_classes_cache


class Command(BaseCommand):
    help = "Updates asteroid classes cache."

    def handle(self, *args, **options):

        update_asteroid_classes_cache()
