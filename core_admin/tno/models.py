from django.db import models
from current_user import get_current_user
from django.conf import settings
from praia.models import Run as PraiaRun
class Pointing(models.Model):

    pfw_attempt_id = models.BigIntegerField(
        verbose_name='Image Id', help_text='Unique identifier for each image (1 image is composed by 62 CCDs)')

    desfile_id = models.BigIntegerField(
        verbose_name='CCD Id', help_text='Unique identifier for each CCD.')

    nite = models.DateField(
        verbose_name="Night", help_text='Night at which the observation was made.'
    )

    date_obs = models.DateTimeField(
        verbose_name='Observation Date', help_text='Date and time of observation'
    )

    expnum = models.BigIntegerField(
        verbose_name='Exposure', help_text='Unique identifier for each image, same function as pfw_attenp_id (it also recorded in the file name)'
    )
    ccdnum = models.IntegerField(
        verbose_name='CCD', help_text='CCD Number (1, 2, ..., 62)'
    )

    band = models.CharField(
        max_length=1,
        verbose_name='Filter', help_text='Filter used to do the observation (u, g, r, i, z, Y).',
        choices=(('u','u'),('g','g'),('r','r'),('i','i'),('z','z'),('Y','Y'))
    )

    exptime = models.FloatField(
        verbose_name='Exposure time', help_text='Exposure time of observation.'
    )

    cloud_apass = models.FloatField(
        verbose_name='Cloud apass', help_text='Atmospheric extinction in magnitudes'
    )

    cloud_nomad = models.FloatField(
        verbose_name='Cloud nomad', help_text='Atmospheric extinction in magnitudes'
    )

    t_eff = models.FloatField(
        verbose_name='t_eff', help_text='Parameter related to image quality'
    )

    crossra0 = models.BooleanField(
        default=False, verbose_name='Cross RA 0'
    )

    radeg = models.FloatField(
        verbose_name='RA (deg)'
    )

    decdeg = models.FloatField(
        verbose_name='Dec (deg)'
    )

    racmin = models.FloatField(
        verbose_name='racmin', help_text='Minimal and maximum right ascension respectively of the CCD cover.'
    )

    racmax = models.FloatField(
        verbose_name='racmax', help_text='Minimal and maximum right ascension respectively of the CCD cover.'
    )

    deccmin = models.FloatField(
        verbose_name='deccmin', help_text='Minimum and maximum declination respectively of the CCD cover.'
    )

    deccmax = models.FloatField(
        verbose_name='deccmax', help_text='Minimum and maximum declination respectively of the CCD cover.'
    )

    ra_cent = models.FloatField(
        verbose_name='ra_cent', help_text='Right ascension of the CCD center'
    )

    dec_cent = models.FloatField(
        verbose_name='dec_cent', help_text='Declination of the CCD center'
    )

    rac1 = models.FloatField(
        verbose_name='rac1', help_text='CCD Corner Coordinates 1 - upper left.'
    )

    rac2 = models.FloatField(
        verbose_name='rac2', help_text='CCD Corner Coordinates 2 - lower left.'
    )

    rac3 = models.FloatField(
        verbose_name='rac3', help_text='CCD Corner Coordinates 3 - lower right.'
    )

    rac4 = models.FloatField(
        verbose_name='rac4', help_text='CCD Corner Coordinates 4 - upper right).'
    )

    decc1 = models.FloatField(
        verbose_name='decc1', help_text='CCD Corner Coordinates 1 - upper left.'
    )

    decc2 = models.FloatField(
        verbose_name='decc2', help_text='CCD Corner Coordinates 2 - lower left.'
    )

    decc3 = models.FloatField(
        verbose_name='decc3', help_text='CCD Corner Coordinates 3 - lower right.'
    )

    decc4 = models.FloatField(
        verbose_name='decc4', help_text='CCD Corner Coordinates 4 - upper right).'
    )

    ra_size = models.DecimalField(
        verbose_name='ra_size', help_text='CCD dimensions in degrees (width × height).',
        decimal_places=7, max_digits=10
    )

    dec_size = models.DecimalField(
        verbose_name='dec_size', help_text='CCD dimensions in degrees (width × height).',
        decimal_places=7, max_digits=10
    )

    path = models.TextField(
        verbose_name='Path', help_text='Path in the DES database where the image is stored.'
    )

    filename = models.CharField(
        max_length=256,
        verbose_name='Filename', help_text='Name of FITS file with a CCD image.'
    )

    compression = models.CharField(
        max_length=5,
        verbose_name='Compression', help_text='Compression format (.fz) used in FITS files'
    )

    downloaded = models.BooleanField(
        default=False, verbose_name='Downloaded', help_text='flag indicating whether the image was downloaded from DES.'
    )

    class Meta:
        indexes = [
            models.Index(fields=['expnum']),
            models.Index(fields=['expnum', 'ccdnum']),
            models.Index(fields=['expnum', 'ccdnum', 'band']),
            models.Index(fields=['date_obs']),
            models.Index(fields=['rac1']),
            models.Index(fields=['rac2']),
            models.Index(fields=['rac3']),
            models.Index(fields=['rac4']),
            models.Index(fields=['decc1']),
            models.Index(fields=['decc2']),
            models.Index(fields=['decc3']),
            models.Index(fields=['decc4']),
        ]

    def __str__(self):
        return str(self.id)

class SkybotOutput(models.Model):
    """
        Table generated by SkyBoT which has the solar system objects identified
        in DES images (for more detailssee:http://vo.imcce.fr/webservices/skybot/?conesearch)
    """
    # Relation With Pointings
    pointing = models.ForeignKey(
        Pointing, on_delete=models.CASCADE, verbose_name='Pointing', default=None, null=True, blank=True
    )

    num = models.CharField(
        max_length=6, default=None, null=True, blank=True,
        verbose_name='Num',
        help_text='(ucd=“meta.id;meta.number”) Object number (not all objects have numbers assigned).'
    )

    name = models.CharField(
        max_length=32,
        verbose_name='Name',
        help_text='(ucd=“meta.id;meta.main”) Object name (official or provisional designation).'
    )

    dynclass = models.CharField(
        max_length=24,
        verbose_name='Object classification',
        help_text='(ucd=“meta.code.class;src.class”) Object class (TNO, Centaur, Trojan, etc.).'
    )

    ra = models.CharField(
        max_length=20,
        verbose_name='RA',
        help_text='(ucd=“pos.eq.ra;meta.main”) Right ascension of the identified object.'
    )

    dec = models.CharField(
        max_length=20,
        verbose_name='Dec',
        help_text='(ucd=“pos.eq.dec;meta.main”) Declination of the identified object.'
    )

    raj2000 = models.FloatField(
        verbose_name='RA (deg)',
        help_text='(ucd=“pos.eq.ra;meta.main”) Right ascension of the identified object in degrees.'
    )

    decj2000 = models.FloatField(
        verbose_name='Dec (deg)',
        help_text='(ucd=“pos.eq.dec;meta.main”) Declination of the identified object in degrees.'
    )

    mv = models.FloatField(
        verbose_name='Mv',
        help_text='(ucd=“phot.mag;em.opt.V”) Visual magnitude'
    )

    errpos = models.FloatField(
        verbose_name='ErrPos',
        help_text='(ucd=“stat.error.sys”) Uncertainty on the (RA,DEC) coordinates'
    )

    d = models.FloatField(
        verbose_name='d',
        help_text='(ucd="pos.ang") Body-to-center angular distance'
    )

    dracosdec = models.FloatField(
        verbose_name='dRAcosDec',
        help_text='(ucd=“pos.pm;pos.eq.ra”) Motion in right ascension d(RA)cos(DEC)'
    )

    ddec = models.FloatField(
        verbose_name='dDEC',
        help_text='(ucd=“pos.pm;pos.eq.dec”) Motion in declination d(DEC)'
    )

    dgeo = models.FloatField(
        verbose_name='Dgeo',
        help_text='(ucd=“phys.distance”) Distance from observer'
    )

    dhelio = models.FloatField(
        verbose_name='Dhelio',
        help_text='(ucd=“phys.distance”) Distance from the Sun'
    )

    phase = models.FloatField(
        verbose_name='Phase',
        help_text='(ucd=“pos.phaseAng”) Phase angle, e.g. elongation of earth from sun as seen from object'
    )

    solelong = models.FloatField(
        verbose_name='SolElong',
        help_text='(ucd=“pos.angDistance”) Solar elongation, e.g. elongation of object from sun as seen from Earth'
    )

    px = models.FloatField(
        verbose_name='Px',
        help_text='(ucd=“src.orbital.pos;meta.id.x”) Mean J2000 heliocentric position vector, x component'
    )

    py = models.FloatField(
        verbose_name='Py',
        help_text='(ucd=“src.orbital.pos;meta.id.y”) Mean J2000 heliocentric position vector, y component'
    )

    pz = models.FloatField(
        verbose_name='Pz',
        help_text='(ucd=“src.orbital.pos;meta.id.z”) Mean J2000 heliocentric position vector, z component'
    )

    vx = models.FloatField(
        verbose_name='Vx',
        help_text='(ucd=“src.veloc.orbital;meta.id.x”) Mean J2000 heliocentric velocity vector, x component'
    )

    vy = models.FloatField(
        verbose_name='Vy',
        help_text='(ucd=“src.veloc.orbital;meta.id.y”) Mean J2000 heliocentric velocity vector, y component'
    )

    vz = models.FloatField(
        verbose_name='Vz',
        help_text='(ucd=“src.veloc.orbital;meta.id.z”) Mean J2000 heliocentric velocity vector, z component'
    )

    jdref = models.FloatField(
        verbose_name='JDRef',
        help_text='(ucd=“time.epoch”) Reference epoch of the position/velocity vector'
    )

    externallink = models.URLField(
        verbose_name='ExternalLink',
        help_text='(ucd=“meta.ref.url”) External link to hint the target'
    )

    expnum = models.BigIntegerField(
        verbose_name='Exposure', help_text='Unique identifier for each image, same function as pfw_attenp_id (it also recorded in the file name)',
        default=None, null=True, blank=True
    )
    ccdnum = models.IntegerField(
        verbose_name='CCD', help_text='CCD Number (1, 2, ..., 62)',
        default=None, null=True, blank=True
    )

    band = models.CharField(
        max_length=1,
        verbose_name='Filter', help_text='Filter used to do the observation (u, g, r, i, z, Y).',
        default=None, null=True, blank=True,
        choices=(('u','u'),('g','g'),('r','r'),('i','i'),('z','z'),('Y','Y'))
    )

    class Meta:
        indexes = [

            models.Index(fields=['num']),
            models.Index(fields=['name']),
            models.Index(fields=['dynclass']),
            models.Index(fields=['raj2000']),
            models.Index(fields=['decj2000']),
            models.Index(fields=['expnum']),
            models.Index(fields=['expnum', 'ccdnum']),
            models.Index(fields=['expnum', 'ccdnum', 'band']),
        ]

    def __str__(self):
        return str(self.id)

class CcdImage(models.Model):
    """
        This table stores information about the images of CCDs that have already been
        downloaded from the DES and are available for the application.
        the images are linked to table pointings.
    """
    # Relation With Pointings
    pointing = models.ForeignKey(
        Pointing, on_delete=models.CASCADE, verbose_name='Pointing',
        null=True, blank=True, default=None
    )

    desfile_id = models.BigIntegerField(
        null=True, blank=True, default=None,
        verbose_name='CCD Id', help_text='Unique identifier for each CCD.')

    filename = models.CharField(
        max_length=256,
        verbose_name='Filename', help_text='Name of FITS file with a CCD image.'
    )

    download_start_time = models.DateTimeField(
        verbose_name='Download Start',
        auto_now_add=True, null=True, blank=True )

    download_finish_time = models.DateTimeField(
        verbose_name='Download finish',
        auto_now_add=False, null=True, blank=True )

    file_size = models.PositiveIntegerField(
        verbose_name='File Size',
        null=True, blank=True, default=None, help_text='File Size in bytes')

    def __str__(self):
        return str(self.id)

class Observation(models.Model):
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
        choices=(('MPC','MPC'),('AstDys','AstDys'),)
    )

    observations = models.PositiveIntegerField(
        verbose_name='Observations',
        null=True, blank=True,
        help_text='Number of Observations for this object or number of lines in the file.'
    )

    filename = models.CharField(
        max_length=256,
        null=True, blank=True,
        verbose_name='Filename', help_text='Name of FITS file with a CCD image.'
    )

    download_start_time = models.DateTimeField(
        verbose_name='Download Start',
        auto_now_add=True, null=True, blank=True )

    download_finish_time = models.DateTimeField(
        verbose_name='Download finish',
        auto_now_add=False, null=True, blank=True )

    file_size = models.PositiveIntegerField(
        verbose_name='File Size',
        null=True, blank=True, default=None, help_text='File Size in bytes')
    
    external_url = models.URLField(
        verbose_name='External URL',
        null=True, blank=True,
        help_text='File Url in the original service.'
    )


class OrbitalParameter(models.Model):
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
        choices=(('MPC','MPC'),('AstDys','AstDys'),)
    )

    filename = models.CharField(
        max_length=256,
        null=True, blank=True,
        verbose_name='Filename', help_text='Name of FITS file with a CCD image.'
    )

    download_start_time = models.DateTimeField(
        verbose_name='Download Start',
        auto_now_add=True, null=True, blank=True )

    download_finish_time = models.DateTimeField(
        verbose_name='Download finish',
        auto_now_add=False, null=True, blank=True )

    file_size = models.PositiveIntegerField(
        verbose_name='File Size',
        null=True, blank=True, default=None, help_text='File Size in bytes')
    
    external_url = models.URLField(
        verbose_name='External URL',
        null=True, blank=True,
        help_text='File Url in the original service.'
    )

class CustomList(models.Model):

    owner = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.CASCADE, default=None, verbose_name='Owner', null=True, blank=True)

    displayname = models.CharField(
        max_length=128, verbose_name='Name', help_text='List name')

    description = models.TextField(
        verbose_name='Description',
        null=True, blank=True
    )

    database = models.CharField(
        max_length=128, verbose_name='Database',
        null=True, blank=True, help_text='Database identifier in settings')

    schema = models.CharField(
        max_length=128,
        verbose_name='Schema', null=True, blank=True)

    tablename = models.CharField(
        max_length=128,
        verbose_name='Tablename', help_text='Tablename without schema')

    rows = models.PositiveIntegerField(
        verbose_name='Num of rows', null=True, blank=True)

    n_columns = models.PositiveIntegerField(
        verbose_name='Num of columns', null=True, blank=True)
    
    columns = models.CharField(
        verbose_name='Columns',
        max_length=1024,
        help_text='Column names separated by comma.',
        null=True, blank=True
    )

    size = models.PositiveIntegerField(
        verbose_name='Size in bytes', null=True, blank=True)

    creation_date = models.DateTimeField(
        verbose_name='Creation Date',
        auto_now_add=True, null=True, blank=True)

    creation_time = models.FloatField(
        verbose_name='Creation Time',
        help_text='Creation Time in seconds',
        null=True, blank=True
    )

    sql = models.TextField(
        verbose_name="SQL",
        null=True, blank=True,
        help_text="SQL for the table contents to be created"
    )

    sql_creation = models.TextField(
        verbose_name="SQL Creation",
        null=True, blank=True,
        help_text="Sql used in table creation"
    )

    filter_name = models.CharField(
        max_length=32,
        verbose_name='Filter Name',
        help_text='Filter By Object name.',
        null=True, blank=True 
    )

    filter_dynclass = models.TextField(
        verbose_name='Filter Classification',
        help_text='Filter by Object class (TNO, Centaur, Trojan, etc.).',
        null=True, blank=True 
    )

    filter_magnitude = models.FloatField(
        verbose_name='Filter Magnitude',
        help_text = 'Filter by Object Magnitude',
        null=True, blank=True 
    )

    filter_diffdatenights = models.FloatField(
        verbose_name='Filter diff nights',
        help_text= 'Filter by minimun difference time between observations',
        null=True, blank=True 
    )

    filter_morefilter = models.BooleanField(
        verbose_name='Filter more Bands',
        help_text='Filter by objects with more than one filter in the some night',
        default=False
    )

    status = models.CharField(
        max_length=10,
        verbose_name='Status', 
        default='pending', null=True, blank=True,
        choices=(('pending','Pending'),('running','Running'),('success','Success'),('error','Error'))
    )

    error_msg = models.TextField(
        verbose_name='Error Message',
        null=True, blank=True
    )

    def __str__(self):
        return self.displayname

class Proccess(models.Model):

    owner = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.CASCADE, default=None, verbose_name='Owner', null=True, blank=True)

    start_time = models.DateTimeField(
        verbose_name='Start Time',
        auto_now_add=True, null=True, blank=True)

    finish_time = models.DateTimeField(
        verbose_name='Finish Time',
        auto_now_add=True, null=True, blank=True)

    relative_path = models.CharField(
        max_length=256,
        verbose_name='Relative Path',
        null=True, blank=True,
        help_text='Path relative to the process directory, this is the internal path in the container.',
    )

    absolute_path = models.CharField(
        max_length=1024,
        verbose_name='Absolute Path',
        null=True, blank=True,
        help_text='Absolute path to the process directory, this is the EXTERNAL path to the container.',
    )

    status = models.CharField(
        max_length=10,
        verbose_name='Status', 
        default='pending', null=True, blank=True,
        choices=(('pending','Pending'),('running','Running'),('success','Success'),('error','Error'))
    )

    purged = models.BooleanField(
        verbose_name='Purged',
        default=False,
        help_text='This flag true indicates that the marked process was removed and your data excluded.'
    )

    def __str__(self):
        return str(self.id)

class Product(models.Model):

    proccess = models.ForeignKey(
        Proccess, on_delete=models.CASCADE, verbose_name='Proccess',
        null=True, blank=True, default=None
    )

    product_type = models.CharField(
        max_length=10,
        verbose_name='Type', 
        null=True, blank=True,
        choices=(('table','Table'),('fits','Fits'),('image','Image'),)
    )

    database = models.CharField(
        max_length=128, verbose_name='Database',
        null=True, blank=True, help_text='Database identifier in settings')

    schema = models.CharField(
        max_length=128,
        verbose_name='Schema', null=True, blank=True)

    tablename = models.CharField(
        max_length=128,
        verbose_name='Tablename', help_text='Tablename without schema',
        null=True, blank=True)

    rows = models.PositiveIntegerField(
        verbose_name='Num of rows', null=True, blank=True)

    filename = models.CharField(
        max_length=256,
        verbose_name='Filename', help_text='Name of FITS file with a CCD image.',
        null=True, blank=True,)
    
    file_size = models.PositiveIntegerField(
        verbose_name='File Size',
        null=True, blank=True, default=None, help_text='File Size in bytes')

    def __str__(self):
        return str(self.id)