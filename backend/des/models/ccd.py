from des.models.exposure import Exposure
from django.db import models


class Ccd(models.Model):
    """
    Representa cada CCD de uma exposição feita pelo DES.
    Cada CCD está associado a uma exposição, possui uma coordenada central e as coordenadas que formam seu retangulo.
    As informações de tempo, data e da noite estão na tabela de exposição, por que são iguais para todos os ccds de uma mesma exposição.

    Neste Model a chave primaria é o campo que contem os dados de 'desfile_id'

    -- Query com as colunas referentes ao CCD.
    select desfile_id as id, ccdnum, ra_cent, dec_cent, rac1, rac2, rac3, rac4, decc1, decc2, decc3, decc4, crossra0, racmin, racmax, deccmin, deccmax, ra_size, dec_size, path, filename, compression, pfw_attempt_id as exposure_id from tno_pointing tp  order by pfw_attempt_id, ccdnum


    -- Preenche a tabela Des/CCD com os dados dos ccds que antes estavam na tno_pointing
    INSERT INTO public.des_ccd
    (id, ccdnum, ra_cent, dec_cent, rac1, rac2, rac3, rac4, decc1, decc2, decc3, decc4, crossra0, racmin, racmax, deccmin, deccmax, ra_size, dec_size, "path", filename, compression, exposure_id)
    select desfile_id as id, ccdnum, ra_cent, dec_cent, rac1, rac2, rac3, rac4, decc1, decc2, decc3, decc4, crossra0, racmin, racmax, deccmin, deccmax, ra_size, dec_size, path, filename, compression, pfw_attempt_id as exposure_id from tno_pointing tp  order by pfw_attempt_id, ccdnum;

    """

    # id = desfile_id
    id = models.BigIntegerField(
        primary_key=True,
        verbose_name="CCD Id",
        help_text="Unique identifier for each CCD. desfile_id in DES database.",
    )

    # Relation With Des Exposure
    exposure = models.ForeignKey(
        Exposure, on_delete=models.CASCADE, verbose_name="Exposure"
    )

    ccdnum = models.IntegerField(
        verbose_name="CCD", help_text="CCD Number (1, 2, ..., 62)"
    )

    ra_cent = models.FloatField(
        verbose_name="RA", help_text="Right ascension of the CCD center"
    )
    dec_cent = models.FloatField(
        verbose_name="Dec", help_text="Declination of the CCD center"
    )
    rac1 = models.FloatField(
        verbose_name="rac1", help_text="CCD Corner Coordinates 1 - upper left."
    )

    rac2 = models.FloatField(
        verbose_name="rac2", help_text="CCD Corner Coordinates 2 - lower left."
    )

    rac3 = models.FloatField(
        verbose_name="rac3", help_text="CCD Corner Coordinates 3 - lower right."
    )

    rac4 = models.FloatField(
        verbose_name="rac4", help_text="CCD Corner Coordinates 4 - upper right)."
    )

    decc1 = models.FloatField(
        verbose_name="decc1", help_text="CCD Corner Coordinates 1 - upper left."
    )

    decc2 = models.FloatField(
        verbose_name="decc2", help_text="CCD Corner Coordinates 2 - lower left."
    )

    decc3 = models.FloatField(
        verbose_name="decc3", help_text="CCD Corner Coordinates 3 - lower right."
    )

    decc4 = models.FloatField(
        verbose_name="decc4", help_text="CCD Corner Coordinates 4 - upper right)."
    )

    crossra0 = models.BooleanField(default=False, verbose_name="Cross RA 0")

    racmin = models.FloatField(
        verbose_name="racmin",
        help_text="Minimal and maximum right ascension respectively of the CCD cover.",
    )

    racmax = models.FloatField(
        verbose_name="racmax",
        help_text="Minimal and maximum right ascension respectively of the CCD cover.",
    )

    deccmin = models.FloatField(
        verbose_name="deccmin",
        help_text="Minimum and maximum declination respectively of the CCD cover.",
    )

    deccmax = models.FloatField(
        verbose_name="deccmax",
        help_text="Minimum and maximum declination respectively of the CCD cover.",
    )

    ra_size = models.DecimalField(
        verbose_name="ra_size",
        help_text="CCD dimensions in degrees (width × height).",
        decimal_places=7,
        max_digits=10,
    )

    dec_size = models.DecimalField(
        verbose_name="dec_size",
        help_text="CCD dimensions in degrees (width × height).",
        decimal_places=7,
        max_digits=10,
    )

    path = models.TextField(
        verbose_name="Path",
        help_text="Path in the DES database where the image is stored.",
    )

    filename = models.CharField(
        max_length=256,
        verbose_name="Filename",
        help_text="Name of FITS file with a CCD image.",
    )

    compression = models.CharField(
        max_length=5,
        verbose_name="Compression",
        help_text="Compression format (.fz) used in FITS files",
    )

    class Meta:
        indexes = [
            models.Index(fields=["filename"]),
        ]

    def __str__(self):
        return str(self.id)
