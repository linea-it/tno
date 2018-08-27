from django.db import models
from django.conf import settings


class OrbitRun(models.Model):
    owner = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.CASCADE, default=None, verbose_name='Owner', null=True, blank=True, related_name='owner')

    # Relation With Proccess
    proccess = models.ForeignKey(
        'tno.Proccess', on_delete=models.CASCADE, verbose_name='Proccess',
        null=True, blank=True, default=None, related_name='proccess'
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

    execution_download_time = models.DurationField(
        verbose_name='Execution Download Time',
        null=True, blank=True
    )

    execution_nima_time = models.DurationField(
        verbose_name='Execution NIMA Time',
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
        help_text='Number of objects that were executed by NIMA.',
        null=True, blank=True
    )
    count_not_executed = models.PositiveIntegerField(
        verbose_name='Num Not Executed Objects',
        help_text='Number of objects that were NOT executed by NIMA.',
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
        null=True, blank=True, default=None, related_name='input_list'
    )

    # Relation With praia.Run
    input_praia = models.ForeignKey(
        'praia.Run', on_delete=models.CASCADE, verbose_name='Praia Run',
        null=True, blank=True, default=None, related_name='praia_run'
    )

    relative_path = models.CharField(
        max_length=256,
        verbose_name='Relative Path',
        null=True, blank=True,
        help_text='Path relative to the refine orbit directory, this is the internal path in the proccess directory.',
    )

    status = models.CharField(
        max_length=10,
        verbose_name='Status',
        default='pending', null=True, blank=True,
        choices=(('pending', 'Pending'), ('running', 'Running'), ('success', 'Success'), ('error', 'Error'))
    )

    def __str__(self):
        return str(self.id)


class ObservationFile(models.Model):
    """
        Este modelo representa a lista de arquivos de Observacoes baixados do MPC ou AstDys,
        guarda o path, tamanho e datas do arquivos.
        Este modelo esta ligado ao SkybotOutput, pelo atributo name.
        Um Skybot Object name so pode ter um arquivo de observacoes.
        OBS: Nao pode ser uma ForeignKey por que name na skybot nao e unico.
        Os dados sao extraidos deste servico: https://minorplanetcenter.net/db_search/show_object?object_id=2006+BF208
    """

    name = models.CharField(
        verbose_name='Name',
        max_length=32,
        unique=True,
        null=False, blank=False,
        help_text='(ucd=“meta.id;meta.main”) Object name (official or provisional designation).')

    source = models.CharField(
        verbose_name='Source',
        max_length=6,
        null=False, blank=False,
        choices=(('MPC', 'MPC'), ('AstDys', 'AstDys'),)
    )

    observations = models.PositiveIntegerField(
        verbose_name='Observations',
        null=True, blank=True,
        help_text='Number of Observations for this object or number of lines in the file.'
    )

    filename = models.CharField(
        max_length=256,
        null=True, blank=True,
        verbose_name='Filename', help_text='Filename is formed by name without space and separated by underline.'
    )

    download_start_time = models.DateTimeField(
        verbose_name='Download Start',
        auto_now_add=True, null=True, blank=True)

    download_finish_time = models.DateTimeField(
        verbose_name='Download finish',
        auto_now_add=False, null=True, blank=True)

    file_size = models.PositiveIntegerField(
        verbose_name='File Size',
        null=True, blank=True, default=None, help_text='File Size in bytes')

    external_url = models.URLField(
        verbose_name='External URL',
        null=True, blank=True,
        help_text='File Url in the original service.'
    )

    download_url = models.URLField(
        verbose_name='Download URL',
        null=True, blank=True,
        help_text='Url used to download file.'
    )


class OrbitalParameterFile(models.Model):
    """
        Este modelo representa a lista de arquivos de Parametros Orbitais baixados do MPC ou AstDys,
        guarda o path, tamanho e datas do arquivos.
        Este modelo esta ligado ao SkybotOutput, pelo atributo name.
        Um Skybot Object name so pode ter um arquivo de Parametros Orbitais.
        OBS: Nao pode ser uma ForeignKey por que name na skybot nao e unico.
        Os dados sao extraidos deste servico: https://minorplanetcenter.net/db_search/show_object?object_id=2006+BF208
    """

    name = models.CharField(
        verbose_name='Name',
        max_length=32,
        unique=True,
        null=False, blank=False,
        help_text='(ucd=“meta.id;meta.main”) Object name (official or provisional designation).')

    source = models.CharField(
        verbose_name='Source',
        max_length=6,
        null=False, blank=False,
        choices=(('MPC', 'MPC'), ('AstDys', 'AstDys'),)
    )

    filename = models.CharField(
        max_length=256,
        null=True, blank=True,
        verbose_name='Filename', help_text='Filename is formed by name without space and separated by underline.'
    )

    download_start_time = models.DateTimeField(
        verbose_name='Download Start',
        auto_now_add=True, null=True, blank=True)

    download_finish_time = models.DateTimeField(
        verbose_name='Download finish',
        auto_now_add=False, null=True, blank=True)

    file_size = models.PositiveIntegerField(
        verbose_name='File Size',
        null=True, blank=True, default=None, help_text='File Size in bytes')

    external_url = models.URLField(
        verbose_name='External URL',
        null=True, blank=True,
        help_text='File Url in the original service.'
    )

    download_url = models.URLField(
        verbose_name='Download URL',
        null=True, blank=True,
        help_text='Url used to download file.'
    )


class BspJplFile(models.Model):
    """
        Este modelo representa a lista de arquivos de BSP baixados do JPL,
        guarda o path, tamanho e datas do arquivos.
        Este modelo esta ligado ao SkybotOutput, pelo atributo name.
        Um Skybot Object name so pode ter um arquivo BSP_JPL.
        OBS: Nao pode ser uma ForeignKey por que name na skybot nao e unico.
        Os dados sao extraidos deste servico: ftp://ssd.jpl.nasa.gov/pub/ssd/SCRIPTS/smb_spk
    """

    name = models.CharField(
        verbose_name='Name',
        max_length=32,
        unique=True,
        null=False, blank=False,
        help_text='(ucd=“meta.id;meta.main”) Object name (official or provisional designation).')

    filename = models.CharField(
        max_length=256,
        null=True, blank=True,
        verbose_name='Filename', help_text='Filename is formed by name without space and separated by underline.'
    )

    download_start_time = models.DateTimeField(
        verbose_name='Download Start',
        auto_now_add=True, null=True, blank=True)

    download_finish_time = models.DateTimeField(
        verbose_name='Download finish',
        auto_now_add=False, null=True, blank=True)

    file_size = models.PositiveIntegerField(
        verbose_name='File Size',
        null=True, blank=True, default=None, help_text='File Size in bytes')


class RefinedAsteroid(models.Model):
    """
        Este modelo representa a lista de Objetos (Asteroids),
        que foram passados como input para o NIMA, neste modelo ficam
        guardadas as informacoes sobre a execucao do NIMA para um unico objeto.

        OBS: Name nao pode ser uma ForeignKey por que name na skybot nao e unico.
    """

    class Meta:
        unique_together = ('orbit_run', 'name')

    # Relation With orbit.OrbitRun
    orbit_run = models.ForeignKey(
        OrbitRun, on_delete=models.CASCADE, verbose_name='Orbit Run',
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
        help_text='Path relative to the refine orbit OBJECT directory, this is the internal path in the proccess directory.',
    )

    absolute_path = models.CharField(
        max_length=1024,
        verbose_name='Absolute Path',
        null=True, blank=True,
        help_text='Absolute Path to refine orbit OBJECT directory.',
    )

    def __str__(self):
        return str(self.name)


class RefinedOrbit(models.Model):
    """
        Este modelo representa os arquivos gerados pelo nima para cada Objeto.
        Um Objeto pode ter varios arquivos de resultado de tipos diferentes.
    """

    asteroid = models.ForeignKey(
        RefinedAsteroid, on_delete=models.CASCADE, verbose_name='Asteroid',
        null=False, blank=False, related_name='refined_orbit'
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

    relative_path = models.CharField(
        max_length=1024,
        verbose_name='Relative Path',
        null=True, blank=True,
        help_text='Path relative to file, this is the internal path in the proccess directory.',
    )

    def __str__(self):
        return str(self.filename)


class RefinedOrbitInput(models.Model):
    """
        Este modelo representa os arquivos utilizados como INPUT pelo nima para cada Objeto.
        Um Objeto deve ter 4 arquivos de entrada.
        - Astrometry - Resultado da Etapa de Astrometria.
        - Orbital Parameters - Arquivo baixado do MPC ou AstDys
        - Observations - Arquivo baixado do MPC ou AstDys
        - BSP_JPL - Arquivo baixado do JPL
    """

    asteroid = models.ForeignKey(
        RefinedAsteroid, on_delete=models.CASCADE, verbose_name='Asteroid',
        null=False, blank=False, related_name='input_file'
    )

    input_type = models.CharField(
        max_length=60,
        verbose_name='Input Type',
        null=False, blank=False,
        help_text="Description of the input type.",
        choices=(('observations', 'Observations'), ('orbital_parameters', 'Orbital Parameters'), ('bsp_jpl', 'BSP JPL'),
                 ('astrometry', 'Astrometry'))
    )

    source = models.CharField(
        verbose_name='Source',
        max_length=6,
        null=True, blank=True,
        choices=(('MPC', 'MPC'), ('AstDys', 'AstDys'), ('JPL', 'JPL'))
    )

    date_time = models.DateTimeField(
        verbose_name='Date Time',
        auto_now_add=False, null=True, blank=True)

    filename = models.CharField(
        max_length=256,
        null=False, blank=False,
        verbose_name='Filename',
    )

    relative_path = models.CharField(
        max_length=1024,
        verbose_name='Relative Path',
        null=True, blank=True,
        help_text='Path relative to file, this is the internal path in the proccess directory.',
    )

    def __str__(self):
        return str(self.filename)


from . import signals
