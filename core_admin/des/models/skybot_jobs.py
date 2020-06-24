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
        verbose_name='Owner',
        related_name='des_skybot_run'
    )

    # data inicial usada para selecionar as exposições que serão processadas.
    date_initial = models.DateField(
        verbose_name='Date Initial',
        auto_now_add=False,
    )

    # data Final usado para selecionar as exposições que serão processadas
    date_final = models.DateField(
        verbose_name='Date Final',
        auto_now_add=False,
    )

    # Status da execução.
    status = models.IntegerField(
        verbose_name='Status',
        default=1,
        choices=(
            (1, 'Idle'),
            (2, 'Running'),
            (3, 'Completed'),
            (4, 'Failed'),
            (5, 'Aborted'),
            (6, 'Stoped')
        )
    )

    # Momento em que o Job foi criado.
    start = models.DateTimeField(
        verbose_name='Start',
        auto_now_add=True,
    )

    # Momento em que o Job foi finalizado.
    finish = models.DateTimeField(
        verbose_name='Finish',
        auto_now_add=False,
        null=True,
        blank=True
    )

    # Tempo de duração do Job.
    execution_time = models.DurationField(
        verbose_name='Execution Time',
        null=True, blank=True
    )

    # Total de exposições executadas neste job.
    exposures = models.BigIntegerField(
        verbose_name='Exposures',
        default=0
    )

    # Pasta onde estão os dados do Job.
    path = models.CharField(
        max_length=2048,
        verbose_name='Path',
        help_text='Path to the directory where the job data is located.'
    )

    results = models.CharField(
        max_length=2048,
        verbose_name='Results',
        help_text='Filepath to the results.csv. this file contains the results of the job.',
        null=True, 
        blank=True, 
        default=None
    )

    # Em caso de erro o Job fica com status 'Failed'
    # e a exeção e guardada neste campo.
    error = models.TextField(
        verbose_name="Error",
        null=True,
        blank=True
    )

    # class Meta:
    #     # Não pode ter Jobs iguais para o mesmo periodo.
    #     unique_together = ('date_initial', 'date_final')

    def __str__(self):
        return str(self.id)
