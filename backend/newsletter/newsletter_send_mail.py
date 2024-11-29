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
                "host": settings.SITE_URL,
                "activation_code": subscription.activation_code,
            },
        )
        self.send_newsletter_email(
            "LIneA Solar System Subscription Activation",
            html_content,
            subscription.user.email,
        )

    def send_welcome_mail(self, subscription: Subscription):
        """Email enviado após a ativação por parte do usuário.
        Contem instruções informando o usuario como proceder para criar a lista customizada.
        """
        html_content = render_to_string(
            "welcome.html",
            {
                "host": settings.SITE_URL,
                "activation_code": subscription.activation_code,
            },
        )
        self.send_newsletter_email(
            "Welcome to the LIneA Solar System Occultation Prediction Newsletter",
            html_content,
            subscription.user.email,
        )

    def send_events_mail(self, subscription: Subscription, email, context):
        """Email enviado com os resultados encontrados.
        Contem alguns eventos de predição de ocultações encontrados,
        de acordo com as preferencias do usuario.
        """

        html_content = render_to_string(
            "results.html",
            {
                "host": settings.SITE_URL,
                "subscriber": email,
                "filter_name": context[0],
                "date_start": context[1].strftime("%B %d, %Y, at %H:%M (UTC)"),
                "date_end": context[2].strftime("%B %d, %Y, at %H:%M (UTC)"),
                "number_of_events": context[3],
                "link": context[4],
                "data": context[5],
            },
        )
        time_period = (
            context[1].strftime("%b %d") + " to " + context[2].strftime("%b %d, %y")
        )
        self.send_newsletter_email(
            f"Upcoming Occultation Predictions for '{context[0]}' ({time_period})",
            html_content,
            email,
        )

    def send_mail_not_found(self, subscription: Subscription, email, context):
        """Email enviado quando não há predições encontrados."""
        # print(context[14:])
        html_content = render_to_string(
            "results_not_found.html",
            {
                "host": settings.SITE_URL,
                "mesage": "Events not Found",
                "subscriber": email,
                "filter_name": context,
            },
        )
        self.send_newsletter_email(
            f"No Upcoming Occultation Predictions Found for '{context}'",
            html_content,
            email,
        )

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

        except Exception as e:
            self.log.error(e)
