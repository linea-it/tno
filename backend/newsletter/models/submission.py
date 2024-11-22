from django.db import models


class Submission(models.Model):

    eventFilter_id = models.ForeignKey(
        "newsletter.EventFilter",
        on_delete=models.CASCADE,
    )

    attachment = models.ForeignKey(
        "newsletter.Attachment",
        on_delete=models.SET_NULL,  # Sets to NULL when Attachment is deleted
        null=True,
        blank=True,
        related_name="submission_attachments",
        verbose_name="Attachment",
        help_text="Attachment associated with this submission.",
    )

    process_date = models.DateTimeField(
        verbose_name="Process Datte",
        help_text="Data do processamento da submissao.",
    )

    events_count = models.IntegerField(
        verbose_name="Events Count",
        help_text="Contagem dos eventos.",
        default=0,
    )

    prepared = models.BooleanField(
        verbose_name="Prepared",
        help_text="Indica se a submmissao foi preparada ou nao.",
        default=False,
    )

    sent = models.BooleanField(
        verbose_name="Sent",
        help_text="Indica se a submissao foi enviada ou nao.",
        default=False,
    )

    sent_date = models.DateTimeField(
        verbose_name="Sent Date",
        help_text="Indica se a data de envio da submissao.",
        default=None,
        null=True,
        blank=True,
    )

    def __str__(self):
        return str(self.id)
