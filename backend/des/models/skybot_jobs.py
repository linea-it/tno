from django.conf import settings
from django.db import models


class SkybotJob(models.Model):
    """
    Representa cada Job do Skybot que foi executado.
    Os jobs serão executados em pedaçõs, cada pedaço
    representa um periodo, em um periodo podem ter N exposições.
    """

    # Usuario que solicitou a execução do Job.
    owner = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.CASCADE,
        verbose_name="Owner",
        related_name="des_skybot_run",
    )

    # data inicial usada para selecionar as exposições que serão processadas.
    date_initial = models.DateField(
        verbose_name="Date Initial",
        auto_now_add=False,
    )

    # data Final usado para selecionar as exposições que serão processadas
    date_final = models.DateField(
        verbose_name="Date Final",
        auto_now_add=False,
    )

    # Status da execução.
    status = models.IntegerField(
        verbose_name="Status",
        default=1,
        choices=(
            (1, "Idle"),
            (2, "Running"),
            (3, "Completed"),
            (4, "Failed"),
            (5, "Aborted"),
            (6, "Warning"),
        ),
    )

    # Momento em que o Job foi criado.
    submit_time = models.DateTimeField(
        verbose_name="Submit Time",
        auto_now_add=True,
    )

    # Momento em que o Job foi Iniciado
    start = models.DateTimeField(
        verbose_name="Start",
        auto_now_add=True,
    )

    # Momento em que o Job foi finalizado.
    finish = models.DateTimeField(
        verbose_name="Finish", auto_now_add=False, null=True, blank=True
    )

    # Tempo de duração do Job.
    execution_time = models.DurationField(
        verbose_name="Execution Time", null=True, blank=True
    )

    # Tempo de duração estimado no começo do Job
    estimated_execution_time = models.DurationField(
        verbose_name="Estimated Execution Time", null=True, blank=True
    )

    # Total de exposições que serão executadas neste Job.
    exposures = models.BigIntegerField(
        verbose_name="Exposures",
        help_text="total exposures that were run in this job",
        default=0,
    )

    # Total de ccds no periodo deste job.
    ccds = models.BigIntegerField(
        verbose_name="CCDs", help_text="total ccds in the period of this job", default=0
    )

    # Total de nights com exposures no periodo deste job.
    nights = models.BigIntegerField(
        verbose_name="Nights",
        help_text="total nights with exhibitions in the period of this job.",
        default=0,
    )

    # Total de posições retornadas pelo skybot que estão em ccds do DES.
    positions = models.BigIntegerField(
        verbose_name="Positions",
        help_text="Total positions returned by skybot that are in DES ccds.",
        default=0,
    )

    # Total de Objetos unicos retornados pelo skybot
    asteroids = models.BigIntegerField(
        verbose_name="Asteroids",
        help_text="Total unique objects returned by skybot",
        default=0,
    )

    # Total de Exposições que tem pelo menos 1 objeto pelo skybot
    exposures_with_asteroid = models.BigIntegerField(
        verbose_name="Exposures with Asteroid",
        help_text="Total Exposures that have at least one object through the skybot",
        default=0,
    )

    ccds_with_asteroid = models.BigIntegerField(
        verbose_name="CCDs with Asteroid",
        help_text="Total CCDs that have at least one object through the skybot",
        default=0,
    )

    # Pasta onde estão os dados do Job.
    path = models.CharField(
        max_length=2048,
        verbose_name="Path",
        help_text="Path to the directory where the job data is located.",
    )

    results = models.CharField(
        max_length=2048,
        verbose_name="Results",
        help_text="Filepath to the results.csv. this file contains the results of the job.",
        null=True,
        blank=True,
        default=None,
    )

    # Em caso de erro o Job fica com status 'Failed'
    # e a exeção e guardada neste campo.
    error = models.TextField(verbose_name="Error", null=True, blank=True)

    # debug = False Os arquivos retornados pelo skybot serão removidos no final do job.
    debug = models.BooleanField(
        verbose_name="Debug", 
        default=False, 
        blank=False, 
        null=False, 
        help_text="debug = False The files returned by skybot will be removed at the end of the job."
    )

    # summary = True executa os metodos que preenchem as tabelas de estatisticas dos jobs. 
    summary = models.BooleanField(
        verbose_name="Summary", 
        default=True, 
        blank=False, 
        null=False, 
        help_text="summary = True runs the methods that populate the job statistics tables."
    )    
    
    def __str__(self):
        return str(self.id)
