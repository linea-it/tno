
from django.conf import settings
from django.db import models

class AsteroidJob (models.Model):

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

    asteroids_before = models.IntegerField(
        verbose_name="Asteroids Before",
        help_text="Total asteroids antes da execução",
        default=0,
    )

    asteroids_after = models.IntegerField(
        verbose_name="Asteroids After",
        help_text="Total asteroids após a execução",
        default=0,
    )

    # Pasta onde estão os dados do Job.
    path = models.CharField(
        verbose_name="Path",
        help_text="Path to the directory where the job data is located.",
        max_length=2048,
        null=True,
        blank=True
    )

    error = models.TextField(verbose_name="Error", null=True, blank=True)

    traceback = models.TextField(
        verbose_name="Traceback", null=True, blank=True)

    def __str__(self):
        return str(self.id)
