
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
        help_text="",
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
        verbose_name="Base Object classification",
        help_text="(ucd=“meta.code.class”) Base Object class (TNO, Centaur, Trojan, etc.).",
        db_index=True,
    )

    # 'skybot_dynsubclass'
    dynclass = models.CharField(
        max_length=35,
        verbose_name="Object classification",
        db_index=True,
        help_text="(ucd=“meta.code.class;src.class”) Object class (TNO, Centaur, Trojan, etc.).",
    )

    astorb_dynbaseclass = models.CharField(
        max_length=35,
        verbose_name="Astorb Dynbaseclass",
        help_text="",
        db_index=True,
        null=True,
        blank=True,
        default=None,        
    )

    astorb_dynsubclass = models.CharField(
        max_length=35,
        verbose_name="Astorb Dynsubclass",
        help_text="",
        db_index=True,
        null=True,
        blank=True,
        default=None,        
    )

    h = models.FloatField(
        verbose_name = "h",
        help_text="",
        null=True,
        blank=True,
        default=None,        
    )

    g = models.FloatField(
        verbose_name = "g",
        help_text="",
        null=True,
        blank=True,
        default=None,        
    )
    
    epoch = models.FloatField(
        verbose_name = "epoch",
        help_text="",
        null=True,
        blank=True,
        default=None,        
    )

    semimajor_axis = models.FloatField(
        verbose_name = "Semimajor Axis",
        help_text="",
        null=True,
        blank=True,
        default=None,        
    )

    excentricity = models.FloatField(
        verbose_name = "Excentricity",
        help_text="",
        null=True,
        blank=True,
        default=None,        
    )

    inclination = models.FloatField(
        verbose_name = "Inclination",
        help_text="",
        null=True,
        blank=True,
        default=None,        
    )

    long_asc_node = models.FloatField(
        verbose_name = "Long asc node",
        help_text="",
        null=True,
        blank=True,
        default=None,        
    )

    arg_perihelion = models.FloatField(
        verbose_name = "Arg perihelion",
        help_text="",
        null=True,
        blank=True,
        default=None,        
    )

    mean_anomaly = models.FloatField(
        verbose_name = "Mean anomaly",
        help_text="",
        null=True,
        blank=True,
        default=None,        
    )
    
    mean_daily_motion = models.FloatField(
        verbose_name = "Mean daily motion",
        help_text="",
        null=True,
        blank=True,
        default=None,        
    )

    perihelion_dist = models.FloatField(
        verbose_name = "Perihelion dist",
        help_text="",
        null=True,
        blank=True,
        default=None,        
    )

    aphelion_dist = models.FloatField(
        verbose_name = "Aphelion dist",
        help_text="",
        null=True,
        blank=True,
        default=None,        
    )

    rms = models.FloatField(
        verbose_name = "rms",
        help_text="",
        null=True,
        blank=True,
        default=None,        
    )

    last_obs_included = models.DateField(
        verbose_name = "Last obs included",
        help_text="",
        null=True,
        blank=True,
        default=None,        
    )

    pha_flag = models.BooleanField(
        verbose_name = "pha_flag",
        help_text="",
        default=False
    )

    mpc_critical_list = models.BooleanField(
        verbose_name = "MPC critical list",
        help_text="",
        default=False
    )

    albedo = models.FloatField(
        verbose_name = "albedo",
        help_text="",
        null=True,
        blank=True,
        default=None, 
    )

    albedo_err_min = models.FloatField(
        verbose_name = "albedo_err_min",
        help_text="",
        null=True,
        blank=True,
        default=None, 
    )

    albedo_err_max = models.FloatField(
        verbose_name = "albedo_err_max",
        help_text="",
        null=True,
        blank=True,
        default=None, 
    )

    density = models.FloatField(
        verbose_name = "density",
        help_text="",
        null=True,
        blank=True,
        default=None, 
    )

    density_err_min = models.FloatField(
        verbose_name = "density_err_min",
        help_text="",
        null=True,
        blank=True,
        default=None, 
    )

    density_err_max = models.FloatField(
        verbose_name = "density_err_max",
        help_text="",
        null=True,
        blank=True,
        default=None, 
    )

    diameter = models.FloatField(
        verbose_name = "diameter",
        help_text="",
        null=True,
        blank=True,
        default=None, 
    )

    diameter_err_min = models.FloatField(
        verbose_name = "diameter_err_min",
        help_text="",
        null=True,
        blank=True,
        default=None, 
    )

    diameter_err_max = models.FloatField(
        verbose_name = "diameter_err_max",
        help_text="",
        null=True,
        blank=True,
        default=None, 
    )

    mass = models.FloatField(
        verbose_name = "mass",
        help_text="",
        null=True,
        blank=True,
        default=None, 
    )

    mass_err_min = models.FloatField(
        verbose_name = "mass_err_min",
        help_text="",
        null=True,
        blank=True,
        default=None, 
    )
    
    mass_err_max = models.FloatField(
        verbose_name = "mass_err_max",
        help_text="",
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
        alias = self.name.replace(" ", "").replace("_", "").replace("-", "").replace("/", "")
        return alias
