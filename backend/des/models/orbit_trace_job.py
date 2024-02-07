from django.conf import settings
from django.db import models
from tno.models import BspPlanetary, LeapSecond


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
            (7, "Aborting"),
        ),
    )

    # Momento em que o Job foi submetido.
    submit_time = models.DateTimeField(
        verbose_name="Submit Time",
        auto_now_add=True,
    )

    # Momento em que o Job foi criado.
    start = models.DateTimeField(
        verbose_name="Start", auto_now_add=False, null=True, blank=True
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

    bsp_planetary = models.ForeignKey(
        BspPlanetary,
        on_delete=models.CASCADE,
        verbose_name="Planetary Ephemeris",
    )

    leap_seconds = models.ForeignKey(
        LeapSecond,
        on_delete=models.CASCADE,
        verbose_name="Leap Second",
    )

    match_radius = models.FloatField(
        default=2,
        help_text="Exposure time of observation.",
        verbose_name="Match Radius",
    )

    filter_type = models.CharField(
        verbose_name="Filter Type",
        max_length=15,
        choices=(
            ("name", "Object name"),
            ("dynclass", "Dynamic class (with subclasses)"),
            ("base_dynclass", "Dynamic class"),
        ),
    )

    filter_value = models.TextField(
        verbose_name="Filter Value",
    )

    count_asteroids = models.IntegerField(
        verbose_name="Asteroids",
        help_text="Total asteroids selected to run this job",
        default=0,
    )

    count_ccds = models.IntegerField(
        verbose_name="CCDs",
        help_text="Total ccds processed in this job.",
        default=0,
    )

    count_observations = models.IntegerField(
        verbose_name="Observations Count",
        help_text="Total observations identified by the orbit trace.",
        default=0,
    )

    count_success = models.IntegerField(
        verbose_name="Success",
        help_text="Total asteroids successfully executed in all steps.",
        default=0,
    )

    count_failures = models.IntegerField(
        verbose_name="Failures Count",
        help_text="Total asteroids that failed at least one of the steps.",
        default=0,
    )

    h_exec_time = models.CharField(
        verbose_name="Human Exec Time",
        help_text="Execution Time formated with humanize.",
        max_length=100,
        null=True,
        default=None,
        blank=True,
    )

    debug = models.BooleanField(
        verbose_name="Debug",
        help_text="Debug False all log files and intermediate results will be deleted at the end of the job.",
        default=False,
    )

    # Pasta onde estão os dados do Job.
    path = models.CharField(
        verbose_name="Path",
        help_text="Path to the directory where the job data is located.",
        max_length=2048,
        null=True,
        blank=True,
    )

    # Em caso de erro o Job fica com status 'Failed'
    # e a exceção e guardada neste campo.
    error = models.TextField(verbose_name="Error", null=True, blank=True)

    traceback = models.TextField(verbose_name="Traceback", null=True, blank=True)

    # Tempo médio de execução por Asteroid ( exec_time / count_asteroids) em segundos
    avg_exec_time_asteroid = models.FloatField(
        verbose_name="Average Execution Time Asteroid",
        help_text="average execution time per asteroid. (seconds)",
        null=True,
        blank=True,
        default=0,
    )

    # Tempo médio de execução por Asteroid ( exec_time / count_ccds) em segundos
    avg_exec_time_ccd = models.FloatField(
        verbose_name="Average Execution Time CCD",
        help_text="average execution time per ccd. (seconds)",
        null=True,
        blank=True,
        default=0,
    )

    def __str__(self):
        return str(self.id)
