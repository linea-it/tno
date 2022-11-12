from django.conf import settings
from django.db import models

from des.models import Ccd, DownloadCcdJob


class DownloadCcdJobResult(models.Model):
    """ """

    # Des Skybot Job
    job = models.ForeignKey(
        DownloadCcdJob,
        on_delete=models.CASCADE,
        verbose_name="Download CCD Job",
        related_name="job_results",
    )

    # Des CCD
    ccd = models.OneToOneField(Ccd, on_delete=models.CASCADE, verbose_name="CCD")

    # Momento em que o Download foi iniciado.
    start = models.DateTimeField(
        verbose_name="Start",
        auto_now_add=True,
    )

    # # Momento em que o Download foi finalizado.
    finish = models.DateTimeField(
        verbose_name="Finish", auto_now_add=False, null=True, blank=True
    )

    # Tempo de execução do Download
    execution_time = models.DurationField(
        verbose_name="Execution Time", null=True, blank=True
    )

    file_size = models.PositiveIntegerField(
        verbose_name="File Size",
        null=True,
        blank=True,
        default=None,
        help_text="File Size in bytes",
    )

    def __str__(self):
        return str(self.id)
