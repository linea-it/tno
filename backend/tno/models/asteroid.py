from django.db import models


class Asteroid(models.Model):

    name = models.CharField(
        max_length=35,
        verbose_name="Name",
        unique=True,
        db_index=True,
        help_text="(ucd=“meta.id;meta.main”) Object name (official or provisional designation).",
    )

    number = models.PositiveBigIntegerField(
        default=None,
        null=True,
        blank=True,
        verbose_name="Number",
        db_index=True,
        help_text="(ucd=“meta.id;meta.number”) Object number (not all objects have numbers assigned).",
    )

    principal_designation = models.CharField(
        max_length=35,
        verbose_name="Principal Designation",
        help_text="Principal designation assigned by the International Astronomical Union (IAU)",
        db_index=True,
        default=None,
        null=True,
        blank=True,
    )

    alias = models.CharField(
        max_length=35,
        verbose_name="Alias used internally as an internal name, formed by the name without special characters and with the addition of sequential numbers if necessary.",
        help_text="",
        null=True,
        blank=True,
        default=None,
    )
    # TODO: Renomear este campo, Impacto grande.
    # 'skybot_dynbaseclass',
    base_dynclass = models.CharField(
        max_length=35,
        verbose_name="Object's base dynamical classification as defined by Skybot",
        help_text="(ucd=“meta.code.class”) Object's base dynamical classification as defined by Skybot (KBO, Centaur, Trojan, MB, etc.).",
        db_index=True,
    )

    # 'skybot_dynsubclass'
    dynclass = models.CharField(
        max_length=35,
        verbose_name="Object's dynamical subclass as defined by Skybot",
        db_index=True,
        help_text="(ucd=“meta.code.class;src.class”) Object's dynamical subclass as defined by Skybot (KBO>Resonant>12:5, MB>Inner, etc.).",
    )

    astorb_dynbaseclass = models.CharField(
        max_length=35,
        verbose_name="Object's base dynamical classification as defined by AstOrb",
        help_text="Object's base dynamical classification as defined by AstOrb (Lowell Observatory)",
        db_index=True,
        null=True,
        blank=True,
        default=None,
    )

    astorb_dynsubclass = models.CharField(
        max_length=35,
        verbose_name="Object's dynamical subclass as defined by AstOrb",
        help_text="Object's dynamical subclass as defined by AstOrb (Lowell Observatory)",
        db_index=True,
        null=True,
        blank=True,
        default=None,
    )

    h = models.FloatField(
        verbose_name="H",
        help_text="Absolute magnitude",
        null=True,
        blank=True,
        default=None,
    )

    g = models.FloatField(
        verbose_name="G",
        help_text="Phase slope parameter",
        null=True,
        blank=True,
        default=None,
    )

    epoch = models.FloatField(
        verbose_name="Epoch of the orbit",
        help_text="Epoch of the orbit (Julian Date)",
        null=True,
        blank=True,
        default=None,
    )

    semimajor_axis = models.FloatField(
        verbose_name="Semimajor axis",
        help_text="Semimajor axis (AU)",
        null=True,
        blank=True,
        default=None,
    )

    eccentricity = models.FloatField(
        verbose_name="Eccentricity",
        help_text="Eccentricity",
        null=True,
        blank=True,
        default=None,
    )

    inclination = models.FloatField(
        verbose_name="Inclination",
        help_text="Inclination (degres)",
        null=True,
        blank=True,
        default=None,
    )

    long_asc_node = models.FloatField(
        verbose_name="Longitude of the ascending node",
        help_text="Longitude of the ascending node, J2000.0 (degrees)",
        null=True,
        blank=True,
        default=None,
    )

    arg_perihelion = models.FloatField(
        verbose_name="Argument of perihelion",
        help_text="Argument of perihelion, J2000.0 (degrees)",
        null=True,
        blank=True,
        default=None,
    )

    mean_anomaly = models.FloatField(
        verbose_name="Mean anomaly",
        help_text="Mean anomaly at the epoch (degrees)",
        null=True,
        blank=True,
        default=None,
    )

    mean_daily_motion = models.FloatField(
        verbose_name="Mean daily motion",
        help_text="Mean daily motion (degrees/day)",
        null=True,
        blank=True,
        default=None,
    )

    perihelion = models.FloatField(
        verbose_name="Perihelion distance",
        help_text="Perihelion distance (AU)",
        null=True,
        blank=True,
        default=None,
    )

    aphelion = models.FloatField(
        verbose_name="Aphelion distance",
        help_text="Aphelion distance (AU)",
        null=True,
        blank=True,
        default=None,
    )

    rms = models.FloatField(
        verbose_name="r.m.s. residual",
        help_text="r.m.s. residual of the fit (arcsec)",
        null=True,
        blank=True,
        default=None,
    )

    last_obs_included = models.DateField(
        verbose_name="Date of last observation included",
        help_text="Date of last observation included in MPC orbit solution (YYYY-MM-DD format)",
        null=True,
        blank=True,
        default=None,
    )

    pha_flag = models.BooleanField(
        verbose_name="pha_flag",
        help_text="Potentially Hazardous Asteroid Flag",
        default=False,
    )

    mpc_critical_list = models.BooleanField(
        verbose_name="mpc_critical_list",
        help_text="Critical objects numbered on the MPC list are those whose orbits require improvement",
        default=False,
    )

    albedo = models.FloatField(
        verbose_name="albedo",
        help_text="Asteroid's surface reflectivity or brightness.",
        null=True,
        blank=True,
        default=None,
    )

    albedo_err_min = models.FloatField(
        verbose_name="albedo_err_min",
        help_text="Albedo lower error",
        null=True,
        blank=True,
        default=None,
    )

    albedo_err_max = models.FloatField(
        verbose_name="albedo_err_max",
        help_text="Albedo upper error",
        null=True,
        blank=True,
        default=None,
    )

    density = models.FloatField(
        verbose_name="density",
        help_text="Density (kg/m^3)",
        null=True,
        blank=True,
        default=None,
    )

    density_err_min = models.FloatField(
        verbose_name="density_err_min",
        help_text="Density lower error (kg/m^3)",
        null=True,
        blank=True,
        default=None,
    )

    density_err_max = models.FloatField(
        verbose_name="density_err_max",
        help_text="Density upper error (kg/m^3)",
        null=True,
        blank=True,
        default=None,
    )

    diameter = models.FloatField(
        verbose_name="diameter",
        help_text="Diameter (km)",
        null=True,
        blank=True,
        default=None,
    )

    diameter_err_min = models.FloatField(
        verbose_name="diameter_err_min",
        help_text="Diameter lower error (km)",
        null=True,
        blank=True,
        default=None,
    )

    diameter_err_max = models.FloatField(
        verbose_name="diameter_err_max",
        help_text="Diameter upper error (km)",
        null=True,
        blank=True,
        default=None,
    )

    mass = models.FloatField(
        verbose_name="mass",
        help_text="Mass (kg)",
        null=True,
        blank=True,
        default=None,
    )

    mass_err_min = models.FloatField(
        verbose_name="mass_err_min",
        help_text="Mass lower error (kg)",
        null=True,
        blank=True,
        default=None,
    )

    mass_err_max = models.FloatField(
        verbose_name="mass_err_max",
        help_text="Mass upper error (kg)",
        null=True,
        blank=True,
        default=None,
    )

    def __str__(self):
        if self.number:
            return "%s (%s)" % (self.name, self.number)
        else:
            return self.name

    def get_alias(self):
        alias = (
            self.name.replace(" ", "")
            .replace("_", "")
            .replace("-", "")
            .replace("/", "")
        )
        return alias
