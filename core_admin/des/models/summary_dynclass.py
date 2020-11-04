from django.conf import settings
from django.db import models
from des.models import SkybotJob

class SummaryDynclass(models.Model):
    """
        Representa um resumo dos resultados agrupados por Dynamic Classes.
    """

    # Des Skybot Job
    job = models.ForeignKey(
        SkybotJob,
        on_delete=models.CASCADE,
        verbose_name='Skybot Job',
        related_name='job_summary_dynclass'
    )

    # Dynamic Class
    dynclass = models.TextField(
        verbose_name='Dynamic Class',
        null=False,
        blank=False
    )

    # Quantidade de SSOs
    asteroids = models.IntegerField(
        verbose_name='Number of Asteroids',
        null=False,
        blank=False
    )

    # Quantidade de CCDs
    ccds = models.IntegerField(
        verbose_name='Number of CCDs',
        null=False,
        blank=False
    )

    # Quantidade de Observações
    positions = models.IntegerField(
        verbose_name='Number of Positions',
        null=False,
        blank=False
    )

    # Quantidade de SSOs na banda u
    u = models.IntegerField(
        verbose_name='Number of SSOs at u Band',
        null=False,
        blank=False
    )

    # Quantidade de SSOs na banda g
    g = models.IntegerField(
        verbose_name='Number of SSOs at g Band',
        null=False,
        blank=False
    )

    # Quantidade de SSOs na banda r
    r = models.IntegerField(
        verbose_name='Number of SSOs at r Band',
        null=False,
        blank=False
    )

    # Quantidade de SSOs na banda i
    i = models.IntegerField(
        verbose_name='Number of SSOs at i Band',
        null=False,
        blank=False
    )

    # Quantidade de SSOs na banda z
    z = models.IntegerField(
        verbose_name='Number of SSOs at z Band',
        null=False,
        blank=False
    )


    # Quantidade de SSOs na banda Y
    y = models.IntegerField(
        verbose_name='Number of SSOs at Y Band',
        null=False,
        blank=False
    )

    class Meta:
        indexes = [
            models.Index(fields=['dynclass']),
        ]

    def __str__(self):
        return str(self.id)
