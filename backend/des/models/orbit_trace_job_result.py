from django.conf import settings
from django.db import models
from tno.models import Asteroid
from des.models import OrbitTraceJob


class OrbitTraceJobResult(models.Model):

    job = models.ForeignKey(
        OrbitTraceJob,
        on_delete=models.CASCADE,
        verbose_name="Orbit Trace Job",
    )

    asteroid = models.ForeignKey(
        Asteroid,
        on_delete=models.CASCADE,
        verbose_name="Asteroid",
    )

    name = models.CharField(
        max_length=100,
        verbose_name="Asteroid Name",
    )

    number = models.CharField(
        max_length=100,
        verbose_name="Asteroid Number",
        null=True,
        blank=True,        
    )

    base_dynclass = models.CharField(
        max_length=100,
        verbose_name="Asteroid Base DynClass",
    )

    dynclass = models.CharField(
        max_length=100,
        verbose_name="Asteroid DynClass",
    )

    status = models.IntegerField(
        verbose_name="Status",
        default=1,
        choices=(
            (1, "Success"),
            (2, "Failed"),
        ),
    )

    spk_id = models.CharField(
        max_length=100,
        null=True,
        blank=True,
        verbose_name="Spk Id",
    )

    observations = models.IntegerField(
        default=0,
        help_text="Observations Count",
        verbose_name="Observations Count",
    )

    ccds = models.IntegerField(
        default=0,
        help_text="CCDS Count",
        verbose_name="CCDS Count",
    )

    error = models.TextField(verbose_name="Error", null=True, blank=True)


    def __str__(self):
        return str(self.id)