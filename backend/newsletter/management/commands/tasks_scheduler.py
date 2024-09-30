import sched
import socket
import sys
import time
from datetime import datetime, timedelta

from django.core.mail import mail_admins, mail_managers, send_mail
from django.core.management.base import BaseCommand
from newsletter.filterPreferencesUser import filter_preferences_user
from newsletter.models.subscription import Subscription
from newsletter.newsletter_send_mail import NewsletterSendEmail

# from django.http import HttpResponse
# from django.shortcuts import redirect, render
# from django.template import loader
# from django.template.loader import render_to_string
# from django.utils import timezone
# from newsletter.models import EventFilter
# from tno.models import Occultation


class Command(BaseCommand):

    help = "Agendador de tarefas."

    def add_arguments(self, parser):
        parser.add_argument(
            "email",
            help="One email addresses to send a test email to.",
        )

    def handle(self, *args, **kwargs):
        email = kwargs["email"]
        scheduler = sched.scheduler(time.time, time.sleep)

        user = Subscription.objects.get()
        print("user...", user)

        """
        # funcao 1 executada apos 3 segundos
        def soma(n1, n2):
            print(f"Soma: {n1+n2} Tempo: {time.ctime()}")
            scheduler.enter(3, 1, soma, (2, 2))

        # funcao 2 executada apos 2 segundos
        def sub(n1, n2):
            print(f"Sub: {n1-n2} Tempo: {time.ctime()}")
            scheduler.enter(2, 1, sub, (2, 2))

        # roda as funçoes programadas
        def sched_a():
            scheduler.enter(1, 1, soma, (2, 2))
            scheduler.enter(1, 1, sub, (2, 2))
        """

        # executar a funçao de enviar o email
        # passando como paramentro o email da pessoa
        # e talvez o id do filtro que gerou a consulta
        """
        def soma(n1, n2):
            print(f"Soma: {n1+n2} Tempo: {time.ctime()}")
            scheduler.enterabs(  # reexecutar por dia
                (datetime.now() + timedelta(hours=24)).timestamp(), 1, soma, (2, 2)
            )

        def sched_a():
            scheduler.enterabs(
                datetime(year=2024, month=9, day=27, hour=14, minute=59).timestamp(),
                1,
                soma,
                (2, 3),
            )

        sched_a()
        scheduler.run()
        """

        #################################################

        scheduler.enterabs(  # reexecutar por dia
            (datetime.now() + timedelta(seconds=15)).timestamp(),
            1,
            filter_preferences_user,
        )

        # backup_time = time.strptime("17:33:00", "%H:%M:%S")

        def sched_a():
            scheduler.enterabs(
                time.mktime(time.strptime("27/9/2024 17:50:00", "%d/%m/%Y %H:%M:%S")),
                20,
                filter_preferences_user,
            )

            scheduler.enterabs(
                time.mktime(time.strptime("27/9/2024 17:50:00", "%d/%m/%Y %H:%M:%S")),
                10,
                NewsletterSendEmail.send_events_mail(self, email),
            )

        sched_a()
        scheduler.run()
