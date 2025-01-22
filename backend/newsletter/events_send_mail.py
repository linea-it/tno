import os
import sys
from datetime import datetime, time, timedelta, timezone
from pathlib import Path

import colorlog
import pandas as pd
from django.conf import settings
from newsletter.models import Attachment, EventFilter, Submission, Subscription
from newsletter.newsletter_send_mail import NewsletterSendEmail
from newsletter.serializers import SubscriptionSerializer


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

        path = "newsletter"
        tmp_path = Path(settings.DATA_TMP_DIR).joinpath(path)

        file_csv = os.path.join(tmp_path, csv_name)

        self.log.info("file_csv %s", file_csv)

        if os.path.isfile(file_csv):
            csvtable = pd.read_csv(file_csv, sep=";", nrows=10)
            return csvtable
        else:
            csvtable = pd.DataFrame()
            self.log.info("File does not exist.")
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
            subscriptions = Subscription.objects.filter(unsubscribe=False)

            # convertendo formato dos dados para pegar email
            subscription_users = SubscriptionSerializer(subscriptions, many=True).data

            emails_subscription = [user["email"] for user in subscription_users]

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

                    if email_user in emails_subscription:

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
                                link = settings.SITE_URL + str(
                                    path_link / attachment.filename
                                )

                                self.log.info(
                                    "Attachment found: %s", attachment.filename
                                )
                                complete_data = self.get_context_data(
                                    attachment.filename
                                )
                                number_of_events = len(complete_data)

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

                                # Limit data to the first 10 rows and convert these values to the proper formated strings
                                # The formating is taking place here because of errors doing it using django template language inside the templates
                                data = complete_data[required_keys]
                                data = (
                                    data.copy()
                                )  # This avoids the warning by ensuring you're working with an independent copy of the DataFrame.
                                # format datetime to Y-m-d H:M
                                data["date_time"] = pd.to_datetime(
                                    data["date_time"]
                                ).dt.strftime("%Y-%m-%d %H:%M")
                                # format velocity .1f and str
                                data["velocity"] = (
                                    data["velocity"]
                                    .astype(str)
                                    .map(lambda x: "{:.1f}".format(float(x)))
                                )
                                # format closest_approach .3f and str
                                data["closest_approach"] = (
                                    data["closest_approach"]
                                    .astype(str)
                                    .map(lambda x: "{:.3f}".format(float(x)))
                                )
                                # format closest_approach_uncertainty_km .0f and str, and replace big values with 'Very High'
                                data["closest_approach_uncertainty_km"] = (
                                    data["closest_approach_uncertainty_km"]
                                    .astype(str)
                                    .map(lambda x: "{:.0f}".format(float(x)))
                                    .map(
                                        lambda y: "Very High" if float(y) > 12500 else y
                                    )
                                )
                                # format gaia_magnitude .1f and str
                                data["gaia_magnitude"] = (
                                    data["gaia_magnitude"]
                                    .astype(str)
                                    .map(lambda x: "{:.1f}".format(float(x)))
                                )
                                data = data.applymap(lambda x: "-" if x == "nan" else x)

                                # Convert to JSON
                                json_data = data.to_dict(orient="records")
                                if not all(key in data for key in required_keys):
                                    self.log.error(
                                        "Invalid data structure returned for %s",
                                        attachment.filename,
                                    )
                                    continue

                                # Nome do arquivo
                                arquivo = attachment.filename

                                # Recorte da data
                                start_str = arquivo.split("_")[-4]
                                end_str = arquivo.split("_")[-3]
                                # Extract YYYY-MM-DD
                                date_start = datetime.strptime(
                                    start_str, "%Y%m%d%H%M%S"
                                )
                                date_end = datetime.strptime(end_str, "%Y%m%d%H%M%S")

                                context = [
                                    event_filter.filter_name,
                                    date_start,
                                    date_end,
                                    number_of_events,
                                    link,
                                    json_data,
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
