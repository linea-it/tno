import urllib.parse
from datetime import datetime, timezone
from pathlib import Path
from typing import Optional

from django.conf import settings
from django.db import models

from tno.models import Asteroid

# TODO Squash Migrations:
# https://coderbook.com/@marcus/how-to-squash-and-merge-django-migrations/
class Occultation(models.Model):

    #-------------------------------------------------
    # Identificação do Objeto
    #-------------------------------------------------
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
        help_text="",
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
        verbose_name="Base Object classification",
        help_text="(ucd=“meta.code.class”) Base Object class (TNO, Centaur, Trojan, etc.).",
        max_length=24,
        default=None,
        null=True,
        blank=True,        
    )

    # TODO: Renomear este campo, Impacto grande.
    # 'skybot_dynsubclass'
    dynclass = models.CharField(
        verbose_name="Object classification",
        help_text="(ucd=“meta.code.class;src.class”) Object class (TNO, Centaur, Trojan, etc.).",
        max_length=24,
        default=None,
        null=True,
        blank=True,        
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

    #-------------------------------------------------
    # Informações da prediçao
    #-------------------------------------------------
    date_time = models.DateTimeField(
        verbose_name="Date Time", auto_now_add=False, null=False, blank=False
    )

    ra_star_candidate = models.CharField(
        verbose_name="RA Star Candidate",
        max_length=20,
        null=False,
        blank=False,
    )

    dec_star_candidate = models.CharField(
        verbose_name="Dec Star Candidate",
        max_length=20,
        null=False,
        blank=False,
    )

    ra_target = models.CharField(
        verbose_name="RA Target",
        max_length=20,
        null=False,
        blank=False,
    )

    dec_target = models.CharField(
        verbose_name="Dec Target",
        max_length=20,
        null=False,
        blank=False,
    )

    closest_approach = models.FloatField(
        verbose_name="Closest approach",
        null=False,
        blank=False,
        default=0,
        help_text="geocentric closest approach, in arcsec",
    )

    position_angle = models.FloatField(
        verbose_name="Position Angle",
        null=False,
        blank=False,
        default=0,
        help_text="Planet position angle wrt to star at C/A, in deg",
    )

    velocity = models.FloatField(
        verbose_name="Velocity",
        null=False,
        blank=False,
        default=0,
        help_text="velocity in plane of sky, in km/sec, positive= prograde, negative= retrograde",
    )

    delta = models.FloatField(
        verbose_name="Delta",
        null=False,
        blank=False,
        default=0,
        help_text="Planet range to Earth, AU",
    )

    g_star = models.FloatField(
        verbose_name="G*",
        null=False,
        blank=False,
        default=0,
        help_text="G*, J*, H*, K* are normalized magnitudes to a common",
    )

    j_star = models.FloatField(
        verbose_name="J*",
        null=True,
        blank=True,
        default=None,
        help_text="G*, J*, H*, K* are normalized magnitudes to a common",
    )

    h_star = models.FloatField(
        verbose_name="H*",
        null=True,
        blank=True,
        default=None,
        help_text="G*, J*, H*, K* are normalized magnitudes to a common",
    )

    k_star = models.FloatField(
        verbose_name="K*",
        null=True,
        blank=True,
        default=None,
        help_text="G*, J*, H*, K* are normalized magnitudes to a common",
    )

    long = models.FloatField(
        verbose_name="Long",
        null=False,
        blank=False,
        default=0,
        help_text="East longitude of sub-planet point, deg, positive towards East",
    )

    loc_t = models.TimeField(
        verbose_name="Loc. t.",
        null=True,
        blank=True,
        default=None,
        help_text="loc. t.= UT + long: local solar time at sub-planet point, hh:mm",
    )

    off_ra = models.FloatField(
        verbose_name="off_ra",
        null=True,
        blank=True,
        default=0,
        help_text="Offset applied to ephemeris off_ra(mas) = A * (t-t0) + B",
    )

    off_dec = models.FloatField(
        verbose_name="off_dec",
        null=True,
        blank=True,
        default=0,
        help_text="Offset applied to ephemeris off_de(mas) = C * (t-t0) + D",
    )

    proper_motion = models.CharField(
        max_length=2,
        verbose_name="Proper Motion",
        null=True,
        blank=True,
        default=None,
        help_text="proper motion applied? (ok, no)",
        choices=(("ok", "ok"), ("no", "no")),
    )

    ct = models.CharField(
        max_length=10,
        verbose_name="ct",
        null=True,
        blank=True,
        default=None,
        help_text="only Gaia DR1 stars are used",
    )

    multiplicity_flag = models.CharField(
        max_length=2,
        verbose_name="Multiplicity Flag",
        null=True,
        blank=True,
        default=None,
        help_text="multiplicity flag (not applicable here) (see details in Assafin et al. 2010)",
        choices=(
            ("0", "no multiple entries per star in astrometry"),
            ("1", "single position from 2 or more uc/2m entries"),
            ("2", "single position from 1 uc/2m entry only"),
            ("3", "fs position from entry with more N contributions"),
            ("4", "fs position from entry with best (x,y) error"),
            ("5", "fs position from entry with brightest R mag."),
            ("6", "fs position from average over all entries."),
        ),
    )

    e_ra = models.FloatField(
        verbose_name="E_ra",
        null=True,
        blank=True,
        default=0,
        help_text="E_ra, E_dec: error of star position (mas)",
    )

    e_dec = models.FloatField(
        verbose_name="E_dec",
        null=True,
        blank=True,
        default=0,
        help_text="E_ra, E_dec: error of star position (mas)",
    )

    pmra = models.FloatField(
        verbose_name="pmra",
        null=True,
        blank=True,
        default=0,
        help_text="star proper motion (mas/yr); (0 when not provided by Gaia DR1)",
    )

    pmdec = models.FloatField(
        verbose_name="pmdec",
        null=True,
        blank=True,
        default=0,
        help_text="star proper motion (mas/yr); (0 when not provided by Gaia DR1)",
    )

    ra_star_deg = models.FloatField(
        verbose_name="RA Star (deg)",
        help_text="Right ascension of star in degrees",
        null=True,
        blank=True,
    )
    dec_star_deg = models.FloatField(
        verbose_name="Dec Star (deg)",
        help_text="Declination of star in degrees",
        null=True,
        blank=True,
    )
    ra_target_deg = models.FloatField(
        verbose_name="RA Target (deg)",
        help_text="Right ascension of target in degrees",
        null=True,
        blank=True,
    )

    dec_target_deg = models.FloatField(
        verbose_name="Dec Target (deg)",
        help_text="Declination of target in degrees",
        null=True,
        blank=True,
    )

    g_mag_vel_corrected = models.FloatField(
        verbose_name="g_mag_vel_corrected",
        null=True,
        blank=True,
        default=None,
        help_text="Gaia magnitude corrected from velocity",
    )

    rp_mag_vel_corrected = models.FloatField(
        verbose_name="rp_mag_vel_corrected",
        null=True,
        blank=True,
        default=None,
        help_text="Gaia RP magnitude corrected from velocity",
    )

    h_mag_vel_corrected = models.FloatField(
        verbose_name="h_mag_vel_corrected",
        null=True,
        blank=True,
        default=None,
        help_text="2MASS H magnitude corrected from velocity",
    )

    magnitude_drop = models.FloatField(
        verbose_name="magnitude_drop",
        null=True,
        blank=True,
        default=None,
        help_text="Magnitude drop",
    )

    instant_uncertainty = models.FloatField(
        verbose_name="instant_uncertainty",
        null=True,
        blank=True,
        default=None,
        help_text="Instant uncertainty",
    )

    ra_star_with_pm = models.CharField(
        max_length=35,
        default=None,
        null=True,
        blank=True,
        verbose_name="ra_star_with_pm",
        help_text="ra_star_with_pm",
    )

    dec_star_with_pm = models.CharField(
        max_length=35,
        default=None,
        null=True,
        blank=True,
        verbose_name="dec_star_with_pm",
        help_text="dec_star_with_pm",
    )

    ra_star_to_date = models.CharField(
        max_length=35,
        default=None,
        null=True,
        blank=True,
        verbose_name="ra_star_to_date",
        help_text="ra_star_to_date",
    )

    dec_star_to_date = models.CharField(
        max_length=35,
        default=None,
        null=True,
        blank=True,
        verbose_name="dec_star_to_date",
        help_text="dec_star_to_date",
    )

    aparent_diameter = models.FloatField(
        verbose_name="aparent_diameter",
        null=True,
        blank=True,
        default=None,
        help_text="Aparent diameter em graus.",
    )

    ra_target_apparent = models.CharField(
        max_length=20,
        null=True,
        blank=True,
        verbose_name="ra_target_apparent",
    )

    dec_target_apparent = models.CharField(
        max_length=20,
        null=True,
        blank=True,
        verbose_name="dec_target_apparent",
    )

    e_ra_target = models.FloatField(
        verbose_name="E_ra_target",
        null=True,
        blank=True,
        default=None,
        help_text="E_ra_target",
    )

    e_dec_target = models.FloatField(
        verbose_name="E_dec_target",
        null=True,
        blank=True,
        default=None,
        help_text="E_dec_target",
    )

    apparent_magnitude = models.CharField(
        max_length=35,
        default=None,
        null=True,
        blank=True,
        verbose_name="Apparent magnitude",
        help_text="Apparent magnitude",
    )

    ephemeris_version = models.CharField(
        max_length=35,
        default=None,
        null=True,
        blank=True,
        verbose_name="Ephemeris version",
        help_text="Ephemeris version",
    )

    # semimajor_axis = models.FloatField(
    #     verbose_name="Semimajor axis",
    #     null=True,
    #     blank=True,
    #     default=None,
    #     help_text="Semimajor axis",
    # )

    eccentricity = models.FloatField(
        verbose_name="Eccentricity",
        null=True,
        blank=True,
        default=None,
        help_text="Eccentricity",
    )

    inclination = models.FloatField(
        verbose_name="Inclination",
        null=True,
        blank=True,
        default=None,
        help_text="Inclination",
    )

    perihelion = models.FloatField(
        verbose_name="Perihelion",
        null=True,
        blank=True,
        default=None,
        help_text="Perihelion",
    )

    aphelion = models.FloatField(
        verbose_name="Aphelion",
        null=True,
        blank=True,
        default=None,
        help_text="Aphelion",
    )

    #-------------------------------------------------
    # Occultation Path Fields.
    #-------------------------------------------------
    have_path_coeff = models.BooleanField(
        verbose_name="Have Path Coeff",
        null=True,
        blank=True,
        default=False,
        help_text="Have Path Coeff",
    )

    occ_path_min_longitude = models.FloatField(
        verbose_name="Min Logintude",
        null=True,
        blank=True,
        default=None,
        help_text="Min Logintude Occultation Path",
    )

    occ_path_max_longitude = models.FloatField(
        verbose_name="Max Logintude",
        null=True,
        blank=True,
        default=None,
        help_text="Max Logintude Occultation Path",
    )

    occ_path_min_latitude = models.FloatField(
        verbose_name="Min Latitude",
        null=True,
        blank=True,
        default=None,
        help_text="Min Latitude Occultation Path. -180 +180",
    )

    occ_path_max_latitude = models.FloatField(
        verbose_name="Max Latitude",
        null=True,
        blank=True,
        default=None,
        help_text="Max Latitude Occultation Path. -180 +180",
    )   

    occ_path_is_nightside = models.BooleanField(
        verbose_name="Occultation Path Nightside",
        null=True,
        blank=True,
        default=None,
        help_text="True if any part of the path occurs at night",        
    )

    occ_path_coeff = models.JSONField(
        verbose_name="Occultation Path Coeff",
        null=True,
        blank=True,
        default=dict,
        help_text="Occultation Path Coeff",
    )

    #-------------------------------------------------
    # MPC asteroid data used for prediction
    #-------------------------------------------------
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
        help_text="Diametro do asteroid em km.",
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
    #-------------------------------------------------
    # Provenance Fields
    #-------------------------------------------------
    catalog = models.CharField(
        max_length=10,
        default="GAIA DR2",
        null=True,
        blank=True,
        verbose_name="Stellar Catalog",
        help_text="Catalog of stars used in prediction. for example GAIA DR2",
    )

    predict_step = models.IntegerField(
        verbose_name="Prediction Step",
        help_text="Prediction Step",
        null=True,
        blank=True,
        default=600,
    )

    # Indica a Origem do aquivo BSP do Asteroid. atualmente JPL.
    bsp_source = models.CharField(
        max_length=10,
        null=True,
        blank=True,
        default="JPL",
        verbose_name="Bsp Source",
        help_text="Asteroid Bsp ephemeris data source. for example JPL."
    )

    # Indica a Origem das Observations pode ser AstDys ou MPC
    obs_source = models.CharField(
        max_length=10,
        null=True,
        blank=True,
        default="MPC",
        verbose_name="Observation Source",
        help_text="Observation data source, AstDys or MPC."
    )

    # Indica a Origem dos Orbital Elements pode ser AstDys ou MPC
    orb_ele_source = models.CharField(
        max_length=10,
        null=True,
        blank=True,
        default="MPC",
        verbose_name="Orbital Elements Source",
        help_text="Orbital Elements data source, AstDys or MPC."
    )

    bsp_planetary = models.CharField(
        max_length=10,
        null=True,
        blank=True,
        default="de440",
        verbose_name="Planetary Ephemeris",
        help_text="File/version of planetary ephemeris used."
    )

    leap_seconds = models.CharField(
        max_length=10,
        null=True,
        blank=True,
        default="naif0012",
        verbose_name="Leap Seconds",
        help_text="File/version of Leap Seconds used."
    )

    nima = models.BooleanField(
        verbose_name="NIMA",
        null=True,
        blank=True,
        default=False,
        help_text="True if the prediction used NIMA results.",        
    )

    # Data de criação do registro,
    # Representa o momento em que o evento foi identificado/processado
    # Como esta tabela nunca é update, cada novo processamento é um delete/insert
    # este campo sempre representa o momento da ultima atualização deste evento de
    # ocultação.
    created_at = models.DateTimeField(
        verbose_name="Created at",
        auto_now_add=True
    )


    job_id =  models.IntegerField(
        verbose_name="Prediction Job",
        help_text="Identification of the prediction job that generated this prediction.",
        null=True,
        blank=True,
        default=None,
    )

    def get_alias(self) -> str:
        return self.alias

    def get_map_filename(self) -> str:
        dt = self.date_time.strftime("%Y%m%d%H%M%S")
        return f"{self.get_alias()}-{dt}.jpg"

    def get_map_filepath(self) -> Path:
        return Path.joinpath(settings.PREDICTION_MAP_DIR, self.get_map_filename())

    def map_exists(self) -> bool:
        return self.get_map_filepath().exists()

    def get_map_relative_url(self) -> Optional[str]:
        if self.map_exists():
            return urllib.parse.urljoin(settings.PREDICTION_MAP_URL, self.get_map_filename())
        else:
            return None

    def map_is_updated(self) -> bool:
        # Verificar se a data de criação do mapa é mais recente do que a do evento.
        if not self.map_exists():
            return False

        map_date_time = datetime.fromtimestamp(
            self.get_map_filepath().stat().st_ctime).astimezone(timezone.utc)
        return map_date_time > self.created_at

    class Meta:
        indexes = [
            # object identification indexes
            models.Index(fields=['name',]),
            models.Index(fields=['number',]),
            models.Index(fields=['principal_designation',]),
            models.Index(fields=['base_dynclass',]),
            models.Index(fields=['dynclass',]),
            models.Index(fields=['astorb_dynbaseclass',]),
            models.Index(fields=['astorb_dynsubclass',]),
            # event indexes
            models.Index(fields=['date_time',]),
            models.Index(fields=['g_star',]),
            models.Index(fields=['have_path_coeff',]),
            models.Index(fields=['occ_path_min_longitude',]),
            models.Index(fields=['occ_path_max_longitude',]),
            models.Index(fields=['occ_path_min_latitude',]),
            models.Index(fields=['occ_path_max_latitude',]),
            models.Index(fields=['occ_path_is_nightside',]),
            # Asteroid indexes
            models.Index(fields=['g',]),
            # Provenance indexes
            models.Index(fields=['created_at',]),
            models.Index(fields=['job_id',]),            
            
        ]