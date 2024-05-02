
"""
#from django.core.mail import mail_admins, mail_managers, send_mail
from django.shortcuts import render, redirect
from django.template.loader import render_to_string, get_template
import sys
from django.core.mail import mail_admins, mail_managers, send_mail, EmailMessage 
from django.utils.html import strip_tags
from django.template import RequestContext, loader

class RnderizaHtml():
    def renderHtml(emails):
    #def renderHtml():    
        render_body = render_to_string(
                    'welcome.html',
                    {
                        "visits": "Ola Mundo",
                    },
                )
        body = strip_tags(render_body)
        sys.stdout.write(f"Exemplo de como fazer um print ${strip_tags(body)}")
        ####
        send_mail(
            subject="teste envio email", #subject,
            #message="If you're reading this, it was successful.",
            message= render_body, #body,
            #message= loader.get_template("welcome.html"),#.render(Context)
            from_email=None,
            recipient_list=[emails]
        )
        
        return 
##########
#from django.shortcuts import render, redirect
#from .forms import ContactMeForm
#from django.conf import settings 
#from django.template.loader import get_template  
from django.core.mail import EmailMessage 

def sendmail_contact(data):
    #message_body = get_template('send.html').render(data)  
    message_body = get_template('welcome.html').render(data)  
    email = EmailMessage(data['subject'],
                            message_body, settings.DEFAULT_FROM_EMAIL,
                            to=['email@test.com'])
    email.content_subtype = "html"    
    return email.send()

# Create your views here.
def contact_me(request):
    if request.method == 'POST':
        form = ContactMeForm(request.POST) 
        if form.is_valid():
            form = form.save(commit=False)
            form.save()
             
            # data, puxo as informações dos campos name, email, subject, message.
            data = { 
                'name': request.POST.get('name'), 
                'email': request.POST.get('email'),
                'subject': request.POST.get('subject'),
                'message': request.POST.get('message'),
            } 
            sendmail_contact(data) # Aqui vou criar uma função para envio
            # chamei de sendmail_contact

            return redirect('contact')
    else:
        form = ContactMeForm()
    return render(request, 'form-contact.html', {'form': form})

#####
"""
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

class RenderizaHtml():
    
    def renderHtml(request, subject, recipient_list):
        #html_content = render_to_string('welcome.html', {"nome": 'Josiane'})
        #html_content = render_to_string('base_email.html', {"nome": 'Josiane'})
        html_content = render_to_string('welcome.html', {"nome": 'Josiane'})
        body = EmailMessage(subject,html_content, 
                                 'josianes.silva@gmail.com',
                                recipient_list)
        body.content_subtype = "html and image"
        #body = EmailMultiAlternatives(subject,html_content, 
        #                         'josianes.silva@gmail.com',
        #                        recipient_list)
        """
        body.mixed_subtype = 'related'
        body.attach_alternative(html_content, "text/html")
        #img_dir = '/public/img/'
        image = '/backend/newsletter/public/img/Captura_de_tela_2024-03-13_190407.png'
        #file_path = os.path.join(img_dir, image)
        #print(file_path)
        #with open(file_path, 'r') as f:
        #img = MIMEImage(f.read())
        img = MIMEImage('/backend/newsletter/public/img/Captura_de_tela_2024-03-13_190407.png','png')
        img.add_header('Content-ID', '<{name}>'.format(name=image))
        img.add_header('Content-Disposition', 'inline', filename=image)
        body.attach(img)
        """
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