import os
import sys
from datetime import datetime, time, timedelta, timezone
from pathlib import Path

import colorlog
import pandas as pd
from django.conf import settings
from newsletter.models import Attachment, EventFilter, Submission
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
        # tmp_path = Path("/archive/public/newsletter/")
        path = "newsletter"
        tmp_path = Path(settings.DATA_TMP_DIR).joinpath(path)
        print(tmp_path)

        file_csv = os.path.join(
            tmp_path, csv_name
        )  # + "_results_filter_newsletter.csv")
        # print(file_csv, file_csv)

        print(file_csv)
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

        if submission_queryset.exists():
            for submission in submission_queryset:
                # Retrieve EventFilter and user email
                event_filter = EventFilter.objects.get(pk=submission.eventFilter_id_id)
                email_user = event_filter.user.email
                print("event_filter", event_filter.attachment)
                # id_str = str(submission.id)
                # print(id_str)
                # filecsv = os.path.join(
                #    # id_str + "_" + submission.title + "_results_filter_newsletter.csv"
                #    id_str
                #    + "_"
                #    + submission.title
                #    + ".csv"
                # )
                filecsv = event_filter.attachment.filename

                path = "newsletter"
                # print(settings.DATA_TMP_DIR)
                # print(tmp_path)
                path_link = Path(settings.DATA_TMP_URL).joinpath(path)
                link = os.path.join(path_link, filecsv)
                # print("filter_id", filter_id)
                # print(link)

                # event_filter = EventFilter.objects.get(pk=submission.eventFilter_id_id)
                # print(Attachment.objects.filter(submission_id=submission))
                # self.log.info("event_filter %d ", event_filter)
                # email_user = event_filter.user.email
                self.log.info(
                    "Subscription ID: %d Email: %s ",
                    event_filter.pk,
                    event_filter.user.email,
                )

                # le os dados do csv e envia para o email # delimitando 10 eventos
                csv_name = filecsv  # filter_names.replace(" ", "_")

                data = self.get_context_data(csv_name)[
                    0:4
                ]  # limita linha exibidas no email
                count = len(data)
                # print("data", data)
                if data.empty:
                    context = submission.title
                    send_mail = NewsletterSendEmail()
                    send_mail.send_mail_not_found(
                        event_filter.pk, email=email_user, context=context
                    )
                    submission.sent = True
                    submission.sent_date = datetime.now(tz=timezone.utc)
                    submission.save()
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
                        link,
                    ]
                    self.log.info("Send email: Occultation predictions found ...")
                    send_mail = NewsletterSendEmail()
                    send_mail.send_events_mail(
                        event_filter.pk, email=email_user, context=context
                    )

                    self.log.info("Update status to sent")
                    submission.sent = True
                    submission.sent_date = datetime.now(tz=timezone.utc)
                    submission.save()
