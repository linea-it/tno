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

    execution_ccd_images = models.DurationField(
        verbose_name='Execution CCD Images',
        null=True, blank=True
    )

    execution_bsp_jpl = models.DurationField(
        verbose_name='Execution BSP JPL',
        null=True, blank=True
    )

    execution_catalog = models.DurationField(
        verbose_name='Execution Catalog',
        null=True, blank=True
    )

    execution_astrometry = models.DurationField(
        verbose_name='Execution Astrometry',
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
        verbose_name='Count Asteroids',
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
    count_not_executed = models.PositiveIntegerField(
        verbose_name='Count Not Executed',
        help_text='Number of objects that were NOT executed.',
        null=True, blank=True
    )
    relative_path = models.CharField(
        max_length=2048,
        verbose_name='Relative Path',
        null=True, blank=True,
        help_text='Path relative to the astrometry directory, this is the internal path in the proccess directory.',
    )

    status = models.CharField(
        max_length=10,
        verbose_name='Status',
        default='pending', null=True, blank=True,
        choices=(
            ('pending', 'Pending'),
            ('running', 'Running'),
            ('success', 'Success'),
            ('warning', 'Warning'),
            ('error', 'Error'),
            ('reexecute', 'Reexecute'),
            ('failure', 'Failure'))
    )

    step = models.IntegerField(
        verbose_name='Current Step',
        default=0, null=True, blank=True,
        choices=(
            (0, 'CCD Images'),
            (1, 'Bsp JPL'),
            (2, 'Reference Catalog'),
            (3, 'Praia Astrometry'),
            (4, 'Done'))
    )

    error_msg = models.CharField(
        max_length=2048,
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

    # Relation With praia.Run
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
        choices=(
            ('pending', 'Pending'),
            ('running', 'Running'),
            ('warning', 'Warning'),
            ('success', 'Success'),
            ('failure', 'Failure'),
            ('not_executed', 'Not Executed'),
            ('idle', 'Idle'),
        )
    )

    ccd_images = models.IntegerField(
        verbose_name="CCD Images",
        help_text='Number of CCDs for this asteroid.',
        null=True, blank=True,
        default=0
    )

    available_ccd_image = models.IntegerField(
        verbose_name="Available CCD Images",
        help_text='Number of CCDs that were available for this asteroid',
        null=True, blank=True,
        default=0
    )

    processed_ccd_image = models.IntegerField(
        verbose_name="Processed CCD Images",
        help_text='Number of CCDs that were processed for this asteroid',
        null=True, blank=True,
        default=0
    )

    catalog_rows = models.BigIntegerField(
        verbose_name="Catalog Rows",
        null=True, blank=True
    )

    error_msg = models.CharField(
        max_length=2048,
        verbose_name="Error Message",
        help_text="When the status is failure, this field should contain a message with the error.",
        null=True, blank=True,
    )

    execution_header = models.DurationField(
        verbose_name='Execution Header Extraction',
        null=True, blank=True
    )

    execution_astrometry = models.DurationField(
        verbose_name='Execution PRAIA Astrometry',
        null=True, blank=True
    )

    execution_targets = models.DurationField(
        verbose_name='Execution PRAIA Targets',
        null=True, blank=True
    )

    execution_plots = models.DurationField(
        verbose_name='Execution Plots',
        null=True, blank=True
    )

    execution_registry = models.DurationField(
        verbose_name='Execution Registry',
        null=True, blank=True
    )

    execution_time = models.DurationField(
        verbose_name='Execution Time',
        null=True, blank=True
    )

    outputs = models.IntegerField(
        verbose_name="Outputs",
        help_text='Total outputs generated for this asteroid.',
        null=True, blank=True,
        default=0
    )

    relative_path = models.CharField(
        max_length=1024,
        verbose_name='Relative Path',
        null=True, blank=True,
        help_text='Path relative to the Astrometry OBJECT directory, this is the internal path in the proccess directory.',
    )

    condor_relative_path = models.CharField(
        max_length=1024,
        verbose_name='Condor Relative Path',
        null=True, blank=True,
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
        max_length=1024,
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
        max_length=2048,
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
        null=False, blank=False, related_name='ast_outputs'
    )

    type = models.CharField(
        max_length=60,
        verbose_name='Type',
        null=False, blank=False,
        help_text="Description of the result type.",
        choices=(
            ('astrometry', 'Astrometry'),
            ('target_offset', 'Target Offset'),
            ('targets', 'Targets'),
            ('astrometric_results', 'Astrometric Results (xy)'),
            ('saoimage_region_file', 'SAO image region file'),
            ('mes', 'mes'),
            ('header_extraction', 'Header Extraction'),
            ('ast_reduction', 'Astrometry Reduction'),
            ('ast_photometry', 'Astrometry Photometry'),
            ('astrometry_input', 'Astrometry Input'),
            ('astrometry_params', 'Astrometry Parameters'),
            ('astrometry_log', 'PRAIA Astrometry Log'),
            ('astrometry_plot', 'Plot'),
        )
    )
    catalog = models.CharField(
        max_length=1024,
        null=True, blank=True,
        verbose_name='Reference Catalog',
        default=None
    )
    ccd_image = models.CharField(
        max_length=1024,
        null=True, blank=True,
        verbose_name='CCD Image',
        default=None
    )

    filename = models.CharField(
        max_length=1024,
        null=False, blank=False,
        verbose_name='Filename',
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

    class Meta:
        indexes = [
            models.Index(fields=['type']),
            models.Index(fields=['ccd_image']),
            models.Index(fields=['file_type']),
        ]

    def __str__(self):
        return str(self.filename)


class AstrometryJob(models.Model):

    """

    """

    # Relation With praia.Run
    astrometry_run = models.ForeignKey(
        Run, on_delete=models.CASCADE, verbose_name='Astrometry Run',
        null=False, blank=False, default=None, related_name='condor_jobs'
    )

    # Relation with praia.AstrometryAsteroid
    asteroid = models.OneToOneField(
        AstrometryAsteroid, on_delete=models.CASCADE, verbose_name='Asteroid',
        null=False, blank=False, related_name='condor_job'
    )

    clusterid = models.BigIntegerField(
        verbose_name='Cluster Id',
        null=True, blank=True)

    procid = models.IntegerField(
        verbose_name='Proc Id',
        null=True, blank=True)

    global_job_id = models.CharField(
        max_length=2000,
        verbose_name='Global Job Id',
        null=True, blank=True
    )

    job_status = models.IntegerField(
        verbose_name='Job Status',
        null=True, blank=True,
        choices=(
            (0, 'Unexpanded'),
            (1, 'Idle'),
            (2, 'Running'),
            (3, 'Removed'),
            (4, 'Completed'),
            (5, 'Held'),
            (6, 'Submission')
        ))

    cluster_name = models.CharField(
        max_length=256,
        verbose_name='Cluster Name',
        null=True, blank=True
    )

    remote_host = models.CharField(
        max_length=2000,
        verbose_name='Remote Host',
        null=True, blank=True
    )

    args = models.CharField(
        max_length=2000,
        verbose_name='Args',
        null=True, blank=True
    )

    submit_time = models.DateTimeField(
        verbose_name='Submit Time',
        auto_now_add=False, null=True, blank=True)

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
