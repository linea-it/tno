from django.db import models
from newsletter.models.submission import Submission


class Attachment(models.Model):

    submission_id = models.ForeignKey(
        Submission,
        on_delete=models.CASCADE,
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
