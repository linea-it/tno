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
            help="One email addresses to send a test email to.",
        )

        parser.add_argument(
            "--step",
            dest="step",
            default="activation",
            help="Define o tipo de email que será enviado.",
        )

    def handle(self, *args, **kwargs):

        available_steps = ["activation", "welcome"]

        email = kwargs["email"]
        step = kwargs["step"]

        if step not in available_steps:
            self.stdout.write(
                f"O parametro step precisar ser um destes valores: {available_steps}"
            )
            return

        try:
            user = Subscription.objects.get(email=email)

            # TODO: Renomear a classe para algo como NewsletterSendEmail
            envio = RenderizaHtml()

            if step == "activation":
                envio.send_activation_mail(user)

            if step == "welcome":
                envio.send_welcome_mail(user)

        except Subscription.DoesNotExist as e:
            raise Exception(f"Email não cadastrado.")
