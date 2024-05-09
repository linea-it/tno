import socket
import sys

from django.core.mail import mail_admins, mail_managers, send_mail
from django.core.management.base import BaseCommand
from django.shortcuts import redirect, render
from django.template.loader import render_to_string
from django.utils import timezone
from newsletter.models.subscription import Subscription
from newsletter.render_html import RenderizaHtml


class Command(BaseCommand):
    help = "Send a Subscription Test Email."

    def add_arguments(self, parser):
        parser.add_argument(
            "email",
            nargs="*",
            help="One or more email addresses to send a test email to.",
        )

    def welcome_mail(self, email: str):
        ###  trecho glauber
        # send_mail(
        #    subject=subject,
        #    #message="If you're reading this, it was successful.",
        #    message= body, #renderHtml() #body,
        #    from_email=None,
        #    recipient_list=recipient_list,
        # )
        ### end trecho glauber
        try:
            user = Subscription.objects.get(email=email)
            envio = RenderizaHtml()
            envio.send_activation_mail(user)

        except Subscription.DoesNotExist as e:
            self.stdout.write(f"Email não cadastrado")

    def handle(self, *args, **kwargs):
        # self.stdout.write(f"Exemplo de como fazer um print")

        self.welcome_mail(email=kwargs["email"][0])

    """
    def unsubscribe_mail(self, recipient_list: list):
        subject = "Test Subscription from %s on %s" % (
            socket.gethostname(),
            timezone.now(),
        )
    """
    """ 
        glauber
        send_mail(
            subject=subject,
            message="If you're reading this, it was successful.",
            from_email=None,
            recipient_list=recipient_list,
        )"""

    #    envio_usubscribe = RenderizaHtml()
    #    envio_usubscribe.renderHtmlUnsubscribe(True, recipient_list)
