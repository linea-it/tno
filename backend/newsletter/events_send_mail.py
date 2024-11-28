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
        # print(tmp_path)

        file_csv = os.path.join(
            tmp_path, csv_name
        )  # + "_results_filter_newsletter.csv")
        # print(file_csv, file_csv)

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
        self.log.info("#" + "-" * 50 + "#")
        self.log.info("|" + "Process Send Subscription Emails".center(50, " ") + "|")
        self.log.info("#" + "-" * 50 + "#")
        try:
            # Retrieve all pending submissions
            submissions = Submission.objects.filter(prepared=True, sent=False)

            if not submissions.exists():
                self.log.info("There are no subscription emails to be sent.")
                return

            for submission in submissions:
                try:
                    event_filter = EventFilter.objects.get(
                        pk=submission.eventFilter_id_id
                    )
                    attachment = submission.attachment
                    email_user = event_filter.user.email

                    self.log.info(
                        f"< Processing Subscripion Filter ID: {event_filter.pk} >".center(
                            52, "-"
                        )
                    )
                    self.log.info("Email: %s", email_user)
                    # if there are attachments, process them and send email
                    if attachment:
                        try:
                            path = "newsletter"
                            path_link = Path(settings.DATA_TMP_URL).joinpath(path)
                            link = str(path_link / attachment.filename)

                            self.log.info("Attachment found: %s", attachment.filename)
                            data = self.get_context_data(attachment.filename)[0:15]

                            # Validate data structure
                            required_keys = [
                                "date_time",
                                "name",
                                "velocity",
                                "closest_approach",
                                "closest_approach_uncertainty_km",
                                "gaia_magnitude",
                                "id",
                            ]
                            if not all(key in data for key in required_keys):
                                self.log.error(
                                    "Invalid data structure returned for %s",
                                    attachment.filename,
                                )
                                continue

                            # Nome do arquivo
                            arquivo = attachment.filename
                            # print(attachment.filename)

                            # Recorte da data
                            start_str = arquivo.split("_")[-5]
                            end_str = arquivo.split("_")[-4]
                            # Extract YYYY-MM-DD
                            date_start = (
                                f"{start_str[:4]}-{start_str[4:6]}-{start_str[6:8]}"
                            )
                            date_end = f"{end_str[:4]}-{end_str[4:6]}-{end_str[6:8]}"
                            date_time = [
                                dt[:-1] if dt.endswith("Z") else dt
                                for dt in data["date_time"]
                            ]

                            context = [
                                event_filter.filter_name,
                                date_start,
                                date_end,
                                date_time,
                                data["name"],
                                data["velocity"],
                                data["closest_approach"],
                                data["closest_approach_uncertainty_km"],
                                data["gaia_magnitude"],
                                link,
                                data["id"],
                            ]

                            # Send email with events
                            send_mail = NewsletterSendEmail()
                            send_mail.send_events_mail(
                                event_filter.pk, email=email_user, context=context
                            )
                            self.log.debug(
                                "Email sent successfully for EventFilter ID: %d",
                                event_filter.pk,
                            )
                        except Exception as e:
                            self.log.error(
                                "Error while processing attachment: %s", str(e)
                            )
                            continue
                    else:
                        # Send email indicating no results found
                        send_mail = NewsletterSendEmail()
                        send_mail.send_mail_not_found(
                            event_filter.pk,
                            email=email_user,
                            context=event_filter.filter_name,
                        )
                        self.log.info(
                            "Email sent for no results found: EventFilter ID: %d",
                            event_filter.pk,
                        )

                    # Update submission status
                    submission.sent = True
                    submission.sent_date = datetime.now(tz=timezone.utc)
                    submission.save()
                    self.log.info(
                        "Submission status updated to sent: %d", submission.pk
                    )
                except Exception as e:
                    self.log.error(
                        "Error processing submission ID %d: %s", submission.pk, str(e)
                    )
                    continue
        except Exception as e:
            self.log.critical("Critical error in exec_send_mail: %s", str(e))
