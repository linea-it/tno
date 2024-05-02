import socket

from django.core.mail import mail_admins, mail_managers, send_mail
from django.core.management.base import BaseCommand
from django.utils import timezone
from django.shortcuts import render, redirect
from django.template.loader import render_to_string
import sys
from newsletter.render_html import RenderizaHtml

class Command(BaseCommand):
    help = "Send a Subscription Test Email."
    
    def add_arguments(self, parser):
        parser.add_argument(
            "unsubscribe",
            nargs="*",
            help="One or more email addresses to send a test email to.",
        )
    
    def unsubscribe_mail(self, recipient_list: list):
        subject = "Test Subscription from %s on %s" % (
            socket.gethostname(),
            timezone.now(),
        )
        
        envio_usubscribe = RenderizaHtml()
        envio_usubscribe.renderHtmlUnsubscribe(True, recipient_list)

    def handle(self, *args, **kwargs):
        # self.stdout.write(f"Exemplo de como fazer um print")
        self.unsubscribe_mail(recipient_list=kwargs["unsubscribe"])
     