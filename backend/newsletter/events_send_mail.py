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
        # Prevent adding multiple handlers if they already exist
        if not self.log.hasHandlers():
            if stdout:
                consoleFormatter = colorlog.ColoredFormatter("%(log_color)s%(message)s")
                consoleHandler = colorlog.StreamHandler(sys.stdout)
                consoleHandler.setFormatter(consoleFormatter)
                self.log.addHandler(consoleHandler)

    # le o csv gerado e passa os valores para o template
    def get_context_data(self, csv_name):

        # print("csv_name", csv_name)
        tmp_path = Path("/archive/public/newsletter/")

        file_csv = os.path.join(
            tmp_path, csv_name
        )  # + "_results_filter_newsletter.csv")

        self.log.info("file_csv %s", file_csv)

        if os.path.isfile(file_csv):
            # print("data", filecsv)
            # print("pegando  dados do resultado")
            csvtable = pd.read_csv(file_csv, sep=";")
            # print(csvtable)
            return csvtable
        else:
            csvtable = pd.DataFrame()
            self.log.info("File doesnot exist.")
            return csvtable

        # ******************************

    # le os dados do csv e dispara as funções de envio dos emails
    def exec_send_mail(self):
        submission_queryset = Submission.objects.filter(prepared=True, sent=False)
        u = 0  # contador numero de users

        if submission_queryset.exists():
            for submission in submission_queryset:
                filecsv = os.path.join(
                    submission.title + "_results_filter_newsletter.csv"
                )

                # filter_id = submission.eventFilter_id
                # print("filter_id", filter_id)

                user_filter = EventFilter.objects.values_list("user", flat=True)[u]
                self.log.info("user_filter %d ", user_filter)

                obj = EventFilter.objects.filter(user=user_filter)[0]
                email_user = obj.user.email
                self.log.info("Subscription ID: %d Email: %s ", obj.pk, obj.user.email)
                # print("obj", obj)
                u = u + 1

                # le os dados do csv e envia para o email # delimitando 10 eventos
                csv_name = filecsv  # filter_names.replace(" ", "_")

                data = self.get_context_data(csv_name)[
                    0:4
                ]  # limita linha exibidas no email
                count = len(data)
                # print("data", data)
                if data.empty:
                    context = "Events not found"
                    send_mail = NewsletterSendEmail()
                    send_mail.send_mail_not_found(
                        obj.pk, email=email_user, context=context
                    )
                    self.log.info("Send email results not found...")
                else:
                    context = [
                        submission.title,
                        data["date_time"],
                        data["name"],
                        data["magnitude_drop"],
                        data["velocity"],
                        # data["event_duration"],
                        data["closest_approach"],
                        data["gaia_magnitude"],
                    ]
                    self.log.info("Send email: Occultation predictions found ...")
                    send_mail = NewsletterSendEmail()
                    send_mail.send_events_mail(
                        obj.pk, email=email_user, context=context
                    )

                    self.log.info("Update status to sent")
                    # submission.sent = True
                    # submission.sending_date = datetime.now(tz=timezone.utc)
                    # submission.save()
