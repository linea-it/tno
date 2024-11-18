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
            "--force_run",
            action="store_true",
            dest="force_run",
            default=False,
            help="Força a execução do filtro ignorando verificações padrão.",
        )
        parser.add_argument(
            "task",
            help="Define qual funçao sera executada.",
        )

    def handle(self, *args, **kwargs):
        # dispara o processamento dos filtros
        process = ProcessEventFilters(stdout=True)

        # dispara o envio dos emails
        sendmail = SendEventsMail(stdout=True)

        task = kwargs["task"]
        force_run = kwargs["force_run"]
        # passa o periodo no parametro
        # 1 para monthly, 2 para weekly
        if task == "run_filter":
            process.run_filter(force_run=force_run)

        if task == "send_mail":
            sendmail.exec_send_mail(
                date_start="2024-11-01 00:00:00", date_end="2024-12-01 00:00:00"
            )
