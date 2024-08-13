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

    """
    def renderHtmlUnsubscribe(request, unsubscribe, recipient_list):
        if unsubscribe == True:
            print("Ok")
        # return #sys.stdout.write(f"Exemplo de como fazer um print ${unsubscribe}")
        html_content = render_to_string("welcome.html", {"nome": "Josiane"})
        body = EmailMessage(
            unsubscribe, html_content, "josianes.silva@gmail.com", recipient_list
        )
        body.content_subtype = "html and image"
        return body.send()
    """

    def send_newsletter_email(self, subject, body, recipient):
        try:
            body = EmailMessage(
                subject,
                body,
                settings.EMAIL_NEWSLETTER_NOREPLY,
                [recipient],
            )
            body.content_subtype = "html and image"

            body.send()
            self.log.info(f"Email successfully sent")
        except Exception as e:
            self.log.error(e)
