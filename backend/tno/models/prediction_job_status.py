from django.db import models
from tno.models import PredictionJob


class PredictionJobStatus(models.Model):

    job = models.ForeignKey(
        PredictionJob,
        on_delete=models.CASCADE,
        verbose_name="Prediction Job",
    )

    step = models.IntegerField(
        verbose_name="Step",
        help_text="Identification of the step in the pipeline.",
        # TODO: Escolher nome para as etapas do pipeline.
        choices=((1, "Primeira Etapa"), (2, "Segunda Etapa"))
    )

    task = models.CharField(
        verbose_name="Task",
        max_length=100,
        help_text="Name of the task being executed.",
        default="",
    )

    # Status da etapa.
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

    count = models.IntegerField(
        verbose_name="Total Count",
        help_text="Total items to be processed in the step.",
        default=0
    )

    current = models.IntegerField(
        verbose_name="Current",
        help_text="Current position in execution.",
        default=0
    )

    average_time = models.FloatField(
        verbose_name="Average Time",
        help_text="Average time per item in seconds.",
        default=0
    )

    time_estimate = models.FloatField(
        verbose_name="Estimated Time",
        help_text="Estimated time to complete the step in seconds.",
        default=0
    )

    success = models.IntegerField(
        verbose_name="Success",
        help_text="Number of items successfully executed.",
        default=0
    )

    failures = models.IntegerField(
        verbose_name="Failures",
        help_text="Number of items that failed.",
        default=0
    )

    updated = models.DateTimeField(
        verbose_name="Updated",
        auto_now_add=True,
        null=True,
        blank=True
    )

    def __str__(self):
        return str(self.id)
