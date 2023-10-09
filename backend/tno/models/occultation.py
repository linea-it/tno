import urllib.parse
from datetime import datetime, timezone
from pathlib import Path
from typing import Optional

from django.conf import settings
from django.db import models

from tno.models import Asteroid


class Occultation(models.Model):

    asteroid = models.ForeignKey(
        Asteroid,
        on_delete=models.CASCADE,
        verbose_name="Asteroid",
        null=False,
        blank=False,
        related_name="occultation",
    )

    name = models.CharField(
        max_length=32,
        verbose_name="Name",
        db_index=True,
        help_text="(ucd=“meta.id;meta.main”) Object name (official or provisional designation).",
    )

    number = models.CharField(
        max_length=35,
        default=None,
        null=True,
        blank=True,
        verbose_name="Number",
        help_text="(ucd=“meta.id;meta.number”) Object number (not all objects have numbers assigned).",
    )

    date_time = models.DateTimeField(
        verbose_name="Date Time", auto_now_add=False, null=False, blank=False
    )

    ra_star_candidate = models.CharField(
        max_length=20,
        null=False,
        blank=False,
        verbose_name="RA Star Candidate",
    )

    dec_star_candidate = models.CharField(
        max_length=20,
        null=False,
        blank=False,
        verbose_name="Dec Star Candidate",
    )

    ra_target = models.CharField(
        max_length=20,
        null=False,
        blank=False,
        verbose_name="RA Target",
    )

    dec_target = models.CharField(
        max_length=20,
        null=False,
        blank=False,
        verbose_name="Dec Target",
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

    g = models.FloatField(
        verbose_name="G*",
        null=False,
        blank=False,
        default=0,
        help_text="G*, J*, H*, K* are normalized magnitudes to a common",
    )

    j = models.FloatField(
        verbose_name="J*",
        null=False,
        blank=False,
        default=0,
        help_text="G*, J*, H*, K* are normalized magnitudes to a common",
    )

    h = models.FloatField(
        verbose_name="H*",
        null=False,
        blank=False,
        default=0,
        help_text="G*, J*, H*, K* are normalized magnitudes to a common",
    )

    k = models.FloatField(
        verbose_name="K*",
        null=False,
        blank=False,
        default=0,
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

    # Data de criação do registro,
    # Representa o momento em que o evento foi identificado/processado
    # Como esta tabela nunca é update, cada novo processamento é um delete/insert
    # este campo sempre representa o momento da ultima atualização deste evento de
    # ocultação.
    created_at = models.DateTimeField(
        verbose_name="Created at",
        auto_now_add=True
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

    diameter = models.FloatField(
        verbose_name="diameter",
        null=True,
        blank=True,
        default=None,
        help_text="Diameter",
    )

    aparent_diameter = models.FloatField(
        verbose_name="aparent_diameter",
        null=True,
        blank=True,
        default=None,
        help_text="Aparent diameter",
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

    dynamic_class = models.CharField(
        max_length=35,
        default=None,
        null=True,
        blank=True,
        verbose_name="Dynamic class",
        help_text="Dynamic class",
    )

    semimajor_axis = models.FloatField(
        verbose_name="Semimajor axis",
        null=True,
        blank=True,
        default=None,
        help_text="Semimajor axis",
    )

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

    min_longitude = models.FloatField(
        verbose_name="Min Logintude",
        null=True,
        blank=True,
        default=None,
        help_text="Min Logintude Occultation Path",
    )

    max_longitude = models.FloatField(
        verbose_name="Max Logintude",
        null=True,
        blank=True,
        default=None,
        help_text="Max Logintude Occultation Path",
    )
    have_path_coeff = models.BooleanField(
        verbose_name="Have Path Coeff",
        null=True,
        blank=True,
        default=False,
        help_text="Have Path Coeff",
    )
    occultation_path_coeff = models.JSONField(
        verbose_name="Occultation Path Coeff",
        null=True,
        blank=True,
        default=dict,
        help_text="Occultation Path Coeff",
    )

    def get_alias(self) -> str:
        return self.asteroid.get_alias()

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
