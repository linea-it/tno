import datetime
import logging
import os
import sys

# from .management.commands.send_subscription_teste_mail import Command
from email.mime.image import MIMEImage

from coreAdmin.settings import BASE_DIR, STATICFILES_DIRS, TEMPLATES
from django.conf import settings
from django.core.mail import (
    EmailMessage,
    EmailMultiAlternatives,
    mail_admins,
    mail_managers,
    send_mail,
)
from django.http import HttpResponse
from django.shortcuts import redirect, render
from django.template import RequestContext, loader
from django.template.loader import get_template, render_to_string
from django.utils.html import strip_tags
from newsletter.models.subscription import Subscription


class NewsletterSendEmail:

    def __init__(self):
        self.log = logging.getLogger("subscription")

    def send_activation_mail(self, subscription: Subscription):
        """Email enviado logo após o registro do usuario
        Contem o botão "Confirmar" que ao ser clicado atualiza o cadastro como ativo.
        """

        self.log.info(f"Sending activation to: {subscription.user.email}")

        html_content = render_to_string(
            "activate_subscription.html",
            {
                "host": settings.SITE_URL.rstrip("/"),
                "activation_code": subscription.activation_code,
            },
        )
        self.send_newsletter_email(
            "Activation Subscription", html_content, subscription.user.email
        )

    def send_welcome_mail(self, subscription: Subscription):
        """Email enviado após a ativação por parte do usuário.
        Contem instruções informando o usuario como proceder para criar a lista customizada.
        """
        html_content = render_to_string(
            "welcome.html",
            {
                "host": settings.SITE_URL.rstrip("/"),
                "activation_code": subscription.activation_code,
            },
        )
        self.send_newsletter_email(
            "Welcome to Solar System Newsletter", html_content, subscription.user.email
        )

    def send_events_mail(self, subscription: Subscription, email, context):
        """Email enviado com os resultados encontrados.
        Contem alguns eventos de predição de ocultações encontrados,
        de acordo com as preferencias do usuario.
        """
        html_content = render_to_string(
            "results.html",
            {
                "host": settings.SITE_URL.rstrip("/"),
                "date_start": context[0],
                "date_end": context[1],
                "filter_name": context[2],
                "date": context[3],
                "name": context[4],
                "mag": context[5],
                "veloc": context[6],
                "duration": context[7],
            },
        )
        self.send_newsletter_email("Occultation predictions found", html_content, email)

    def send_mail_not_found(self, subscription: Subscription, email, context):
        """Email enviado quando não há predições encontrados."""
        html_content = render_to_string(
            "results_not_found.html",
            {
                "host": settings.SITE_URL.rstrip("/"),
                "mesage": "Events not Found",
            },
        )
        self.send_newsletter_email("Events not Found", html_content, email)

    def send_newsletter_email(self, subject, body, recipient):
        try:
            body = EmailMessage(
                subject,
                body,
                settings.EMAIL_NEWSLETTER_NOREPLY,
                [recipient],
            )
            body.content_subtype = "html"

            body.send()
            self.log.info(f"Email successfully sent")
        except Exception as e:
            self.log.error(e)
