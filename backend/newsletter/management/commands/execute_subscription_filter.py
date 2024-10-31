from datetime import datetime, timezone

from django.core.management.base import BaseCommand
from newsletter.models.event_filter import EventFilter
from newsletter.models.subscription import Subscription
from newsletter.newsletter_send_mail import NewsletterSendEmail
from newsletter.process_event_filter import ProcessEventFilters


class Command(BaseCommand):
    help = "Executa os filtros de acordo com as preferencias do usuario."

    def add_arguments(self, parser):
        parser.add_argument(
            "--local",
            action="store_true",
            dest="local",
            default=False,
            help="Dispara a função que executa os filtros.",
        )

        # parser.add_argument(
        #    "email",
        #    help="One email addresses to send a test email to.",
        # )

    def handle(self, *args, **kwargs):
        # atm = ProcessEventFilters(stdout=True)
        # passa o periodo no parametro
        # 1 para monthly, 2 para weekly
        # atm.run_filter(1)

        # email = kwargs["email"]

        user_subs_all = len(EventFilter.objects.values_list("user", flat=True))
        print(user_subs_all)

        for u in range(user_subs_all):
            user_subs = EventFilter.objects.values_list("user", flat=True)[u]
            # print("user_subs", user_subs)

            obj = EventFilter.objects.filter(user=user_subs)[0]

            email_user = obj.user.email
            print(f"Subscription ID: {obj.pk} Email: {obj.user.email}")

            send_mail = NewsletterSendEmail()
            send_mail.send_events_mail(obj.pk, email=email_user)
