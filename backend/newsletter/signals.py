import sys

from django.conf import settings
from django.core.mail import (
    EmailMessage,
    EmailMultiAlternatives,
    mail_admins,
    mail_managers,
    send_mail,
)
from django.db.models.signals import post_save
from django.dispatch import receiver
from django.template.loader import render_to_string
from newsletter.models import Subscription
from newsletter.newsletter_send_mail import NewsletterSendEmail


@receiver(post_save, sender=Subscription)
def send_welcome_email(sender, instance, signal, created, **kwargs):
    """
    Send a Activation email after user send email in subscription form.
    """
    if created:
        envio = NewsletterSendEmail()
        envio.send_activation_mail(user=instance)

    else:
        # TODO: Revisar essa lógica do email de desiscrição
        if instance.unsubscribe == True:
            print("Send email vai com Deus")

            def renderHtml():
                html_content = render_to_string("welcome.html", {"nome": "Josiane"})
                body = EmailMessage(
                    "subject",
                    html_content,
                    "josianes.silva@gmail.com",
                    "josiane@gmail.com",
                )
                body.content_subtype = "html and image"
                return body.send()
