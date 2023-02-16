from django.conf import settings
from django.db import models


class OrbitTraceJob(models.Model):
    """
    Representa cada Job do Orbit Trace que será ou foi executado.
    """

    # Usuario que solicitou a execução do Job.
    owner = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.CASCADE,
        verbose_name="Owner",
        related_name="des_orbitTrace_run",
    )

    # data inicial usada para selecionar as exposições que serão processadas.
    date_initial = models.DateField(
        verbose_name="Date Initial",
        auto_now_add=False,
    )

    # data Final usado para selecionar as exposições que serão processadas
    date_final = models.DateField(
        verbose_name="Date Final",
        auto_now_add=False,
    )

    # Status da execução.
    status = models.IntegerField(
        verbose_name="Status",
        default=1,
        choices=(
            (1, "Idle"),
            (2, "Running"),
            (3, "Completed"),
            (4, "Failed"),
            (5, "Aborted"),
            (6, "Warning"),
        ),
    )

    # Momento em que o Job foi criado.
    start = models.DateTimeField(
        verbose_name="Start",
        auto_now_add=True,
    )

    # Momento em que o Job foi finalizado.
    end = models.DateTimeField(
        verbose_name="Finish", auto_now_add=False, null=True, blank=True
    )

    # Tempo de duração do Job.
    exec_time = models.DurationField(
        verbose_name="Execution Time", null=True, blank=True
    )

    # Tempo de duração estimado no começo do Job
    estimated_execution_time = models.DurationField(
        verbose_name="Estimated Execution Time", null=True, blank=True
    )

    # Pasta onde estão os dados do Job.
    path = models.CharField(
        max_length=2048,
        verbose_name="Path",
        help_text="Path to the directory where the job data is located.",
    )

    results = models.CharField(
        max_length=2048,
        verbose_name="Results",
        help_text="Filepath to the results.csv. this file contains the results of the job.",
        null=True,
        blank=True,
        default=None,
    )

    # Em caso de erro o Job fica com status 'Failed'
    # e a exceção e guardada neste campo.
    error = models.TextField(verbose_name="Error", null=True, blank=True)

    def __str__(self):
        return str(self.id)
