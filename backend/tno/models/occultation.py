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
    hash_id = models.CharField(
        max_length=26,
        verbose_name="Hash ID",
        null=True,
        blank=True,
        default=None,
        help_text="Unique hash identifier for the prediction event",
        unique=True,
    )
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

    # -------------------------------------------------
    # Informações da prediçao
    # -------------------------------------------------

    date_time = models.DateTimeField(
        verbose_name="Date Time", auto_now_add=False, null=False, blank=False
    )

    gaia_source_id = models.PositiveBigIntegerField(
        verbose_name="GAIA Source ID",
        null=True,
        blank=True,
        default=None,
        help_text="GAIA source id Star candidate",
    )

    ra_star_candidate = models.CharField(
        verbose_name="RA Star Candidate",
        max_length=20,
        null=False,
        blank=False,
        help_text="Star candidate right ascension (hh:mm:ss)",
    )

    dec_star_candidate = models.CharField(
        verbose_name="Dec Star Candidate",
        max_length=20,
        null=False,
        blank=False,
        help_text="Star candidate declination (dd:mm:ss)",
    )

    ra_target = models.CharField(
        verbose_name="RA Target",
        max_length=20,
        null=False,
        blank=False,
        help_text="Target's right ascension (hh:mm:ss)",
    )

    dec_target = models.CharField(
        verbose_name="Dec Target",
        max_length=20,
        null=False,
        blank=False,
        help_text="Target's declination (dd:mm:ss)",
    )

    closest_approach = models.FloatField(
        verbose_name="Closest approach",
        null=False,
        blank=False,
        default=0,
        help_text="Geocentric closest approach (arcsec)",
    )

    position_angle = models.FloatField(
        verbose_name="Position Angle",
        null=False,
        blank=False,
        default=0,
        help_text="Planet position angle with respect to star at C/A (degrees)",
    )

    velocity = models.FloatField(
        verbose_name="Velocity",
        null=False,
        blank=False,
        default=0,
        help_text="Velocity in plane of sky (km/s), positive= prograde, negative= retrograde",
    )

    delta = models.FloatField(
        verbose_name="Delta",
        null=False,
        blank=False,
        default=0,
        help_text="Planet range to Earth, AU",
    )

    g_star = models.FloatField(
        verbose_name="Gaia g magnitude",
        null=False,
        blank=False,
        default=0,
        help_text="Gaia g magnitude",
    )

    j_star = models.FloatField(
        verbose_name="2MASS J magnitude",
        null=True,
        blank=True,
        default=None,
        help_text="2MASS J magnitude",
    )

    h_star = models.FloatField(
        verbose_name="2MASS H magnitude",
        null=True,
        blank=True,
        default=None,
        help_text="2MASS H magnitude",
    )

    k_star = models.FloatField(
        verbose_name="2MASS K magnitude",
        null=True,
        blank=True,
        default=None,
        help_text="2MASS K magnitude",
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
        help_text="Is proper motion applied? (ok, no)",
        choices=(("ok", "ok"), ("no", "no")),
    )

    ct = models.CharField(
        max_length=10,
        verbose_name="ct",
        null=True,
        blank=True,
        default=None,
        help_text="Only Gaia DR1 stars are used",
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
        help_text="Star proper motion in right ascension (mas/yr); (0 when not provided by Gaia DR1)",
    )

    pmdec = models.FloatField(
        verbose_name="pmdec",
        null=True,
        blank=True,
        default=0,
        help_text="Star's proper motion in declination (mas/yr); (0 when not provided by Gaia DR1)",
    )

    ra_star_deg = models.FloatField(
        verbose_name="RA Star deg",
        help_text="Star's right ascension (degrees)",
        null=True,
        blank=True,
    )
    dec_star_deg = models.FloatField(
        verbose_name="Dec Star deg",
        help_text="Star's declination (degrees)",
        null=True,
        blank=True,
    )
    ra_target_deg = models.FloatField(
        verbose_name="RA Target deg",
        help_text="Target's right ascension (degrees)",
        null=True,
        blank=True,
    )

    dec_target_deg = models.FloatField(
        verbose_name="Dec Target deg",
        help_text="Target's declination (degrees)",
        null=True,
        blank=True,
    )

    magnitude_drop = models.FloatField(
        verbose_name="magnitude_drop",
        null=True,
        blank=True,
        default=None,
        help_text="Expected star's magnitude drop",
    )

    apparent_magnitude = models.FloatField(
        verbose_name="Apparent magnitude",
        help_text="Asteroids' apparent magnitude at the date (mag)",
        null=True,
        blank=True,
        default=None,
    )

    apparent_diameter = models.FloatField(
        verbose_name="apparent_diameter",
        null=True,
        blank=True,
        default=None,
        help_text="Apparent diameter of the Earth as seen from the Asteroid (degrees)",
    )

    event_duration = models.FloatField(
        verbose_name="event_duration",
        null=True,
        blank=True,
        default=None,
        help_text="Event duration (seconds)",
    )

    moon_separation = models.FloatField(
        verbose_name="moon_separation",
        null=True,
        blank=True,
        default=None,
        help_text="Moon distance to the object (degrees)",
    )

    sun_elongation = models.FloatField(
        verbose_name="sun_elongation",
        null=True,
        blank=True,
        default=None,
        help_text="Sun elongation (degrees)",
    )

    instant_uncertainty = models.FloatField(
        verbose_name="instant_uncertainty",
        null=True,
        blank=True,
        default=None,
        help_text="Instant of the closest approach uncertainty (seconds)",
    )

    closest_approach_uncertainty = models.FloatField(
        verbose_name="Closest approach uncertainty",
        null=True,
        blank=True,
        default=None,
        help_text="Uncertainty in geocentric closest approach (arcsec)",
    )

    moon_illuminated_fraction = models.FloatField(
        verbose_name="Moon illuminated fraction",
        null=True,
        blank=True,
        default=None,
        help_text="Fraction of the Moon illuminated at the instant of the event",
    )

    probability_of_centrality = models.FloatField(
        verbose_name="Probability of centrality of the event",
        null=True,
        blank=True,
        default=None,
        help_text="Indicates the probability that the event will happen at the indicated path",
    )

    closest_approach_uncertainty_km = models.FloatField(
        verbose_name="Closest approach uncertainty in km",
        null=True,
        blank=True,
        default=None,
        help_text="Uncertainty in geocentric closest approach (km)",
    )
    # ------------------------------------------------------
    # Colunas que aparentemente não esto sendo preenchidas
    # ------------------------------------------------------

    # remover quando possivel dependencia e colunas:
    #    [g_mag_vel_corrected, rp_mag_vel_corrected, bp_mag_vel_corrected,
    #     j_mag_vel_corrected, h_mag_vel_corrected, k_mag_vel_corrected]
    # ou adaptar esses valores somente para TNOs, pois não podem ser usados com
    # asteroides proximos (trata-se de uma determinacao empirica para objetos a
    # distancia media equivalente ao planeta anao Plutao)

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

    ra_star_with_pm = models.CharField(
        max_length=35,
        default=None,
        null=True,
        blank=True,
        verbose_name="ra_star_with_pm",
        help_text="Star's right ascension corrected for proper motion",
    )

    dec_star_with_pm = models.CharField(
        max_length=35,
        default=None,
        null=True,
        blank=True,
        verbose_name="dec_star_with_pm",
        help_text="Star's declination corrected for proper motion",
    )

    ra_star_to_date = models.CharField(
        max_length=35,
        default=None,
        null=True,
        blank=True,
        verbose_name="ra_star_to_date",
        help_text="Star's right ascension reduced to date",
    )

    dec_star_to_date = models.CharField(
        max_length=35,
        default=None,
        null=True,
        blank=True,
        verbose_name="dec_star_to_date",
        help_text="Star's declination reduced to date",
    )

    ra_target_apparent = models.CharField(
        max_length=20,
        null=True,
        blank=True,
        verbose_name="ra_target_apparent",
        help_text="Target's apparent right ascension",
    )

    dec_target_apparent = models.CharField(
        max_length=20,
        null=True,
        blank=True,
        verbose_name="dec_target_apparent",
        help_text="Target's apparent declination",
    )

    e_ra_target = models.FloatField(
        verbose_name="E_ra_target",
        null=True,
        blank=True,
        default=None,
        help_text="Error in target's right ascension",
    )

    e_dec_target = models.FloatField(
        verbose_name="E_dec_target",
        null=True,
        blank=True,
        default=None,
        help_text="Error in target's declination",
    )

    ephemeris_version = models.CharField(
        max_length=35,
        default=None,
        null=True,
        blank=True,
        verbose_name="Ephemeris version",
        help_text="Ephemeris version",
    )

    # ------------------------------------------------------
    # FIM Colunas que aparentemente não esto sendo preenchidas
    # ------------------------------------------------------

    # -------------------------------------------------
    # Occultation Path Fields.
    # -------------------------------------------------
    have_path_coeff = models.BooleanField(
        verbose_name="Has path coefficients",
        null=True,
        blank=True,
        default=False,
        help_text="Has path coefficients, i.e., the occultation passes over the earth;",
    )

    occ_path_min_longitude = models.FloatField(
        verbose_name="Minimum longitude",
        null=True,
        blank=True,
        default=None,
        help_text="Minimum longitude the occultation path reaches. -90 +90",
    )

    occ_path_max_longitude = models.FloatField(
        verbose_name="Maximum longitude",
        null=True,
        blank=True,
        default=None,
        help_text="Maximum longitude the occultation path reaches. -90 +90",
    )

    occ_path_min_latitude = models.FloatField(
        verbose_name="Minimum latitude",
        null=True,
        blank=True,
        default=None,
        help_text="Minimum latitude the occultation path reaches. -180 +180",
    )

    occ_path_max_latitude = models.FloatField(
        verbose_name="Maximum latitude",
        null=True,
        blank=True,
        default=None,
        help_text="Maximum latitude the occultation path reaches. -180 +180",
    )

    occ_path_is_nightside = models.BooleanField(
        verbose_name="Occultation path nightside",
        null=True,
        blank=True,
        default=None,
        help_text="True if any part of the path crosses the nightside of the Earth",
    )

    occ_path_coeff = models.JSONField(
        verbose_name="Occultation path coefficients",
        null=True,
        blank=True,
        default=dict,
        help_text="Occultation path coefficients of the polynomial fit",
    )

    # -------------------------------------------------
    # MPC asteroid data used for prediction
    # -------------------------------------------------
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
        verbose_name="Perihelion",
        null=True,
        blank=True,
        default=None,
        help_text="Perihelion (AU)",
    )

    aphelion = models.FloatField(
        verbose_name="Aphelion",
        null=True,
        blank=True,
        default=None,
        help_text="Aphelion (AU)",
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
        help_text="Date of last observation included in orbit solution (YYYY-MM-DD format)",
        null=True,
        blank=True,
        default=None,
    )

    pha_flag = models.BooleanField(
        verbose_name="pha_flag", help_text="", null=True, blank=True, default=False
    )

    mpc_critical_list = models.BooleanField(
        verbose_name="mpc_critical_list",
        help_text="Critical objects numbered on the MPC list are those whose orbits require improvement",
        null=True,
        blank=True,
        default=False,
    )

    albedo = models.FloatField(
        verbose_name="albedo",
        help_text="Albedo",
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
        help_text="Mass upper error (kg)",
        null=True,
        blank=True,
        default=None,
    )

    mass_err_max = models.FloatField(
        verbose_name="mass_err_max",
        help_text="Mass lower error (kg)",
        null=True,
        blank=True,
        default=None,
    )
    # -------------------------------------------------
    # Provenance Fields
    # -------------------------------------------------
    catalog = models.CharField(
        max_length=10,
        default="GAIA DR3",
        null=True,
        blank=True,
        verbose_name="Stellar Catalog",
        help_text="Catalog of stars used in prediction. for example GAIA DR2",
    )

    predict_step = models.IntegerField(
        verbose_name="Prediction Step",
        help_text="Prediction step size (seconds)",
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
        help_text="Asteroid Bsp ephemeris data source. for example JPL.",
    )

    # Indica a Origem das Observations pode ser AstDys ou MPC
    obs_source = models.CharField(
        max_length=10,
        null=True,
        blank=True,
        default="MPC",
        verbose_name="Observation Source",
        help_text="Observation data source, AstDys or MPC.",
    )

    # Indica a Origem dos Orbital Elements pode ser AstDys ou MPC
    orb_ele_source = models.CharField(
        max_length=10,
        null=True,
        blank=True,
        default="MPC",
        verbose_name="Orbital Elements Source",
        help_text="Orbital Elements data source, AstDys or MPC.",
    )

    bsp_planetary = models.CharField(
        max_length=10,
        null=True,
        blank=True,
        default="de440",
        verbose_name="Planetary Ephemeris",
        help_text="File/version of planetary ephemeris used.",
    )

    leap_seconds = models.CharField(
        max_length=10,
        null=True,
        blank=True,
        default="naif0012",
        verbose_name="Leap Seconds",
        help_text="File/version of Leap Seconds used.",
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
    created_at = models.DateTimeField(verbose_name="Created at", auto_now_add=True)
    # Data de atualização do registro,
    # Após a criação do hash_id, os registro podem ser atualizadas.
    updated_at = models.DateTimeField(verbose_name="Updated at", auto_now=True)

    job_id = models.IntegerField(
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
        return f"{self.get_alias()}-{dt}.png"

    def get_map_filepath(self) -> Path:
        return Path.joinpath(settings.PREDICTION_MAP_DIR, self.get_map_filename())

    def map_exists(self) -> bool:
        return self.get_map_filepath().exists()

    def get_map_relative_url(self) -> Optional[str]:
        if self.map_exists():
            return urllib.parse.urljoin(
                settings.PREDICTION_MAP_URL, self.get_map_filename()
            )
        else:
            return None

    def map_is_updated(self) -> bool:
        # Verificar se a data de criação do mapa é mais recente do que a do evento.
        if not self.map_exists():
            return False

        map_date_time = datetime.fromtimestamp(
            self.get_map_filepath().stat().st_ctime
        ).astimezone(timezone.utc)
        return map_date_time > self.created_at

    class Meta:
        indexes = [
            # object identification indexes
            models.Index(
                fields=[
                    "name",
                ]
            ),
            models.Index(
                fields=[
                    "number",
                ]
            ),
            models.Index(
                fields=[
                    "principal_designation",
                ]
            ),
            models.Index(
                fields=[
                    "base_dynclass",
                ]
            ),
            models.Index(
                fields=[
                    "dynclass",
                ]
            ),
            models.Index(
                fields=[
                    "astorb_dynbaseclass",
                ]
            ),
            models.Index(
                fields=[
                    "astorb_dynsubclass",
                ]
            ),
            # event indexes
            models.Index(
                fields=[
                    "hash_id",
                ]
            ),
            models.Index(
                fields=[
                    "date_time",
                ]
            ),
            models.Index(
                fields=[
                    "g_star",
                ]
            ),
            models.Index(
                fields=[
                    "have_path_coeff",
                ]
            ),
            models.Index(
                fields=[
                    "occ_path_min_longitude",
                ]
            ),
            models.Index(
                fields=[
                    "occ_path_max_longitude",
                ]
            ),
            models.Index(
                fields=[
                    "occ_path_min_latitude",
                ]
            ),
            models.Index(
                fields=[
                    "occ_path_max_latitude",
                ]
            ),
            models.Index(
                fields=[
                    "occ_path_is_nightside",
                ]
            ),
            # Asteroid indexes
            models.Index(
                fields=[
                    "g",
                ]
            ),
            # Provenance indexes
            models.Index(
                fields=[
                    "created_at",
                ]
            ),
            models.Index(
                fields=[
                    "job_id",
                ]
            ),
        ]
