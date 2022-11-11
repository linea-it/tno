from django.db import models


class Exposure(models.Model):
    """
    Representa cada exposição feita pelo DES.
    Cada exposição é uma imagem composta por 62 partes que são os CCDs.
    A exposição neste modelo é uma imagem, que tem uma area, um centro, banda e foi tirada em uma data/hora.
    essa imagem vai estar associada a cada um dos ccds.
    no banco de dados do DES este modelo é representado pelo campo expnum.
    aqui expnum é o id deste modelo.

    -- Query com as colunas referentes a exposição e acrescentando o campo de Release
    select distinct(a."EXPNUM"), a."NITE" , a."DATE_OBS" , a."PFW_ATTEMPT_ID",  a."EXPTIME" , a."CLOUD_APASS", a."CLOUD_NOMAD", a."T_EFF", a."RADEG", a."DECDEG", trim(split_part(a."PATH", '/', 3)) as release from y6a1_metadados a order by a."DATE_OBS" limit 10;

    -- Preenche a tabela Des/Exposure com os dados das exposições que antes estavam na tno_pointing
        insert
            into
            des_exposure (id, nite, date_obs, band, radeg, decdeg, exptime, cloud_apass, cloud_nomad, t_eff, "release",  pfw_attempt_id)
        select
            distinct(a."EXPNUM") as id,
            a."NITE" as nite,
            a."DATE_OBS" as date_obs,
            a."BAND" as band,
            a."RADEG" as radeg ,
            a."DECDEG" as decdeg ,
            a."EXPTIME" as exptime ,
            a."CLOUD_APASS" as cloud_apass ,
            a."CLOUD_NOMAD" as cloud_nomad ,
            a."T_EFF" as t_eff ,
            trim(split_part(a."PATH", '/', 3)) as release,
            a."PFW_ATTEMPT_ID" as pfw_attempt_id
        from
            y6a1_metadados a
        --where
        --	a."EXPNUM" = 154833
        order by
            a."DATE_OBS" asc;
    """

    # id = expnum
    id = models.BigIntegerField(
        primary_key=True,
        verbose_name="Expnum",
        help_text="Unique identifier for each image. expnum in DES database.",
    )
    nite = models.DateField(
        verbose_name="Night", help_text="Night at which the observation was made."
    )
    date_obs = models.DateTimeField(
        verbose_name="Observation Date", help_text="Date and time of observation"
    )
    pfw_attempt_id = models.BigIntegerField(verbose_name="Pfw Attempt Id", default=0)
    band = models.CharField(
        max_length=1,
        verbose_name="Filter",
        help_text="Filter used to do the observation (u, g, r, i, z, Y).",
        choices=(
            ("u", "u"),
            ("g", "g"),
            ("r", "r"),
            ("i", "i"),
            ("z", "z"),
            ("Y", "Y"),
        ),
    )
    radeg = models.FloatField(verbose_name="RA (deg)")
    decdeg = models.FloatField(verbose_name="Dec (deg)")
    exptime = models.FloatField(
        verbose_name="Exposure time", help_text="Exposure time of observation."
    )
    cloud_apass = models.FloatField(
        verbose_name="Cloud apass", help_text="Atmospheric extinction in magnitudes"
    )
    cloud_nomad = models.FloatField(
        verbose_name="Cloud nomad", help_text="Atmospheric extinction in magnitudes"
    )
    t_eff = models.FloatField(
        verbose_name="t_eff", help_text="Parameter related to image quality"
    )
    release = models.CharField(
        max_length=10,
        verbose_name="Release",
        help_text="Release has been retrieve from the ccd filename field. using this rule trim(split_part(path , /, 3))",
    )

    class Meta:
        indexes = [
            models.Index(fields=["nite"]),
            models.Index(fields=["date_obs"]),
            models.Index(fields=["release"]),
        ]

    def __str__(self):
        return str(self.id)
