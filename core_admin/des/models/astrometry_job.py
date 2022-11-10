from django.db import models
from django.conf import settings


from django.conf import settings
from django.db import models


class AstrometryJob(models.Model):
    """
    Representa cada Job de Astrometria (Orbit Trace) que foi executado.
    """

    # Usuario que solicitou a execução do Job.
    owner = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.CASCADE,
        verbose_name="Owner",
        related_name="astrometry_job",
    )

    # Asteroids que serão processados,
    # pode ser um unico asteroid name ou uma lista separada por ;.
    asteroids = models.TextField(
        verbose_name="Asteroids",
        help_text="Asteroids that will be processed can be a single asteroid name or a list separated by ;",
        null=True,
        blank=True,
        default=None,
    )

    dynclass = models.CharField(
        max_length=24,
        verbose_name="Object classification",
        help_text="(ucd=“meta.code.class;src.class”) Object class (TNO, Centaur, Trojan, etc.).",
        null=True,
        blank=True,
        default=None,
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
            (7, "Launched"),
        ),
    )

    # Momento em que o Job foi criado.
    submit_time = models.DateTimeField(
        verbose_name="Submit Time",
        auto_now_add=True,
        null=True,
        blank=True,
    )

    # Momento em que o Job foi criado.
    start = models.DateTimeField(
        verbose_name="Start", auto_now_add=False, null=True, blank=True
    )

    # Momento em que o Job foi finalizado.
    finish = models.DateTimeField(
        verbose_name="Finish", auto_now_add=False, null=True, blank=True
    )

    # Tempo de duração do Job.
    execution_time = models.DurationField(
        verbose_name="Execution Time", null=True, blank=True
    )

    # Tempo de duração estimado no começo do Job
    estimated_execution_time = models.DurationField(
        verbose_name="Estimated Execution Time", null=True, blank=True
    )

    # Total de asteroids que serão executadas neste Job.
    t_asteroids = models.BigIntegerField(
        verbose_name="Total Asteroids",
        help_text="total asteroids that were run in this job",
        default=0,
    )

    # Total de ccds que serão executadas neste Job.
    t_ccds = models.BigIntegerField(
        verbose_name="Total CCDs",
        help_text="total ccds that were run in this job",
        default=0,
    )

    # Total de observations calculadas neste Job.
    t_observations = models.BigIntegerField(
        verbose_name="Total Observations",
        help_text="Total observations processed in this job",
        default=0,
    )

    # Pasta onde estão os dados do Job.
    path = models.CharField(
        max_length=2048,
        verbose_name="Path",
        help_text="Path to the directory where the job data is located.",
        null=True,
        blank=True,
    )

    # Em caso de erro o Job fica com status 'Failed'
    # e a exeção e guardada neste campo.
    error = models.TextField(verbose_name="Error", null=True, blank=True)

    traceback = models.TextField(verbose_name="Traceback", null=True, blank=True)

    def __str__(self):
        return str(self.id)
