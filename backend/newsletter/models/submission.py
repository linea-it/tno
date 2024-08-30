from django.db import models
from newsletter.models.event_filter import EventFilter
from newsletter.models.subscription import Subscription


class Submission(models.Model):

    subscription_id = models.ForeignKey(
        Subscription,
        on_delete=models.CASCADE,
    )

    eventFilter_id = models.ForeignKey(
        EventFilter,
        on_delete=models.CASCADE,
    )

    process_date = models.DateTimeField(
        verbose_name="Process Datte",
        help_text="Data do processamento da submissao.",
    )

    events_count = models.IntegerField(
        verbose_name="Events Count",
        help_text="Contagem dos eventos.",
    )

    prepared = models.BooleanField(
        verbose_name="Prepared",
        help_text="Indica se a submmissao foi preparada ou nao.",
    )

    sending = models.BooleanField(
        verbose_name="Sending",
        help_text="Indica se a submissao está sendo enviada ou nao.",
    )

    sent = models.BooleanField(
        verbose_name="Sent",
        help_text="Indica se a submissao foi enviada ou nao.",
    )

    title = models.TextField(
        verbose_name="Title",
        help_text="Titulo da submissao.",
    )

    sent_date = models.BooleanField(
        verbose_name="Sent Date",
        help_text="Indica se a data de envio da submissao.",
    )

    def __str__(self):
        return str(self.id)
