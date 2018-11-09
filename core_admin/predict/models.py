from django.db import models
from django.conf import settings

class LeapSecond(models.Model):
    name = models.CharField(
        max_length=100,
        verbose_name='Name',
        help_text='Internal name',
        null=True, blank=True
    )

    display_name = models.CharField(
        max_length=100,
        verbose_name='Display name',
        help_text='Display Name.',
        null=True, blank=True
    )

    url = models.URLField(
        max_length=100,
        verbose_name='URL',
        help_text='URL of archives.',
        null=True, blank=True
    )

    upload = models.FileField(
        upload_to=settings.LEAP_ROOT,
        verbose_name='file',
        help_text='Upload of archives.',
        null=True, blank=True
    ) 

    def __str__(self):
        return str(self.name)

class BspPlanetary(models.Model):
    name = models.CharField(
        max_length=100,
        verbose_name='Name',
        help_text='Internal name',
        null=True, blank=True
    )

    display_name = models.CharField(
        max_length=100,
        verbose_name='Display name',
        help_text='Display Name.',
        null=True, blank=True
    )

    url = models.URLField(
        max_length=100,
        verbose_name='URL',
        help_text='URL of archives.',
        null=True, blank=True
    )

    upload = models.FileField(
        upload_to= settings.BSP_PLA_ROOT,
        verbose_name='file',
        help_text='Upload of archives.',
        null=True, blank=True
    ) 

    def __str__(self):
        return str(self.name)


class PredictRun(models.Model):
    owner = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.CASCADE, default=None, verbose_name='Owner', null=True, blank=True, related_name='predict_owner')

    # Relation With Process
    process = models.ForeignKey(
        'tno.Proccess', on_delete=models.CASCADE, verbose_name='Process',
        null=False, blank=False, related_name='predict_run'
    )

    # Relation With Tno.CustomList
    input_list = models.ForeignKey(
        'tno.CustomList', on_delete=models.CASCADE, verbose_name='Input List',
        null=False, blank=False, default=None, related_name='predict_input_list'
    )

    # Relation With praia.Run
    input_orbit = models.ForeignKey(
        'orbit.OrbitRun', on_delete=models.CASCADE, verbose_name='Orbit Run',
        null=False, blank=False, default=None, related_name='predict_input_orbit_run'
    )

    # Relation With Catalog
    catalog = models.ForeignKey(
        'tno.Catalog', on_delete=models.CASCADE, verbose_name='Catalog',
        null=False, blank=False
    )

    # Relation With LeapSecond
    leap_second = models.ForeignKey(
        LeapSecond, on_delete=models.CASCADE, verbose_name='Leap Second',
        null=False, blank=False
    )

    # Relation With BspPlanetary
    bsp_planetary = models.ForeignKey(
        BspPlanetary, on_delete=models.CASCADE, verbose_name='BSP Planetary',
        null=False, blank=False
    )

    # Data de Inicio da Ephemeris
    ephemeris_initial_date = models.DateTimeField(
        verbose_name='Ephemeris Start Date',
        auto_now_add=False, null=False, blank=False,
        help_text='Initial date to generate Ephemeris'
    )

    # Data de Termino da Ephemeris
    ephemeris_final_date = models.DateTimeField(
        verbose_name='Ephemers End Date',
        auto_now_add=False, null=False, blank=False,
        help_text='Final date to generate Ephemeris'
    )

    ephemeris_step = models.PositiveIntegerField(
        verbose_name='Ephemeris Step',
        null=False, blank=False, default=600,
        help_text='Interval in seconds to generate Ephemeris'
    )

    catalog_radius = models.FloatField(
        verbose_name='Catalog Radius',
        null=False, blank=False, default=0.15,
        help_text='Radius in degrees for the querys in the star catalog.'
    )

    start_time = models.DateTimeField(
        verbose_name='Start Time',
        auto_now_add=True, null=True, blank=True)

    finish_time = models.DateTimeField(
        verbose_name='Finish Time',
        auto_now_add=False, null=True, blank=True)

    execution_time = models.DurationField(
        verbose_name='Execution Time',
        null=True, blank=True
    )

    execution_dates = models.DurationField(
        verbose_name='Execution Dates',
        null=True, blank=True
    )
    execution_ephemeris = models.DurationField(
        verbose_name='Execution Ephemeris',
        null=True, blank=True
    )
    execution_catalog = models.DurationField(
        verbose_name='Execution Catalog',
        null=True, blank=True
    )
    execution_maps = models.DurationField(
        verbose_name='Execution Maps',
        null=True, blank=True
    )
    execution_register = models.DurationField(
        verbose_name='Execution Register',
        null=True, blank=True
    )

    average_time = models.FloatField(
        verbose_name='Average Time',
        null=True, blank=True
    )

    count_objects = models.PositiveIntegerField(
        verbose_name='Num Objects',
        help_text='Number of objects received as input',
        null=True, blank=True
    )
    count_success = models.PositiveIntegerField(
        verbose_name='Count Success',
        help_text='Number of objects successfully executed',
        null=True, blank=True
    )
    count_failed = models.PositiveIntegerField(
        verbose_name='Count Failed',
        help_text='Number of failed objects',
        null=True, blank=True
    )
    count_warning = models.PositiveIntegerField(
        verbose_name='Count Warning',
        help_text='Number of objects with status warning',
        null=True, blank=True
    )

    relative_path = models.CharField(
        max_length=256,
        verbose_name='Relative Path',
        null=True, blank=True,
        help_text='Path relative to the prediction occultation directory, this is the internal path in the proccess directory.',
    )

    status = models.CharField(
        max_length=10,
        verbose_name='Status',
        default='pending', null=True, blank=True,
        choices=(('pending', 'Pending'), ('running', 'Running'), ('success', 'Success'), ('failure', 'Failure'))
    )

    def __str__(self):
        return str(self.id)

class PredictAsteroid(models.Model):
    """
        Este modelo representa a lista de Objetos (Asteroids),
        que foram passados como input para o PRAIA Occultation, neste modelo ficam
        guardadas as informacoes sobre a execucao para um unico objeto.

        OBS: Name nao pode ser uma ForeignKey por que name na skybot nao e unico.
    """

    class Meta:
        unique_together = ('predict_run', 'name')

    # Relation With orbit.OrbitRun
    predict_run = models.ForeignKey(
        PredictRun, on_delete=models.CASCADE, verbose_name='Predict Run',
        null=False, blank=False, default=None, related_name='asteroids'
    )

    name = models.CharField(
        verbose_name='Name',
        max_length=32,
        null=False, blank=False,
        help_text='(ucd=“meta.id;meta.main”) Object name (official or provisional designation).')

    number = models.CharField(
        max_length=6, default=None, null=True, blank=True,
        verbose_name='Number',
        help_text='(ucd=“meta.id;meta.number”) Object number (not all objects have numbers assigned).'
    )

    status = models.CharField(
        max_length=10,
        verbose_name='Status',
        default='pending', null=True, blank=True,
        choices=(('pending', 'Pending'), ('running', 'Running'), ('success', 'Success'), ('failure', 'Failure'))
    )

    error_msg = models.CharField(
        max_length=256,
        verbose_name="Error Message",
        help_text="When the status is failure, this field should contain a message with the error.",
        null=True, blank=True,
    )

    catalog_rows = models.PositiveIntegerField(
        verbose_name="Catalog Rows",
        null=True, blank=True
    )


    execution_time = models.DurationField(
        verbose_name='Execution Time',
        null=True, blank=True
    )

    start_ephemeris = models.DateTimeField(
        verbose_name='Start Ephemeris',
        auto_now_add=False, null=True, blank=True)

    finish_ephemeris = models.DateTimeField(
        verbose_name='Finish Ephemeris',
        auto_now_add=False, null=True, blank=True)

    execution_ephemeris = models.DurationField(
        verbose_name='Execution Ephemeris',
        null=True, blank=True
    )

    start_catalog = models.DateTimeField(
        verbose_name='Start Catalog',
        auto_now_add=False, null=True, blank=True)

    finish_catalog = models.DateTimeField(
        verbose_name='Finish Catalog',
        auto_now_add=False, null=True, blank=True)

    execution_catalog = models.DurationField(
        verbose_name='Execution Catalog',
        null=True, blank=True
    )

    start_search_candidate = models.DateTimeField(
        verbose_name='Start Search Candidate',
        auto_now_add=False, null=True, blank=True)

    finish_search_candidate = models.DateTimeField(
        verbose_name='Finish Search Candidate',
        auto_now_add=False, null=True, blank=True)

    execution_search_candidate = models.DurationField(
        verbose_name='Execution Search Candidate',
        null=True, blank=True
    )

    start_maps = models.DateTimeField(
        verbose_name='Start Maps',
        auto_now_add=False, null=True, blank=True)

    finish_maps = models.DateTimeField(
        verbose_name='Finish Maps',
        auto_now_add=False, null=True, blank=True)

    execution_maps = models.DurationField(
        verbose_name='Execution Maps',
        null=True, blank=True
    )

    relative_path = models.CharField(
        max_length=256,
        verbose_name='Relative Path',
        null=True, blank=True,
        help_text='Path relative to the Prediction Occultation OBJECT directory, this is the internal path in the proccess directory.',
    )

    def __str__(self):
        return str(self.name)


class PredictInput(models.Model):

    asteroid = models.ForeignKey(
        PredictAsteroid, on_delete=models.CASCADE, verbose_name='Asteroid',
        null=False, blank=False, related_name='input_file'
    )

    input_type = models.CharField(
        max_length=60,
        verbose_name='Input Type',
        null=False, blank=False,
        help_text="Description of the input type.",
        choices=(('dates_file', 'Dates'), ('bsp_planetary', 'Planetary Ephemeris'), ('bsp_asteroid', 'Asteroid JPL Ephemeris'),
                 ('leap_second', 'Leap Second'), ('positions', 'Positions'), ('ephemeris', 'Ephemeris'), ('catalog', 'Catalog'), )
    )

    filename = models.CharField(
        max_length=256,
        null=False, blank=False,
        verbose_name='Filename',
    )

    file_size = models.PositiveIntegerField(
        verbose_name='File Size',
        null=True, blank=True, help_text='File Size in bytes')

    file_type = models.CharField(
        max_length=10,
        verbose_name='File Type',
        null=True, blank=True,
        help_text="File extension like '.txt'"
    )

    file_path = models.CharField(
        max_length=1024,
        verbose_name='File Path',
        null=True, blank=True,
        help_text='Path to file, this is the internal path in the proccess directory.',
    )

    def __str__(self):
        return str(self.filename)


class PredictOutput(models.Model):
    """
        Este modelo representa os arquivos gerados pelo nima para cada Objeto.
        Um Objeto pode ter varios arquivos de resultado de tipos diferentes.
    """

    asteroid = models.ForeignKey(
        PredictAsteroid, on_delete=models.CASCADE, verbose_name='Asteroid',
        null=False, blank=False, related_name='predict_result'
    )

    type = models.CharField(
        max_length=60,
        verbose_name='Type',
        null=False, blank=False,
        help_text="Description of the result type.",
        choices=(
            ('ephemeris', 'Ephemeris'),
            ('radec', 'RA Dec'),
            ('positions', 'Positions'),
            ('catalog', 'Catalog'),
            ('catalog_csv', 'Catalog CSV'),
            ('stars_catalog_mini', 'Star Catalog Mini'),
            ('stars_catalog_xy', 'Start Catalog XY'),
            ('stars_parameters_of_occultation', 'Start Parameters of Occultation'),
            ('stars_parameters_of_occultation_plot', 'Start Parameters of Occultation Table'),
            ('occultation_table', 'Occultation Table CSV')
        )
    )

    filename = models.CharField(
        max_length=256,
        null=False, blank=False,
        verbose_name='Filename',
        help_text='Filename is formed by name without space and separated by underline.'
    )

    file_size = models.PositiveIntegerField(
        verbose_name='File Size',
        null=False, blank=False, help_text='File Size in bytes')

    file_type = models.CharField(
        max_length=10,
        verbose_name='File Type',
        null=False, blank=False,
        help_text="File extension like '.txt'"
    )

    file_path = models.CharField(
        max_length=1024,
        verbose_name='File Path',
        null=True, blank=True,
        help_text='Path to file, this is the internal path in the proccess directory.',
    )

    def __str__(self):
        return str(self.filename)


class Occultation(models.Model):

    asteroid = models.ForeignKey(
        PredictAsteroid, on_delete=models.CASCADE, verbose_name='Asteroid',
        null=False, blank=False, related_name='occultation'
    )


    date_time =  models.DateTimeField(
        verbose_name='Date Time',
        auto_now_add=False, null=False, blank=False
    )

    ra_star_candidate = models.CharField(
        max_length=20,
        null=False, blank=False,
        verbose_name='RA Star Candidate',
    )

    dec_star_candidate = models.CharField(
        max_length=20,
        null=False, blank=False,
        verbose_name='Dec Star Candidate',
    )

    ra_target = models.CharField(
        max_length=20,
        null=False, blank=False,
        verbose_name='RA Target',
    )

    dec_target = models.CharField(
        max_length=20,
        null=False, blank=False,
        verbose_name='Dec Target',
    )

    closest_approach = models.FloatField(
        verbose_name='Closest approach',
        null=False, blank=False, default=0,
        help_text='geocentric closest approach, in arcsec'
    )

    position_angle = models.FloatField(
        verbose_name='Position Angle',
        null=False, blank=False, default=0,
        help_text='Planet position angle wrt to star at C/A, in deg'
    )

    velocity = models.FloatField(
        verbose_name='Velocity',
        null=False, blank=False, default=0,
        help_text='velocity in plane of sky, in km/sec, positive= prograde, negative= retrograde'
    )

    delta = models.FloatField(
        verbose_name='Delta',
        null=False, blank=False, default=0,
        help_text='Planet range to Earth, AU'
    )

    g = models.FloatField(
        verbose_name='G*',
        null=False, blank=False, default=0,
        help_text='G*, J*, H*, K* are normalized magnitudes to a common'
    )

    j = models.FloatField(
        verbose_name='J*',
        null=False, blank=False, default=0,
        help_text='G*, J*, H*, K* are normalized magnitudes to a common'
    )

    h = models.FloatField(
        verbose_name='H*',
        null=False, blank=False, default=0,
        help_text='G*, J*, H*, K* are normalized magnitudes to a common'
    )

    k = models.FloatField(
        verbose_name='K*',
        null=False, blank=False, default=0,
        help_text='G*, J*, H*, K* are normalized magnitudes to a common'
    )

    long = models.FloatField(
        verbose_name='Long',
        null=False, blank=False, default=0,
        help_text='East longitude of sub-planet point, deg, positive towards East'
    )

    loc_t = models.TimeField(
        verbose_name='Loc. t.',
        null=True, blank=True, default=None,
        help_text='loc. t.= UT + long: local solar time at sub-planet point, hh:mm'
    )

    off_ra = models.FloatField(
        verbose_name='off_ra',
        null=True, blank=True, default=0,
        help_text='Offset applied to ephemeris off_ra(mas) = A * (t-t0) + B'
    )

    off_dec = models.FloatField(
        verbose_name='off_dec',
        null=True, blank=True, default=0,
        help_text='Offset applied to ephemeris off_de(mas) = C * (t-t0) + D'
    )

    proper_motion = models.CharField(
        max_length=2,
        verbose_name='Proper Motion',
        null=True, blank=True, default=None,
        help_text='proper motion applied? (ok, no)',
        choices=(('ok', 'ok'), ('no', 'no'))
    )

    ct = models.CharField(
        max_length=10,
        verbose_name='ct',
        null=True, blank=True, default=None,
        help_text='only Gaia DR1 stars are used',
    )

    multiplicity_flag = models.CharField(
        max_length=2,
        verbose_name='Multiplicity Flag',
        null=True, blank=True, default=None,
        help_text='multiplicity flag (not applicable here) (see details in Assafin et al. 2010)',
        choices=(
            ('0', 'no multiple entries per star in astrometry'),
            ('1', 'single position from 2 or more uc/2m entries'),
            ('2', 'single position from 1 uc/2m entry only'),
            ('3', 'fs position from entry with more N contributions'),
            ('4', 'fs position from entry with best (x,y) error'),
            ('5', 'fs position from entry with brightest R mag.'),
            ('6', 'fs position from average over all entries.'),
        )
    )

    e_ra = models.FloatField(
        verbose_name='E_ra',
        null=True, blank=True, default=0,
        help_text='E_ra, E_dec: error of star position (mas)'
    )

    e_dec = models.FloatField(
        verbose_name='E_dec',
        null=True, blank=True, default=0,
        help_text='E_ra, E_dec: error of star position (mas)'
    )

    pmra = models.FloatField(
        verbose_name='pmra',
        null=True, blank=True, default=0,
        help_text='star proper motion (mas/yr); (0 when not provided by Gaia DR1)'
    )

    pmdec = models.FloatField(
        verbose_name='pmra',
        null=True, blank=True, default=0,
        help_text='star proper motion (mas/yr); (0 when not provided by Gaia DR1)'
    )

    file_path = models.CharField(
        max_length=2000,
        verbose_name='File Path',
        null=True, blank=True,
        help_text='Path to file, this is the internal path in the proccess directory.',
    )

from . import signals