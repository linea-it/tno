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

    # Relation With Proccess
    proccess = models.ForeignKey(
        'tno.Proccess', on_delete=models.CASCADE, verbose_name='Proccess',
        null=True, blank=True, related_name='predict_run'
    )

    # Relation With Catalog
    catalog = models.ForeignKey(
        'tno.Catalog', on_delete=models.CASCADE, verbose_name='Catalog',
        null=True, blank=True
    )

    # Relation With LeapSecond
    leap_second = models.ForeignKey(
        LeapSecond, on_delete=models.CASCADE, verbose_name='Leap Second',
        null=True, blank=True
    )

    # Relation With BspPlanetary
    bsp_planetary = models.ForeignKey(
        BspPlanetary, on_delete=models.CASCADE, verbose_name='BSP Planetary',
        null=True, blank=True
    )

    # Data de Inicio da Ephemeris
    ephemeris_start_date = models.DateField(
        verbose_name='Ephemeris Start Date',
        auto_now_add=False, null=True, blank=True,
        help_text='Initial date to generate Ephemeris'
    )

    # Data de Termino da Ephemeris
    ephemeris_end_date = models.DateTimeField(
        verbose_name='Ephemers End Date',
        auto_now_add=False, null=True, blank=True,
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

    average_time = models.FloatField(
        verbose_name='Average Time',
        null=True, blank=True
    )

    count_objects = models.PositiveIntegerField(
        verbose_name='Num Objects',
        help_text='Number of objects received as input',
        null=True, blank=True
    )
    count_executed = models.PositiveIntegerField(
        verbose_name='Num Executed Objects',
        help_text='Number of objects that were executed by Praia Occultation.',
        null=True, blank=True
    )
    count_not_executed = models.PositiveIntegerField(
        verbose_name='Num Not Executed Objects',
        help_text='Number of objects that were NOT executed by Praia Occultation.',
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

    # Relation With Tno.CustomList
    input_list = models.ForeignKey(
        'tno.CustomList', on_delete=models.CASCADE, verbose_name='Input List',
        null=True, blank=True, default=None, related_name='predict_input_list'
    )

    # Relation With praia.Run
    input_orbit = models.ForeignKey(
        'orbit.OrbitRun', on_delete=models.CASCADE, verbose_name='Orbit Run',
        null=True, blank=True, default=None, related_name='predict_input_orbit_run'
    )

    # Radius


    # Initial Data

    # Final Date

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
        choices=(('pending', 'Pending'), ('running', 'Running'), ('success', 'Success'), ('error', 'Error'))
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

    start_time = models.DateTimeField(
        verbose_name='Start Time',
        auto_now_add=False, null=True, blank=True)

    finish_time = models.DateTimeField(
        verbose_name='Finish Time',
        auto_now_add=False, null=True, blank=True)

    execution_time = models.DurationField(
        verbose_name='Execution Time',
        null=True, blank=True
    )

    relative_path = models.CharField(
        max_length=256,
        verbose_name='Relative Path',
        null=True, blank=True,
        help_text='Path relative to the Prediction Occultation OBJECT directory, this is the internal path in the proccess directory.',
    )

    absolute_path = models.CharField(
        max_length=1024,
        verbose_name='Absolute Path',
        null=True, blank=True,
        help_text='Absolute Path to Prediction Occultation OBJECT directory.',
    )

    def __str__(self):
        return str(self.name)


from . import signals