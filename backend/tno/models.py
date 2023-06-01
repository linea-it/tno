from django.conf import settings
from django.db import models
from datetime import datetime
from current_user import get_current_user
from django.contrib.auth.models import User
from django.db.models.signals import post_save
from django.dispatch import receiver

class Profile(models.Model):
    class Meta:
        verbose_name_plural = "profile"

    user = models.OneToOneField(User, on_delete=models.CASCADE)

    dashboard = models.BooleanField(default=True)

    @receiver(post_save, sender=User)
    def create_or_update_user_profile(sender, instance, created, **kwargs):
        """Cria um profile para o usuario e adiciona dashboard como verdadeiro.
        Só é executado quando um usuario é criado.
        
        Args:
            instance (User): instancia do model User.
            created (bool): True se o evento for disparado pela criação de um novo usuario.
        """
        if created:
            Profile.objects.get_or_create(
                user=instance, defaults={"dashboard": True}
            )

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

    # Data de criação do registro, 
    # Representa o momento em que o evento foi identificado/processado
    # Como esta tabela nunca é update, cada novo processamento é um delete/insert 
    # este campo sempre representa o momento da ultima atualização deste evento de 
    # ocultação.
    created_at = models.DateTimeField(
        verbose_name="Created at", 
        auto_now_add=True
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

    # Tempo médio de execução por Asteroid ( exec_time / count_asteroids) em segundos
    avg_exec_time = models.FloatField(
        verbose_name="Average Execution Time", 
        help_text= "average execution time per asteroid. (seconds)",
        null=True, 
        blank=True,
        default=0
    )

    filter_type = models.CharField(
        verbose_name="Filter Type",
        max_length=15,
        choices=(
            ("name", "Object name"),
            ("dynclass", "Dynamic class (with subclasses)"),            
            ("base_dynclass", "Dynamic class"),
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

    predict_interval = models.CharField(
        verbose_name= "Predict Interval",
        max_length=100,
        null=True, blank=True, default=None,
        help_text="Prediction range formatted with humanize."
    )

    predict_step = models.IntegerField(
        verbose_name="Prediction Step",        
        help_text="Prediction Step",
        default=600,
    )

    # input_days_to_expire = models.IntegerField(
    #     verbose_name="Days to expire",
    #     help_text="Days to expire inputs",
    #     default=5,
    # )

    # force_refresh_input = models.BooleanField(
    #     verbose_name="Refresh Inputs",
    #     help_text="Force Refresh Inputs",
    #     default=False,        
    # )

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

    # Total de Observações no DES para este asteroid. 
    # referente a tabela des_observations.
    des_obs = models.IntegerField(
        verbose_name="des_obs",
        help_text="total DES observations for this asteroid.",
        default=0,
    )
    # Total de Ocultações para este asteroid.
    occultations = models.IntegerField(
        default=0,
        verbose_name="Occultations",
        help_text="Number of occultation events identified for this asteroid."
    )

    # Indica a Origem das Observations pode ser AstDys ou MPC
    obs_source = models.CharField(
        max_length=100,
        null=True, 
        blank=True,
        verbose_name="Observation Source",
        help_text="Observation data source, AstDys or MPC."
    )

    # Indica a Origem dos Orbital Elements pode ser AstDys ou MPC
    orb_ele_source = models.CharField(
        max_length=100,
        null=True, 
        blank=True,
        verbose_name="Orbital Elements Source",
        help_text="Orbital Elements data source, AstDys or MPC."
    )

    # Tempo de execução para um unico asteroid. 
    # Não considera o tempo em que job ficou em idle nem o tempo de consolidação do job.
    exec_time = models.DurationField(
        verbose_name="exec_time", 
        null=True, 
        blank=True,
        help_text="Prediction pipeline runtime for this asteroid."
    )

    # Mensagens de erro pode conter mais de uma separadas por ;
    messages = models.TextField(
        verbose_name="messages", 
        null=True, 
        blank=True,
        help_text="Error messages that occurred while running this asteroid, there may be more than one in this case will be separated by ;"
    )

    # TODO: REVER ESTES CAMPOS que seriam usados só no time profile

    # Etapa DES Observations
    des_obs_start = models.DateTimeField(
        verbose_name="DES Observations Start", 
        auto_now_add=False, 
        null=True, 
        blank=True,
        help_text="Start of the execution of the DES Observations step"
    )

    des_obs_finish = models.DateTimeField(
        verbose_name="DES Observations Finish", 
        auto_now_add=False, 
        null=True, 
        blank=True,
        help_text="End of the DES Observations stage"
    )

    des_obs_exec_time = models.DurationField(
        verbose_name="DES Observations Execution Time", 
        null=True, 
        blank=True,
        help_text="DES Observations step execution time in seconds."
    )

    # Etapa Download BSP from JPL 
    bsp_jpl_start = models.DateTimeField(
        verbose_name="BSP JPL start", 
        auto_now_add=False, 
        null=True, 
        blank=True,
        help_text="Beginning of the JPL BSP Download step."
    )

    bsp_jpl_finish = models.DateTimeField(
        verbose_name="BSP JPL finish", 
        auto_now_add=False, 
        null=True, 
        blank=True,
        help_text="End of the Dwonload stage of the JPL BSP."
    )

    bsp_jpl_dw_time = models.DurationField(
        verbose_name="BSP JPL download time", 
        null=True, 
        blank=True,
        help_text="BSP download time from JPL."
    )

    # Etapa Download Observations from AstDys or MPC
    obs_start = models.DateTimeField(
        verbose_name="Observations Download Start", 
        auto_now_add=False, 
        null=True, 
        blank=True,
        help_text="Beginning of the Download stage of observations."
    )

    obs_finish = models.DateTimeField(
        verbose_name="Observations Download Finish", 
        auto_now_add=False, 
        null=True, 
        blank=True,
        help_text="End of the Download stage of the observations."
    )

    obs_dw_time = models.DurationField(
        verbose_name="Observations Download Time", 
        null=True, 
        blank=True,
        help_text="Observations download time."
    )

    # Etapa Orbital Elements from AstDys or MPC
    orb_ele_start = models.DateTimeField(
        verbose_name="Orbital Elements Start", 
        auto_now_add=False, 
        null=True, 
        blank=True,
        help_text="Beginning of the Orbtial Elements Download stage."
    )

    orb_ele_finish = models.DateTimeField(
        verbose_name="Orbital Elements Finish", 
        auto_now_add=False, 
        null=True, 
        blank=True,
        help_text="End of Orbital Elements Download step."
    )

    orb_ele_dw_time = models.DurationField(
        verbose_name="Orbital Elements Download Time", 
        null=True, 
        blank=True,
        help_text="Orbital Elements download time."
    )

    # Etapa Refinamento de Orbita (NIMA)
    ref_orb_start = models.DateTimeField(
        verbose_name="Refine Orbit Start", 
        auto_now_add=False, 
        null=True, 
        blank=True,
        help_text="Start of the Refine Orbit step."
    )

    ref_orb_finish = models.DateTimeField(
        verbose_name="Refine Orbit Finish", 
        auto_now_add=False, 
        null=True, 
        blank=True,
        help_text="End of the Refine Orbit step."
    )

    ref_orb_exec_time = models.DurationField(
        verbose_name="Refine Orbit execution time", 
        null=True, 
        blank=True,
        help_text="Refine Orbit runtime."
    )

    # Etapa Predict Occultation (PRAIA Occ)
    pre_occ_start = models.DateTimeField(
        verbose_name="Predict Occultation Start", 
        auto_now_add=False, 
        null=True, 
        blank=True,
        help_text="Start of the Predict Occultation step."
    )

    pre_occ_finish = models.DateTimeField(
        verbose_name="Predict Occultation Finish", 
        auto_now_add=False, 
        null=True, 
        blank=True,
        help_text="End of the Predict Occultation step."
    )

    pre_occ_exec_time = models.DurationField(
        verbose_name="Predict Occultation Execution Time", 
        null=True, 
        blank=True,
        help_text="Predict Occultation runtime."
    )

    # Etapa de Ingestão de Resultados (prenchimento dessa tabela e da tno_occultation)

    # Total de ocultações que foram inseridas no banco de dados
    # Deve ser igual a observations caso seja diferente indica que 
    # houve falha no registro dos resultados
    # TODO: Talvez esse campo não seja necessário depois da fase de validação.
    ing_occ_count = models.IntegerField(
        default=0,
        verbose_name="Occultations Ingested",
        help_text="Total Occultations registered in the database."
    )

    ing_occ_start = models.DateTimeField(
        verbose_name="Result Ingestion Start", 
        auto_now_add=False, 
        null=True, 
        blank=True,
        help_text="Start recording the results."
    )

    ing_occ_finish = models.DateTimeField(
        verbose_name="Result Ingestion Finish", 
        auto_now_add=False, 
        null=True, 
        blank=True,
        help_text="End of record of results."
    )

    ing_occ_exec_time = models.DurationField(
        verbose_name="Result Ingestion Execution Time", 
        null=True, 
        blank=True,
        help_text="Execution time of the results ingestion step."
    )
