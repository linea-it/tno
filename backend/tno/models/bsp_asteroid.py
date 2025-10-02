from django.db import models
from tno.models import Asteroid


class BspAsteroid(models.Model):
    # -------------------------------------------------
    # Identificação do Objeto
    # -------------------------------------------------
    name = models.CharField(
        max_length=35,
        verbose_name="Name",
        help_text="(ucd=“meta.id;meta.main”) Object name (official or provisional designation).",
    )

    number = models.PositiveBigIntegerField(
        default=None,
        null=True,
        blank=True,
        verbose_name="Number",
        help_text="(ucd=“meta.id;meta.number”) Object number (not all objects have numbers assigned).",
    )

    principal_designation = models.CharField(
        max_length=35,
        verbose_name="Principal Designation",
        help_text="Principal designation assigned by the International Astronomical Union (IAU)",
        default=None,
        null=True,
        blank=True,
    )

    alias = models.CharField(
        max_length=35,
        verbose_name="Alias",
        help_text="Alias used internally as an internal name, formed by the name without special characters and with the addition of sequential numbers if necessary.",
        null=True,
        blank=True,
        default=None,
    )
    # TODO: Renomear este campo, Impacto grande.
    # 'skybot_dynbaseclass',
    base_dynclass = models.CharField(
        verbose_name="Object's base dynamical classification as defined by Skybot",
        help_text="(ucd=“meta.code.class”) Object's base dynamical classification as defined by Skybot (KBO, Centaur, Trojan, MB, etc.).",
        max_length=24,
        default=None,
        null=True,
        blank=True,
    )

    # TODO: Renomear este campo, Impacto grande.
    # 'skybot_dynsubclass'
    dynclass = models.CharField(
        verbose_name="Object's dynamical subclass as defined by Skybot",
        help_text="(ucd=“meta.code.class;src.class”) Object's dynamical subclass as defined by Skybot (KBO>Resonant>12:5, MB>Inner, etc.).",
        max_length=24,
        default=None,
        null=True,
        blank=True,
    )

    # BSP specific fields
    source = models.CharField(
        max_length=5,
        verbose_name="Source",
        help_text="Source of the BSP data. Possible values: 'JPL', 'NIMA'.",
        default='JPL',
    )

    spkid = models.CharField(
        max_length=35,
        verbose_name="SPKID",
        default=None,
        null=True,
        blank=True,
    )

    orbit_id = models.CharField(
        max_length=35,
        verbose_name="Orbit ID",
        help_text="Identifier for the specific orbit solution used to generate the BSP file.",
        default=None,
        null=True,
        blank=True,
    )

    filename = models.CharField(
        max_length=255,
        verbose_name="Filename",
        help_text="Name of the BSP file associated with this asteroid.",
    )

    start_period = models.DateField(
        verbose_name="Start Period",
        help_text="Start date of the period covered by the BSP file.",
    )

    end_period = models.DateField(
        verbose_name="End Period",
        help_text="End date of the period covered by the BSP file.",
    )

    size = models.PositiveIntegerField(
        verbose_name="Size (bytes)",
        help_text="Size of the BSP file in bytes.",
    )

    mag_and_uncert_filename = models.CharField(
        max_length=255,
        verbose_name="Magnitude and Uncertainty Filename",
        help_text="Name of the file containing magnitude and uncertainty data associated with this asteroid.",
    )
    
    mag_and_uncert_size = models.PositiveIntegerField(
        verbose_name="Magnitude and Uncertainty File Size (bytes)",
        help_text="Size of the magnitude and uncertainty file in bytes.",
    )

    # Download statistics
    dw_start = models.DateTimeField(
        verbose_name="Download Start Time",
        help_text="Timestamp of the start download of this BSP file.",
        null=True,
        blank=True,
        default=None,
    )

    dw_finish = models.DateTimeField(
        verbose_name="Download Finish Time",
        help_text="Timestamp of the finish download of this BSP file.",
        null=True,
        blank=True,
        default=None,
    )

    dw_time = models.FloatField(
        verbose_name="Download Time (seconds)",
        help_text="Total time taken to download the BSP file, in seconds.",
        default=0
    )