from django.conf import settings
from django.db.models.signals import post_save
from django.dispatch import receiver
from newsletter.models import Subscription


@receiver(post_save, sender=Subscription)
def send_welcome_email(sender, instance, signal, created, **kwargs):
    """
    Send a Welcome email after user send email in subscription form.
    """
    if created:
        email = instance.email
        print(f"Send Welcome email: {email}")
        # TODO: Criar função para enviar email de boas vindas.
    else:
        if instance.unsubscribe == True:
            print("Send email vai com Deus")
