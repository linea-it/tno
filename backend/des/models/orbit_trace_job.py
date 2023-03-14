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
        max_length=100,
        null=False,
        blank=False,
        verbose_name="Filter Type",
    )

    filter_value = models.CharField(
        max_length=100,
        null=False,
        blank=False,
        verbose_name="Filter Value",
    )

    count_asteroids = models.IntegerField(
        default=0,
        help_text="Asteroids Count",
        verbose_name="Asteroids Count",
    )

    count_ccds = models.IntegerField(
        default=0,
        help_text="CCDs Count",
        verbose_name="CCDs Count",
    )

    count_observations = models.IntegerField(
        default=0,
        help_text="Observations Count",
        verbose_name="Observations Count",
    )

    count_success = models.IntegerField(
        default=0,
        help_text="Success Count",
        verbose_name="Success Count",
    )

    count_failures = models.IntegerField(
        default=0,
        help_text="Failures Count",
        verbose_name="Failures Count",
    )

    parsl_init_blocks = models.IntegerField(
        default=0,
        help_text="parsl_init_blocks",
        verbose_name="parsl_init_blocks",
    )

    h_exec_time = models.IntegerField(
        default=0,
        help_text="h_exec_time",
        verbose_name="h_exec_time",
    )

    bps_days_to_expire = models.IntegerField(
        default=0,
        help_text="bps_days_to_expire",
        verbose_name="bps_days_to_expire",
    )

    #falso = todos os arquivosw retornados pelo skybot são apagados
    #true = os arquivos ficam na máquina referenciada no campo path
    debug = models.BooleanField(
        default=False,
        help_text="Debug",
        verbose_name="Debug",
    )

    time_profile = models.JSONField()

    # results = models.CharField(
    #     max_length=2048,
    #     verbose_name="Results",
    #     help_text="Filepath to the results.csv. this file contains the results of the job.",
    #     null=True,
    #     blank=True,
    #     default=None,
    # )

    # Pasta onde estão os dados do Job.
    path = models.CharField(
        max_length=2048,
        verbose_name="Path",
        help_text="Path to the directory where the job data is located.",
    )

    # Em caso de erro o Job fica com status 'Failed'
    # e a exceção e guardada neste campo.
    error = models.TextField(verbose_name="Error", null=True, blank=True)

    traceback = models.TextField(verbose_name="Traceback", null=True, blank=True)
    
    def __str__(self):
        return str(self.id)
