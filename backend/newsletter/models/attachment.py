from django.db import models


class Attachment(models.Model):

    submission_id = models.ForeignKey(
        "newsletter.Submission",
        on_delete=models.CASCADE,
        related_name="attachment_submissions",  # Unique related_name to avoid conflict
        verbose_name="Submission",
        help_text="Submission associated with this attachment.",
    )

    filename = models.CharField(
        verbose_name="Filename",
        max_length=200,
        help_text="Nome do arquivo anexado.",
    )

    size = models.IntegerField(
        verbose_name="Size",
        help_text="Tamanho do arquivo anexado.",
    )

    def __str__(self):
        return str(self.id)
