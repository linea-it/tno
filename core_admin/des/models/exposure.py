from django.db import models


class Exposure(models.Model):
    """
        Representa cada exposição feita pelo DES.
        Cada exposição é uma imagem composta por 62 partes que são os CCDs. 
        A exposição neste modelo é uma imagem, que tem uma area, um centro, banda e foi tirada em uma data/hora.
        essa imagem vai estar associada a cada um dos ccds. 
        no banco de dados do DES este modelo é representado pelo campo pfw_attempt_id. 
        aqui pfw_attempt_id é o id deste modelo.

        -- Query com as colunas referentes a exposição e acrescentando o campo de Release 
        select distinct (pfw_attempt_id), nite, date_obs, expnum, band, exptime, cloud_apass, cloud_nomad, t_eff, radeg, decdeg, trim(split_part("path" , '/', 3)) as release from tno_pointing tp order by date_obs asc;

        -- Preenche a tabela Des/Exposure com os dados das exposições que antes estavam na tno_pointing
        insert into des_exposure (id,nite,date_obs,expnum,band,radeg,decdeg,exptime,cloud_apass,cloud_nomad,t_eff,"release") select distinct (pfw_attempt_id) as id, nite, date_obs, expnum, band, radeg, decdeg, exptime, cloud_apass, cloud_nomad, t_eff, trim(split_part("path" , '/', 3)) as release from tno_pointing tp order by date_obs asc;
    """

    # id = pfw_attempt_id
    id = models.BigIntegerField(
        primary_key=True,
        verbose_name='Exposure Id',
        help_text='Unique identifier for each image. pfw_attempt_id in DES database.'
    )
    nite = models.DateField(
        verbose_name="Night",
        help_text='Night at which the observation was made.'
    )
    date_obs = models.DateTimeField(
        verbose_name='Observation Date',
        help_text='Date and time of observation'
    )
    expnum = models.BigIntegerField(
        verbose_name='Expnum',
        help_text='identifier for each image. (it also recorded in the file name)'
    )
    band = models.CharField(
        max_length=1,
        verbose_name='Filter', help_text='Filter used to do the observation (u, g, r, i, z, Y).',
        choices=(('u', 'u'), ('g', 'g'), ('r', 'r'),
                 ('i', 'i'), ('z', 'z'), ('Y', 'Y'))
    )
    radeg = models.FloatField(
        verbose_name='RA (deg)'
    )
    decdeg = models.FloatField(
        verbose_name='Dec (deg)'
    )
    exptime = models.FloatField(
        verbose_name='Exposure time',
        help_text='Exposure time of observation.'
    )
    cloud_apass = models.FloatField(
        verbose_name='Cloud apass',
        help_text='Atmospheric extinction in magnitudes'
    )
    cloud_nomad = models.FloatField(
        verbose_name='Cloud nomad',
        help_text='Atmospheric extinction in magnitudes'
    )
    t_eff = models.FloatField(
        verbose_name='t_eff',
        help_text='Parameter related to image quality'
    )
    release = models.CharField(
        max_length=10,
        verbose_name='Release',
        help_text='Release has been removed from the ccd filename field. using this rule trim(split_part(path , /, 3))'
    )

    class Meta:
        indexes = [
            models.Index(fields=['nite']),
            models.Index(fields=['date_obs']),
            models.Index(fields=['release'])
        ]

    def __str__(self):
        return str(self.id)
