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


from . import signals