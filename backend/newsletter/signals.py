from django.conf import settings
from django.db.models.signals import post_save
from django.dispatch import receiver
from newsletter.models import Subscription
from django.template.loader import render_to_string
from django.core.mail import mail_admins, mail_managers, send_mail, EmailMessage, EmailMultiAlternatives 
import sys

@receiver(post_save, sender=Subscription)
def send_welcome_email(sender, instance, signal, created, **kwargs):
    """
    Send a Welcome email after user send email in subscription form.
    """
    if created:
        email = instance.email
        print(f"Send Welcome email: {email}")
        # TODO: Criar função para enviar email de boas vindas.
        #### 
        ## trazer do send_sbscription_teste_mail
        """
        def renderHtml():    
            html_content = render_to_string('welcome.html', {"nome": 'Josiane'})
            body = EmailMessage(subject,html_content, 
                                 'josianes.silva@gmail.com',
                                recipient_list)
            body.content_subtype = "html and image"
            return body.send()
        
        #envio = RenderizaHtml()
        #envio.renderHtml(subject, recipient_list)
        renderHtml(subject, recipient_list)
        """
    else:
        if instance.unsubscribe == True:
            print("Send email vai com Deus")
            def renderHtml():    
                html_content = render_to_string('welcome.html', {"nome": 'Josiane'})
                body = EmailMessage('subject',html_content, 
                                    'josianes.silva@gmail.com',
                                    'josiane@gmail.com')
                body.content_subtype = "html and image"
                return body.send()