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

    def __str__(self):
        return str(self.name)

class Catalog(models.Model):
    name = models.CharField(max_length=128, verbose_name="Internal Name")
    display_name = models.CharField(max_length=128, verbose_name="Display Name")
    database = models.CharField(
        max_length=128,
        verbose_name="Database",
        null=False,
        blank=False,
        help_text="Database identifier",
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

class PredictionJob (models.Model):

    # Usuario que solicitou a execução do Job.
    owner = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.CASCADE,
        verbose_name="Owner",
        related_name="predicition_run",
    )

    catalog = models.ForeignKey(
        Catalog,
        on_delete=models.CASCADE,
        verbose_name="Catalog",
    )

    # Status da execução.
    status = models.IntegerField(
        verbose_name="Status",
        default=1,
        choices=(
            (1, "Idle"),
            (2, "Running"),
            (3, "Completed"),
            (4, "Failed"),
            (5, "Aborted"),
            (6, "Warning"),
            (7, "Aborting"),
        ),
    )

    # Momento em que o Job foi submetido.
    submit_time = models.DateTimeField(
        verbose_name="Submit Time",
        auto_now_add=True,
    )

    # Momento em que o Job foi criado.
    start = models.DateTimeField(
        verbose_name="Start", auto_now_add=False, null=True, blank=True
    )

    # Momento em que o Job foi finalizado.
    end = models.DateTimeField(
        verbose_name="Finish", auto_now_add=False, null=True, blank=True
    )

    # Tempo de duração do Job.
    exec_time = models.DurationField(
        verbose_name="Execution Time", null=True, blank=True
    )

    filter_type = models.CharField(
        verbose_name="Filter Type",
        max_length=15,
        choices=(
            ("name", "Name"),
            ("dynclass", "DynClass"),            
            ("base_dynclass", "Base DynClass"),
        ),
    )

    filter_value = models.TextField (
        verbose_name="Filter Value",
    )

    # data inicial .
    predict_start_date = models.DateField(
        verbose_name="Date Initial",
        help_text="Date Initial of Predictions",
        auto_now_add=False,
    )

    # data Final
    predict_end_date = models.DateField(
        verbose_name="Date Final of Predictions",
        help_text="Date Final of Predictions",
        auto_now_add=False,
    )

    predict_step = models.IntegerField(
        verbose_name="Prediction Step",        
        help_text="Prediction Step",
        default=600,
    )

    input_days_to_expire = models.IntegerField(
        verbose_name="Days to expire",
        help_text="Days to expire inputs",
        default=5,
    )

    force_refresh_input = models.BooleanField(
        verbose_name="Refresh Inputs",
        help_text="Force Refresh Inputs",
        default=False,        
    )

    count_asteroids = models.IntegerField(
        verbose_name="Asteroids",
        help_text="Total asteroids selected to run this job",        
        default=0,
    )

    count_asteroids_with_occ = models.IntegerField(
        verbose_name="Asteroids With Occultations",        
        help_text="Total asteroids with at least one occultation event identified by predict occultation.",
        default=0,
    )

    count_occ = models.IntegerField(
        verbose_name="Occultations",
        help_text="Total occultation events identified by predict occultation.",
        default=0,
    )

    count_success = models.IntegerField(
        verbose_name="Success",
        help_text="Total asteroids successfully executed in all steps.",
        default=0,
    )

    count_failures = models.IntegerField(
        verbose_name="Failures Count",
        help_text="Total asteroids that failed at least one of the steps.",        
        default=0,        
    )

    parsl_init_blocks = models.IntegerField(
        verbose_name="Parsl Blocks",        
        help_text="Value that defines the parallelism factor that parsl will use in the process.",
        default=400,

    )

    condor_job_submited = models.IntegerField(
        verbose_name="HTCondor Jobs",
        help_text="HTCondor Job Submited",        
        default=0,
    )

    condor_job_completed = models.IntegerField(
        verbose_name="HTCondor Completed",
        help_text="HTCondor Jobs Completed.",        
        default=0,
    )

    condor_job_removed = models.IntegerField(
        verbose_name="HTCondor Removed",
        help_text="Condor Jobs Removed",
        default=0,        
    )    

    debug = models.BooleanField(
        verbose_name="Debug",        
        help_text="Debug False all log files and intermediate results will be deleted at the end of the job.",
        default=False,
    )

    # Pasta onde estão os dados do Job.
    path = models.CharField(
        verbose_name="Path",        
        help_text="Path to the directory where the job data is located.",
        max_length=2048,        
        null=True,
        blank=True        
    )

    error = models.TextField(verbose_name="Error", null=True, blank=True)

    traceback = models.TextField(verbose_name="Traceback", null=True, blank=True)

    def __str__(self):
        return str(self.id)

class PredictionJobResult(models.Model):
    
    job = models.ForeignKey(
        PredictionJob,
        on_delete=models.CASCADE,
        verbose_name="Prediction Job",
    )

    asteroid = models.ForeignKey(
        Asteroid,
        on_delete=models.CASCADE,
        verbose_name="Asteroid",
    )

    name = models.CharField(
        max_length=100,
        verbose_name="Asteroid Name",
    )

    number = models.CharField(
        max_length=100,
        verbose_name="Asteroid Number",
        null=True,
        blank=True,        
    )

    base_dynclass = models.CharField(
        max_length=100,
        verbose_name="Asteroid Base DynClass",
        # Default value only because this field is added after table already have data
        default="" 
    )

    dynclass = models.CharField(
        max_length=100,
        verbose_name="Asteroid DynClass",
        # Default value only because this field is added after table already have data        
        default=""
    )    

    status = models.IntegerField(
        verbose_name="Status",
        default=1,
        choices=(
            (1, "Success"),
            (2, "Failed"),
        ),
    )

    des_obs = models.IntegerField(
        verbose_name="des_obs",
        default=0,
    )

    obs_source = models.CharField(
        max_length=100,
        null=True, 
        blank=True,
        verbose_name="obs_source",
    )

    exec_time = models.DurationField(
        verbose_name="exec_time", null=True, blank=True
    )

    messages = models.TextField(
        verbose_name="messages", null=True, blank=True
    )

    # TODO: REVER ESTES CAMPOS que seriam usados só no time profile
    des_obs_start = models.DateTimeField(
        verbose_name="des_obs_start", auto_now_add=False, null=True, blank=True
    )

    des_obs_finish = models.DateTimeField(
        verbose_name="des_obs_finish", auto_now_add=False, null=True, blank=True
    )

    des_obs_exec_time = models.DurationField(
        verbose_name="des_obs_exec_time", null=True, blank=True
    )

    des_obs_gen_run = models.BooleanField(
        default=False,
        verbose_name="des_obs_gen_run",
    )

    des_obs_tp_start = models.DateTimeField(
        verbose_name="des_obs_tp_start", auto_now_add=False, null=True, blank=True
    )

    des_obs_tp_finish = models.DateTimeField(
        verbose_name="des_obs_tp_finish", auto_now_add=False, null=True, blank=True
    )

    bsp_jpl_start = models.DateTimeField(
        verbose_name="bsp_jpl_start", auto_now_add=False, null=True, blank=True
    )

    bsp_jpl_finish = models.DateTimeField(
        verbose_name="bsp_jpl_finish", auto_now_add=False, null=True, blank=True
    )

    bsp_jpl_dw_time = models.DurationField(
        verbose_name="bsp_jpl_dw_time", null=True, blank=True
    )

    bsp_jpl_dw_run = models.BooleanField(
        default=False,
        verbose_name="bsp_jpl_dw_run",
    )

    bsp_jpl_tp_start = models.DateTimeField(
        verbose_name="bsp_jpl_tp_start", auto_now_add=False, null=True, blank=True
    )

    bsp_jpl_tp_finish = models.DateTimeField(
        verbose_name="bsp_jpl_tp_finish", auto_now_add=False, null=True, blank=True
    )

    obs_start = models.DateTimeField(
        verbose_name="obs_start", auto_now_add=False, null=True, blank=True
    )

    obs_finish = models.DateTimeField(
        verbose_name="obs_finish", auto_now_add=False, null=True, blank=True
    )

    obs_dw_time = models.DurationField(
        verbose_name="obs_dw_time", null=True, blank=True
    )

    obs_dw_run = models.BooleanField(
        default=False,
        verbose_name="obs_dw_run",
    )

    obs_tp_start = models.DateTimeField(
        verbose_name="obs_tp_start", auto_now_add=False, null=True, blank=True
    )

    obs_tp_finish = models.DateTimeField(
        verbose_name="obs_tp_finish", auto_now_add=False, null=True, blank=True
    )

    obs_ele_source = models.CharField(
        max_length=100,
        null=True, 
        blank=True,
        verbose_name="obs_ele_source",
    )

    obs_ele_start = models.DateTimeField(
        verbose_name="obs_ele_start", auto_now_add=False, null=True, blank=True
    )

    obs_ele_finish = models.DateTimeField(
        verbose_name="obs_ele_finish", auto_now_add=False, null=True, blank=True
    )

    obs_ele_dw_time = models.DurationField(
        verbose_name="obs_ele_dw_time", null=True, blank=True
    )

    obs_ele_dw_run = models.BooleanField(
        default=False,
        verbose_name="obs_ele_dw_run",
    )

    obs_ele_tp_start = models.DateTimeField(
        verbose_name="obs_ele_tp_start", auto_now_add=False, null=True, blank=True
    )

    obs_ele_tp_finish = models.DateTimeField(
        verbose_name="obs_ele_tp_finish", auto_now_add=False, null=True, blank=True
    )
    
    ref_orb_start = models.DateTimeField(
        verbose_name="ref_orb_start", auto_now_add=False, null=True, blank=True
    )

    ref_orb_finish = models.DateTimeField(
        verbose_name="ref_orb_finish", auto_now_add=False, null=True, blank=True
    )

    ref_orb_exec_time = models.DurationField(
        verbose_name="ref_orb_exec_time", null=True, blank=True
    )

    pre_occ_count = models.IntegerField(
        default=0,
        verbose_name="pre_occ_count",
    )

    pre_occ_start = models.DateTimeField(
        verbose_name="pre_occ_start", auto_now_add=False, null=True, blank=True
    )

    pre_occ_finish = models.DateTimeField(
        verbose_name="pre_occ_finish", auto_now_add=False, null=True, blank=True
    )
    pre_occ_exec_time = models.DurationField(
        verbose_name="pre_occ_exec_time", null=True, blank=True
    )

    ing_occ_count = models.IntegerField(
        default=0,
        verbose_name="ing_occ_count",
    )

    ing_occ_start = models.DateTimeField(
        verbose_name="ing_occ_start", auto_now_add=False, null=True, blank=True
    )

    ing_occ_finish = models.DateTimeField(
        verbose_name="ing_occ_finish", auto_now_add=False, null=True, blank=True
    )

    ing_occ_exec_time = models.DurationField(
        verbose_name="ing_occ_exec_time", null=True, blank=True
    )
