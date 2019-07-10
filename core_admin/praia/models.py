from django.db import models
from django.conf import settings

class Configuration(models.Model):
    owner = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.CASCADE, default=None, verbose_name='Owner', null=True, blank=True)

    creation_date = models.DateTimeField(
        verbose_name='Creation Date',
        auto_now_add=True, null=True, blank=True)

    displayname = models.CharField(
        max_length=128, verbose_name='Name')

    def __str__(self):
        return self.displayname


class Run(models.Model):
    owner = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.CASCADE, default=None, verbose_name='Owner', null=True, blank=True)

    # Relation With Proccess
    proccess = models.ForeignKey(
        'tno.Proccess', on_delete=models.CASCADE, verbose_name='Proccess',
        null=True, blank=True, default=None
    )
    catalog = models.ForeignKey(
        'tno.Catalog',
        on_delete=models.CASCADE, default=None, verbose_name='Catalog', null=True, blank=True)

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

    # Relation With PraiaConfig
    configuration = models.ForeignKey(
        Configuration, on_delete=models.CASCADE, verbose_name='Configuration',
        null=True, blank=True, default=None
    )

    # Relation With Tno.CustomList
    input_list = models.ForeignKey(
        'tno.CustomList', on_delete=models.CASCADE, verbose_name='Input List',
        null=True, blank=True, default=None
    )

    count_objects = models.PositiveIntegerField(
        verbose_name='Num Objects',
        help_text='Number of objects received as input',
        null=True, blank=True
    )

    relative_path = models.CharField(
        max_length=256,
        verbose_name='Relative Path',
        null=True, blank=True,
        help_text='Path relative to the astrometry directory, this is the internal path in the proccess directory.',
    )

    status = models.CharField(
        max_length=10,
        verbose_name='Status',
        default='pending', null=True, blank=True,
        choices=(('pending', 'Pending'), ('running', 'Running'), ('success',
                                                                  'Success'), ('error', 'Error'), ('reexecute', 'Reexecute'))
    )

    error_msg = models.CharField(
        max_length=256,
        verbose_name="Error Message",
        help_text="When the status is failure, this field should contain a message with the error.",
        null=True, blank=True,
    )

    error_traceback = models.TextField(
        verbose_name="Error Traceback",
        null=True, 
        blank=True
    )

    def __str__(self):
        return str(self.id)


class AstrometryAsteroid(models.Model):

    """
        Este modelo representa a lista de Objetos (Asteroids),
        que foram passados como input para o PRAIA, neste modelo ficam
        guardadas as informacoes sobre a execucao para um unico objeto.

        OBS: Name nao pode ser uma ForeignKey por que name na skybot nao e unico.
    """
    class Meta:
        unique_together = ('astrometry_run', 'name')

    # Relation With orbit.OrbitRun
    astrometry_run = models.ForeignKey(
        Run, on_delete=models.CASCADE, verbose_name='Astrometry Run',
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
        max_length=15,
        verbose_name='Status',
        default='pending', null=True, blank=True,
        choices=(('pending', 'Pending'), ('running', 'Running'), ('success',
                'Success'), ('failure', 'Failure'), ('not_executed', 'Not Executed'))
    )

    ccd_images = models.BigIntegerField(
        verbose_name="CCD Images",
        help_text='Number of CCDs for this asteroid.',
        null=True, blank=True
    )

    catalog_rows = models.BigIntegerField(
        verbose_name="Catalog Rows",
        null=True, blank=True
    )

    error_msg = models.CharField(
        max_length=256,
        verbose_name="Error Message",
        help_text="When the status is failure, this field should contain a message with the error.",
        null=True, blank=True,
    )

    execution_time = models.DurationField(
        verbose_name='Execution Time',
        null=True, blank=True
    )

    # start_ephemeris = models.DateTimeField(
    #     verbose_name='Start Ephemeris',
    #     auto_now_add=False, null=True, blank=True)

    # finish_ephemeris = models.DateTimeField(
    #     verbose_name='Finish Ephemeris',
    #     auto_now_add=False, null=True, blank=True)

    # execution_ephemeris = models.DurationField(
    #     verbose_name='Execution Ephemeris',
    #     null=True, blank=True
    # )

    relative_path = models.CharField(
        max_length=256,
        verbose_name='Relative Path',
        null=True, blank=True,
        help_text='Path relative to the Astrometry OBJECT directory, this is the internal path in the proccess directory.',
    )

    def __str__(self):
        return str(self.name)


class AstrometryInput(models.Model):

    class Meta:
        unique_together = ('asteroid', 'input_type')

    asteroid = models.ForeignKey(
        AstrometryAsteroid, on_delete=models.CASCADE, verbose_name='Asteroid',
        null=False, blank=False, related_name='input_file'
    )

    input_type = models.CharField(
        max_length=60,
        verbose_name='Input Type',
        null=False, blank=False,
        help_text="Description of the input type.",
        choices=(
            ('ccd_images_list', 'CCD Images List'), 
            ('bsp_jpl', 'BSP JPL'),
            ('catalog', 'Catalog')),
    )

    filename = models.CharField(
        max_length=256,
        null=False, blank=False,
        verbose_name='Filename',
    )

    file_size = models.BigIntegerField(
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

    error_msg = models.CharField(
        max_length=256,
        verbose_name="Error Message",
        help_text="This field contains the error message that occurred during the creation of the Input.",
        null=True, blank=True,
    )

    def __str__(self):
        return str(self.file_path)


class AstrometryOutput(models.Model):
    """
        Este modelo representa os arquivos gerados pelo nima para cada Objeto.
        Um Objeto pode ter varios arquivos de resultado de tipos diferentes.
    """

    asteroid = models.ForeignKey(
        AstrometryAsteroid, on_delete=models.CASCADE, verbose_name='Asteroid',
        null=False, blank=False, related_name='astrometry_result'
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
            ('asteroid_orbit', 'Asteroid Orbit'),
            ('neighborhood_stars', 'Neighborhood Stars'),
            ('catalog', 'Catalog'),
            ('catalog_csv', 'Catalog CSV'),
            ('stars_catalog_mini', 'Star Catalog Mini'),
            ('stars_catalog_xy', 'Start Catalog XY'),
            ('stars_parameters_of_occultation', 'Start Parameters of Occultation'),
            ('stars_parameters_of_occultation_plot',
             'Start Parameters of Occultation Table'),
            ('occultation_table', 'Occultation Table CSV')
        )
    )

    filename = models.CharField(
        max_length=256,
        null=False, blank=False,
        verbose_name='Filename',
        help_text='Filename is formed by name without space and separated by underline.'
    )

    file_size = models.BigIntegerField(
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
