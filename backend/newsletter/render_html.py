from django.http import HttpResponse
import datetime
from django.shortcuts import render, redirect
from django.template.loader import render_to_string, get_template
import sys
from django.core.mail import mail_admins, mail_managers, send_mail, EmailMessage, EmailMultiAlternatives 
from django.utils.html import strip_tags
from django.template import RequestContext, loader
#from .management.commands.send_subscription_teste_mail import Command
from email.mime.image import MIMEImage
import os
from django.conf import Settings
from coreAdmin.settings import STATICFILES_DIRS, BASE_DIR, TEMPLATES
from .views.subscription import SubscriptionSerializer

class RenderizaHtml():
    
    #context = dict({"activateCode": activateCode})
    def renderHtml(request, subject, recipient_list):
        #email =  #SubscriptionSerializer.__getattribute__(email)
        #print(email)
        activateCode = 'c3d2c9d6-7e8c-4a75-8aa1-2f36a45a7e20' #SubscriptionSerializer.__getattribute__(activateCode)
        print(activateCode)
        html_content = render_to_string('activate_subscription.html',{"activateCode": activateCode},)
        body = EmailMessage(subject,html_content, 
                                 'josianes.silva@gmail.com',
                                recipient_list, headers={"Message-ID": "foo"},)
        body.content_subtype = "html and image"
        #body = EmailMultiAlternatives(subject,html_content, 
        #                         'josianes.silva@gmail.com',
        #                        recipient_list)
        ####  anexar arquivo
        #file_path = f"./staticfiles/img/Captura_de_tela_2024-03-13_190407.png"
        #file_path = ({TEMPLATES}/'welcome.html')
        #body.attach_file(file_path)
        #### end anexar arquivo
        return body.send()
    
    def renderHtmlUnsubscribe(request, unsubscribe, recipient_list):
        if unsubscribe == True:
            print("Send email vai com Deus")
        #return #sys.stdout.write(f"Exemplo de como fazer um print ${unsubscribe}")
        html_content = render_to_string('welcome.html', {"nome": 'Josiane'})
        body = EmailMessage(unsubscribe,html_content, 
                                    'josianes.silva@gmail.com',
                                    recipient_list)
        body.content_subtype = "html and image" 
        return body.send()