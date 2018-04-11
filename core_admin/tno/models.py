from django.db import models

class Pointings(models.Model):

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
        verbose_name='Filter', help_text='Filter used to do the observation (u, g, r, i, z, Y).', 
        max_length=1,
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

    ra_size = models.FloatField(
        verbose_name='ra_size', help_text='CCD dimensions in degrees (width × height).'
    )

    dec_size = models.FloatField(
        verbose_name='dec_size', help_text='CCD dimensions in degrees (width × height).'
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