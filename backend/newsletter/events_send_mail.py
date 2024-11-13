import os
import sys
from datetime import datetime, time, timedelta, timezone
from pathlib import Path

import colorlog
import pandas as pd
from newsletter.models import EventFilter, Submission
from newsletter.newsletter_send_mail import NewsletterSendEmail


class SendEventsMail:

    def __init__(self, stdout=False):

        self.log = colorlog.getLogger("subscription")
        if stdout:
            consoleFormatter = colorlog.ColoredFormatter("%(log_color)s%(message)s")
            consoleHandler = colorlog.StreamHandler(sys.stdout)
            consoleHandler.setFormatter(consoleFormatter)
            self.log.addHandler(consoleHandler)

    # le o csv gerado e passa os valores para o template
    def get_context_data(self, names):
        tmp_path = Path("/archive/public/newsletter/")

        data = os.path.join(tmp_path, names + "_results_filter_newsletter.csv")

        if os.path.isfile(data):
            print("data", data)
            print("pegando  dados do resultado")
            tabela = pd.read_csv(data, sep=";")

            return tabela
        else:
            tabela = pd.DataFrame()
            self.log.info("Arquivo não exite.")
            return tabela

    # le os dados do csv e dispara as funções de envio dos emails
    def exec_send_mail(self, date_start, date_end):
        user_subs_all = len(EventFilter.objects.values_list("user", flat=True))

        for u in range(user_subs_all):
            user_subs = EventFilter.objects.values_list("user", flat=True)[u]
            filter_names = EventFilter.objects.values_list("filter_name", flat=True)[u]

            obj = EventFilter.objects.filter(user=user_subs)[0]
            csv_name = filter_names.replace(" ", "_")

            # le os dados do csv e envia para o email # delimitando 10 eventos
            data = self.get_context_data(csv_name)[0:9]

            email_user = obj.user.email
            self.log.info(f"Subscription ID: {obj.pk} Email: {obj.user.email}")

            # context = data.iloc[0]["name"]  # filter_names
            # 2024 Oct 25 ~20h UT: Chariklo occults mag 16 star (RA: xx xx xx - DEC: xx xx xx - Vel: xx km/s - Duration: xx s)LINK
            #
            id = EventFilter.objects.values_list("id", flat=True)[u]

            count = len(data)

            # gravando status do processo na tabela submission
            record = Submission(
                eventFilter_id=EventFilter.objects.get(pk=id),
                process_date=datetime.now(tz=timezone.utc),
                events_count=count,
                sending=True,
                title=filter_names,
            )
            self.log.info(
                "atualizando status 'sending' do envio de emails na tabela submission..."
            )
            record.save()

            if data.empty:
                context = "Events not found"
                send_mail = NewsletterSendEmail()
                send_mail.send_mail_not_found(obj.pk, email=email_user, context=context)
            else:
                context = [
                    date_start,
                    date_end,
                    filter_names,
                    data["date_time"],
                    data["name"],
                    data["magnitude_drop"],
                    data["velocity"],
                    data["event_duration"],
                ]
                send_mail = NewsletterSendEmail()
                send_mail.send_events_mail(obj.pk, email=email_user, context=context)

            ## salvar o status do processo na tabela submission
            record = Submission(
                eventFilter_id=EventFilter.objects.get(pk=id),
                process_date=datetime.now(tz=timezone.utc),
                events_count=count,
                sent=True,
                title=filter_names,
            )
            self.log.info(
                "atualizando status 'sent' do envio de emails na tabela submission...",
            )
            record.save()
