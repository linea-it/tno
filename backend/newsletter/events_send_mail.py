import os
import sys
from pathlib import Path

import colorlog
import pandas as pd
from newsletter.models.event_filter import EventFilter
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
        tmp_path = Path("/archive/newsletter/")

        data = os.path.join(tmp_path, names + "_results_filter_newsletter.csv")

        if os.path.isfile(data):
            print("data", data)
            """
                job_result = pd.read_csv(
                file_path,
                delimiter=";",
                usecols=["date_obs", "success"],
                dtype={"success": bool, "date_obs": str},
            )
            """
            print("pegando  dados do resultado")
            tabela = pd.read_csv(data, sep=";")

            return tabela
        else:
            tabela = pd.DataFrame()
            print("Arquivo não exite.")
            return tabela

    # Função que dispara o envio dos emails com os eventos
    def exec_send_mail(self):
        user_subs_all = len(EventFilter.objects.values_list("user", flat=True))

        for u in range(user_subs_all):
            user_subs = EventFilter.objects.values_list("user", flat=True)[u]
            filter_names = EventFilter.objects.values_list("filter_name", flat=True)[u]
            # print("user_subs", user_subs)
            # print("data_all", data_all["filter_names"])

            obj = EventFilter.objects.filter(user=user_subs)[0]
            csv_name = filter_names.replace(" ", "_")

            # le os dados do csv e envia para o email
            data = self.get_context_data(csv_name)
            print(data)
            email_user = obj.user.email
            print(f"Subscription ID: {obj.pk} Email: {obj.user.email}")

            # context = data.iloc[0]["name"]  # filter_names
            # 2024 Oct 25 ~20h UT: Chariklo occults mag 16 star (RA: xx xx xx - DEC: xx xx xx - Vel: xx km/s - Duration: xx s)LINK
            #
            if data.empty:
                context = "Events not found"
                send_mail = NewsletterSendEmail()
                send_mail.send_mail_not_found(obj.pk, email=email_user, context=context)
            else:
                context = [
                    filter_names,
                    data["date_time"],
                    data["name"],
                    data["magnitude_drop"],
                    data["velocity"],
                    data["event_duration"],
                ]
                send_mail = NewsletterSendEmail()
                send_mail.send_events_mail(obj.pk, email=email_user, context=context)
