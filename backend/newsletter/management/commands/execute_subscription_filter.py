from datetime import datetime, timezone

from django.core.management.base import BaseCommand
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
            help="Dispara a função que executa os filtros; a função que envia os emails",
        )

        parser.add_argument(
            "task",
            help="One email addresses to send a test email to.",
        )

    def handle(self, *args, **kwargs):
        atm = ProcessEventFilters(stdout=True)

        task = kwargs["task"]

        if task == "run_filter":
            atm.run_filter(1)

        if task == "send_mail":
            atm.exec_send_mail()
        # passa o periodo no parametro
        # 1 para monthly, 2 para weekly
        # atm.run_filter(1)

        # email = kwargs["email"]

        # função que dispara os emails
        # atm.exec_send_mail()
