from django.db import models

from des.models import Ccd, Exposure
from skybot.models import Position
from tno.models import Asteroid


class Observation(models.Model):
    """
    Representa as Observações para os asteroids que estão dentro de algum CCD do DES,
    depois de processado pelo pipeline Orbit Trace
    """

    # Ligação com a tabela de tno.asteroids.
    # Associa a observação a um asteroid.
    asteroid = models.ForeignKey(
        Asteroid,
        on_delete=models.CASCADE,
        verbose_name="Asteroid",
    )

    # Ligação com a tabela de apontamentos.
    # Este campo representa um CCD unico. que é a composição de
    # CCD = Parte de uma exposição, em uma data/hora, banda, uma area retangular com um numero que vai de 1 a 62.
    # Importante: O campo que representa um CCD individualmente no des é o desfile_id.
    ccd = models.ForeignKey(
        Ccd,
        on_delete=models.CASCADE,
        verbose_name="CCD",
        help_text="Field that identifies an CCD in the DES CCD table. represents desfile_id",
    )

    name = models.CharField(
        max_length=32,
        verbose_name="Name",
        db_index=True,
        help_text="(ucd=“meta.id;meta.main”) Object name (official or provisional designation).",
    )

    date_obs = models.DateTimeField(
        verbose_name="Observation Date",
        db_index=True,
        help_text="Date and time of observation already applied the DES correction.",
    )

    date_jd = models.CharField(
        verbose_name="Observation Date (JD)",
        max_length=50,
        help_text="Date and time of observation in Julian date already applied the DES correction.",
    )

    ra = models.FloatField(
        verbose_name="RA (deg)",
    )
    dec = models.FloatField(verbose_name="Dec (deg)")

    offset_ra = models.FloatField(verbose_name="Offset RA (deg)")

    offset_dec = models.FloatField(verbose_name="Offset Dec (deg)")

    mag_psf = models.FloatField(verbose_name="Mag PSF", null=True, blank=True)

    mag_psf_err = models.FloatField(verbose_name="Mag PSF Error", null=True, blank=True)

    class Meta:
        # A mesma posição não pode se repetir em um mesmo ccd para um mesmo asteroid.
        unique_together = (
            "asteroid",
            "ccd",
        )
        indexes = [
            models.Index(fields=["name"]),
            models.Index(fields=["date_obs"]),
        ]

    def __str__(self):
        return str(self.id)
