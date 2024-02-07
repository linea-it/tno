from django.db import models


class JohnstonArchive(models.Model):
    """
    List of Known Trans-Neptunian Objects and other outer solar system objects

    Downloaded from: http://www.johnstonsarchive.net/astro/tnoslist.html

    Table includes TNOs, SDOs, and Centaurs listed by the MPC as of 7 October 2018,
    plus other unusual asteroids with aphelion distances greater than 7.5 AU,
    plus several additional reported objects without MPC designations.
    """

    class Meta:
        verbose_name = "Johnston Archive"
        verbose_name_plural = "Johnston Archive"

    number = models.CharField(
        max_length=6,
        verbose_name="Number",
        null=True,
        blank=True,
        default=None,
        help_text="(ucd=“meta.id;meta.number”) Object number (not all objects have numbers assigned).",
    )
    name = models.CharField(
        max_length=32,
        verbose_name="Name",
        help_text="(ucd=“meta.id;meta.main”) Object name (official or provisional designation).",
        null=True,
        blank=True,
        default=None,
    )
    provisional_designation = models.CharField(
        max_length=32, verbose_name="Provisional Designation"
    )
    dynamical_class = models.CharField(
        max_length=32,
        verbose_name="Dynamical Class",
        null=True,
        blank=True,
        default=None,
    )
    a = models.FloatField(verbose_name="a (AU)", null=True, blank=True, default=None)
    e = models.FloatField(verbose_name="e", null=True, blank=True, default=None)
    perihelion_distance = models.FloatField(
        verbose_name="perihelion distance",
        help_text="q (AU) perihelion distance",
        null=True,
        blank=True,
        default=None,
    )
    aphelion_distance = models.FloatField(
        verbose_name="aphelion distance",
        help_text="Q (AU) aphelion distance",
        null=True,
        blank=True,
        default=None,
    )
    i = models.FloatField(verbose_name="i (deg)", null=True, blank=True, default=None)
    diameter = models.FloatField(
        verbose_name="Diameter (Km)", null=True, blank=True, default=None
    )
    diameter_flag = models.BooleanField(
        verbose_name="Diameter Flag",
        default=False,
        help_text="Diameter values marked by True are estimated assuming an albedo of 0.09 (or for secondary components, assuming the same albedo as the primary). Remaining diameter values have been determined by various methods (combined optical/thermal observations, dynamical fits/assumed densities for binaries, direct imagery, or stellar occultation).",
    )
    albedo = models.FloatField(
        verbose_name="Albedo", null=True, blank=True, default=None
    )
    b_r_mag = models.FloatField(
        verbose_name="B-R mag",
        null=True,
        blank=True,
        default=None,
        help_text="B-R magnitude is the difference between blue filter magnitude and red filter magnitude; values greater than 1.03 indicate spectra redder than that of the Sun.",
    )
    taxon = models.CharField(
        max_length=10,
        verbose_name="Taxon Type",
        null=True,
        blank=True,
        default=None,
        help_text="Taxonomic type is from Belskaya et al., 2015, Icarus, 250:482-491.",
    )
    density = models.FloatField(
        verbose_name="Density (g/cm^3)", null=True, blank=True, default=None
    )
    known_components = models.CharField(
        max_length=64,
        verbose_name="known add'l components",
        null=True,
        blank=True,
        default=None,
    )
    discovery = models.DateField(
        verbose_name="Discovery",
        help_text="Discovery Year-Month",
        null=True,
        blank=True,
        default=None,
    )
    updated = models.DateTimeField(
        verbose_name="Updated", auto_now_add=True, null=True, blank=True
    )
