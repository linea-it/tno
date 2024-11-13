from datetime import datetime, timezone

from django.core.management.base import BaseCommand
from newsletter.events_send_mail import SendEventsMail
from newsletter.models.event_filter import EventFilter
from newsletter.models.subscription import Subscription
from newsletter.newsletter_send_mail import NewsletterSendEmail
from newsletter.process_event_filter import ProcessEventFilters


class Command(BaseCommand):
    help = (
        "Executa os filtros de acordo com as preferencias do usuario e envia os emails."
    )

    def add_arguments(self, parser):
        parser.add_argument(
            "--local",
            action="store_true",
            dest="local",
            default=False,
            help="Dispara a função que executa os filtros e a função que envia os emails",
        )

        parser.add_argument(
            "task",
            help="Define qual funçao sera executada.",
        )

    def handle(self, *args, **kwargs):
        pef = ProcessEventFilters(stdout=True)

        sem = SendEventsMail(stdout=True)

        task = kwargs["task"]

        # passa o periodo no parametro
        # 1 para monthly, 2 para weekly
        if task == "run_filter":
            pef.run_filter(frequency=1, date_start="2024-11-01 00:00:00-03:00")

        if task == "send_mail":
            sem.exec_send_mail(
                date_start="2024-11-01 00:00:00", date_end="2024-12-01 00:00:00"
            )
