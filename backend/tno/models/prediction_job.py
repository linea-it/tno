from django.conf import settings
from django.db import models
from tno.models import Catalog


class PredictionJob(models.Model):

    # Usuario que solicitou a execução do Job.
    owner = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.CASCADE,
        verbose_name="Owner",
        related_name="predicition_run",
    )

    catalog = models.ForeignKey(
        Catalog,
        on_delete=models.CASCADE,
        verbose_name="Catalog",
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

    # Tempo médio de execução por Asteroid ( exec_time / count_asteroids) em segundos
    avg_exec_time = models.FloatField(
        verbose_name="Average Execution Time",
        help_text="average execution time per asteroid. (seconds)",
        null=True,
        blank=True,
        default=0,
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

    # data inicial .
    predict_start_date = models.DateField(
        verbose_name="Date Initial",
        help_text="Date Initial of Predictions",
        auto_now_add=False,
    )

    # data Final
    predict_end_date = models.DateField(
        verbose_name="Date Final of Predictions",
        help_text="Date Final of Predictions",
        auto_now_add=False,
    )

    predict_interval = models.CharField(
        verbose_name="Predict Interval",
        max_length=100,
        null=True,
        blank=True,
        default=None,
        help_text="Prediction range formatted with humanize.",
    )

    predict_step = models.IntegerField(
        verbose_name="Prediction Step",
        help_text="Prediction Step",
        default=600,
    )

    count_asteroids = models.IntegerField(
        verbose_name="Asteroids",
        help_text="Total asteroids selected to run this job",
        default=0,
    )

    count_asteroids_with_occ = models.IntegerField(
        verbose_name="Asteroids With Occultations",
        help_text="Total asteroids with at least one occultation event identified by predict occultation.",
        default=0,
    )

    count_occ = models.IntegerField(
        verbose_name="Occultations",
        help_text="Total occultation events identified by predict occultation.",
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

    error = models.TextField(verbose_name="Error", null=True, blank=True)

    traceback = models.TextField(verbose_name="Traceback", null=True, blank=True)

    def __str__(self):
        return str(self.id)
