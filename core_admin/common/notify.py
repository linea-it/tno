import logging
from django.conf import settings
from django.core.mail import EmailMessage
from django.template.loader import render_to_string


class Notify():

    def __init__(self):
        self.logger = logging.getLogger('django')

    def send_email(self, subject, body, to, copy_to_adms=True, html=True):
        """
        Envia um email, o body do email pode ser uma mensagem html.
        :param subject: Assunto do Email
        :param body: Corpo do email pode ser um html ou texto simples
        :param to: list([]) lista de emails destinatarios ou uma string apenas um email
        :param copy_to_adms: Boolean: true para enviar copia para uma lista de emails de administradores.
        """

        self.logger.debug("Sending mail notification.")

        try:
            from_email = settings.EMAIL_NOTIFICATION
        except:
            raise Exception(
                "The EMAIL_NOTIFICATION variable is not configured in settings.")

        try:
            environment = settings.ENVIRONMENT_NAME
        except:
            raise Exception(
                "The ENVIRONMENT_NAME variable is not configured in settings.")

        self.logger.debug("FROM: %s" % from_email)

        # Se o parametro to nao for uma lista corverter para lista.
        if not isinstance(to, list):
            to = list([to])

        if copy_to_adms:
            try:
                copy_to = settings.EMAIL_NOTIFICATION_COPY_TO
                to = to + copy_to
            except:
                raise Exception(
                    "The EMAIL_NOTIFICATION_COPY_TO variable is not configured in settings.")

        self.logger.debug("TO: %s" % to)

        # Subject
        subject = ("SSSO %s - %s" % (environment, subject))

        self.logger.debug("SUBJECT: %s" % subject)

        try:
            msg = EmailMessage(
                subject=subject,
                body=body,
                from_email=from_email,
                to=to,
            )

            if html is True:
                msg.content_subtype = "html"

            msg.send(fail_silently=False)

        except Exception as e:
            self.logger.error(e)

    def send_email_failure_helpdesk(self, subject, original_message):

        try:
            to = settings.EMAIL_HELPDESK
        except:
            raise Exception(
                "The EMAIL_HELPDESK variable is not configured in settings.")

        self.send_email(subject, original_message, to, False, False)

    def send_html_email(self, subject, to, template, context, copy_to_adms=True):

        context.update({
            "application_name": settings.APPLICATION_NAME,
            "host_url": settings.HOST_URL
        })

        body = render_to_string(template, context)

        self.send_email(subject, body, to)
