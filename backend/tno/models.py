from django.conf import settings
from django.db import models

from current_user import get_current_user


class Asteroid(models.Model):

    name = models.CharField(
        max_length=32,
        verbose_name="Name",
        unique=True,
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

    base_dynclass = models.CharField(
        max_length=24,
        verbose_name="Base Object classification",
        help_text="(ucd=“meta.code.class”) Base Object class (TNO, Centaur, Trojan, etc.).",
        db_index=True,
    )

    dynclass = models.CharField(
        max_length=24,
        verbose_name="Object classification",
        db_index=True,
        help_text="(ucd=“meta.code.class;src.class”) Object class (TNO, Centaur, Trojan, etc.).",
    )

    def __str__(self):
        if self.number:
            return "%s (%s)" % (self.name, self.number)
        else:
            return self.name


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


class LeapSecond(models.Model):
    class Meta:
        verbose_name = "Leap Second"
        verbose_name_plural = "Leap Second"

    name = models.CharField(
        max_length=100,
        verbose_name="Name",
        help_text="Internal name",
        null=True,
        blank=True,
    )

    display_name = models.CharField(
        max_length=100,
        verbose_name="Display name",
        help_text="Display Name.",
        null=True,
        blank=True,
    )

    url = models.URLField(
        max_length=100,
        verbose_name="URL",
        help_text="URL of archives.",
        null=True,
        blank=True,
    )

    upload = models.FileField(
        upload_to=settings.LEAP_ROOT,
        verbose_name="file",
        help_text="Upload of archives.",
        null=True,
        blank=True,
    )

    def __str__(self):
        return str(self.name)


class BspPlanetary(models.Model):
    class Meta:
        verbose_name = "Planetary Ephemeris"
        verbose_name_plural = "Planetary Ephemeris"

    name = models.CharField(
        max_length=100,
        verbose_name="Name",
        help_text="Internal name",
        null=True,
        blank=True,
    )

    display_name = models.CharField(
        max_length=100,
        verbose_name="Display name",
        help_text="Display Name.",
        null=True,
        blank=True,
    )

    url = models.URLField(
        max_length=100,
        verbose_name="URL",
        help_text="URL of archives.",
        null=True,
        blank=True,
    )

    upload = models.FileField(
        upload_to=settings.BSP_PLA_ROOT,
        verbose_name="file",
        help_text="Upload of archives.",
        null=True,
        blank=True,
    )

    def __str__(self):
        return str(self.name)


class CustomList(models.Model):
    owner = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.CASCADE,
        default=None,
        verbose_name="Owner",
        null=True,
        blank=True,
    )

    displayname = models.CharField(
        max_length=128, verbose_name="Name", help_text="List name"
    )

    description = models.TextField(verbose_name="Description", null=True, blank=True)

    database = models.CharField(
        max_length=128,
        verbose_name="Database",
        null=True,
        blank=True,
        help_text="Database identifier in settings",
    )

    schema = models.CharField(
        max_length=128, verbose_name="Schema", null=True, blank=True
    )

    tablename = models.CharField(
        max_length=128, verbose_name="Tablename", help_text="Tablename without schema"
    )

    asteroids = models.PositiveIntegerField(
        verbose_name="Num of Asteroids", null=True, blank=True
    )

    rows = models.PositiveIntegerField(
        verbose_name="Num of rows", null=True, blank=True
    )

    n_columns = models.PositiveIntegerField(
        verbose_name="Num of columns", null=True, blank=True
    )

    columns = models.CharField(
        verbose_name="Columns",
        max_length=1024,
        help_text="Column names separated by comma.",
        null=True,
        blank=True,
    )

    size = models.PositiveIntegerField(
        verbose_name="Size in bytes", null=True, blank=True
    )

    creation_date = models.DateTimeField(
        verbose_name="Creation Date", auto_now_add=True, null=True, blank=True
    )

    creation_time = models.FloatField(
        verbose_name="Creation Time",
        help_text="Creation Time in seconds",
        null=True,
        blank=True,
    )

    sql = models.TextField(
        verbose_name="SQL",
        null=True,
        blank=True,
        help_text="SQL for the table contents to be created",
    )

    sql_creation = models.TextField(
        verbose_name="SQL Creation",
        null=True,
        blank=True,
        help_text="Sql used in table creation",
    )

    filter_name = models.CharField(
        max_length=32,
        verbose_name="Filter Name",
        help_text="Filter By Object name.",
        null=True,
        blank=True,
    )

    filter_dynclass = models.TextField(
        verbose_name="Filter Classification",
        help_text="Filter by Object class (TNO, Centaur, Trojan, etc.).",
        null=True,
        blank=True,
    )

    filter_magnitude = models.FloatField(
        verbose_name="Filter Magnitude",
        help_text="Filter by Object Magnitude",
        null=True,
        blank=True,
    )

    filter_diffdatenights = models.FloatField(
        verbose_name="Filter diff nights",
        help_text="Filter by minimun difference time between observations",
        null=True,
        blank=True,
    )

    filter_morefilter = models.BooleanField(
        verbose_name="Filter more Bands",
        help_text="Filter by objects with more than one filter in the some night",
        default=False,
    )

    status = models.CharField(
        max_length=10,
        verbose_name="Status",
        default="pending",
        null=True,
        blank=True,
        choices=(
            ("pending", "Pending"),
            ("running", "Running"),
            ("success", "Success"),
            ("error", "Error"),
        ),
    )

    error_msg = models.TextField(verbose_name="Error Message", null=True, blank=True)

    def __str__(self):
        return self.displayname


class Proccess(models.Model):
    owner = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.CASCADE,
        default=None,
        verbose_name="Owner",
        null=True,
        blank=True,
    )

    start_time = models.DateTimeField(
        verbose_name="Start Time", auto_now_add=True, null=True, blank=True
    )

    finish_time = models.DateTimeField(
        verbose_name="Finish Time", auto_now_add=True, null=True, blank=True
    )

    relative_path = models.CharField(
        max_length=256,
        verbose_name="Relative Path",
        null=True,
        blank=True,
        help_text="Path relative to the process directory, this is the internal path in the container.",
    )

    absolute_path = models.CharField(
        max_length=1024,
        verbose_name="Absolute Path",
        null=True,
        blank=True,
        help_text="Absolute path to the process directory, this is the EXTERNAL path to the container.",
    )

    # Relation With Tno.CustomList
    input_list = models.ForeignKey(
        "tno.CustomList",
        on_delete=models.CASCADE,
        verbose_name="Input List",
        null=True,
        blank=True,
        default=None,
    )

    status = models.CharField(
        max_length=10,
        verbose_name="Status",
        default="pending",
        null=True,
        blank=True,
        choices=(
            ("pending", "Pending"),
            ("running", "Running"),
            ("success", "Success"),
            ("error", "Error"),
        ),
    )

    purged = models.BooleanField(
        verbose_name="Purged",
        default=False,
        help_text="This flag true indicates that the marked process was removed and your data excluded.",
    )

    def __str__(self):
        return str(self.id)


class Catalog(models.Model):
    name = models.CharField(max_length=128, verbose_name="Internal Name")
    display_name = models.CharField(max_length=128, verbose_name="Display Name")
    database = models.CharField(
        max_length=128,
        verbose_name="Database",
        null=True,
        blank=True,
        help_text="Database identifier in settings",
        default="catalog",
    )
    schema = models.CharField(
        max_length=128, verbose_name="Schema name", null=True, blank=True
    )
    tablename = models.CharField(
        max_length=128, verbose_name="Tablename", help_text="Tablename without schema"
    )

    ra_property = models.CharField(
        max_length=128,
        verbose_name="RA Property",
        help_text="name of the column that represents the RA in degrees",
        default="ra",
    )

    dec_property = models.CharField(
        max_length=128,
        verbose_name="Dec Property",
        help_text="name of the column that represents the Dec in degrees",
        default="dec",
    )

    rows = models.PositiveIntegerField(
        verbose_name="Num of rows", null=True, blank=True
    )
    columns = models.PositiveIntegerField(
        verbose_name="Num of columns", null=True, blank=True
    )
    size = models.PositiveIntegerField(
        verbose_name="Size in bytes", null=True, blank=True
    )

    registration_date = models.DateTimeField(
        verbose_name="Registration Date", auto_now_add=True, null=True, blank=True
    )

    def __str__(self):
        return self.display_name


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
