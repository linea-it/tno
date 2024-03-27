import socket

from django.core.mail import mail_admins, mail_managers, send_mail
from django.core.management.base import BaseCommand
from django.utils import timezone


class Command(BaseCommand):
    help = "Send a Subscription Test Email."

    def add_arguments(self, parser):
        parser.add_argument(
            "email",
            nargs="*",
            help="One or more email addresses to send a test email to.",
        )

    def welcome_mail(self, recipient_list: list):
        subject = "Test Subscription from %s on %s" % (
            socket.gethostname(),
            timezone.now(),
        )

        send_mail(
            subject=subject,
            message="If you're reading this, it was successful.",
            from_email=None,
            recipient_list=recipient_list,
        )

    def unsubscribe_mail(self, recipient_list: list):
        subject = "Test Subscription from %s on %s" % (
            socket.gethostname(),
            timezone.now(),
        )

        send_mail(
            subject=subject,
            message="If you're reading this, it was successful.",
            from_email=None,
            recipient_list=recipient_list,
        )

    def handle(self, *args, **kwargs):
        # self.stdout.write(f"Exemplo de como fazer um print")
        self.welcome_mail(recipient_list=kwargs["email"])
