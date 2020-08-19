from django.conf import settings
from django.db import models
from des.models import SkybotJob, Exposure
from skybot.models import Position


class SkybotJobResult(models.Model):
    """Este model representa cada exposição que foi executada em uma Des/SkybotJob
    o conteudo desta tabela está em arquivo no diretório do job.

    ATENÇÂO: Ainda não tenho certeza se esta tabela será necessária. vou deixar o código comentado.
    """
    # Des Skybot Job
    job = models.ForeignKey(
        SkybotJob,
        on_delete=models.CASCADE,
        verbose_name='Skybot Job',
        related_name='job_results'
    )

    # Des Exposure
    exposure = models.ForeignKey(
        Exposure,
        on_delete=models.CASCADE,
        verbose_name='Exposure'
    )

    # Ticket retornado pelo, serve para ligar com a tabela Skybot_Position.Ticket
    ticket = models.BigIntegerField(
        verbose_name='Skybot Ticket',
        help_text='Id of the request made in the skybot. it serves to group all the positions that are of the same request.',
        default=0,
        db_index=True
    )

    # Indica se a execução da exposição teve sucesso.
    success = models.BooleanField(
        verbose_name='Success',
        help_text='true if the exposure was successfully executed.'
    )

    # Tempo de execução da exposição, somando as 2 etapas.
    execution_time = models.DurationField(
        verbose_name='Execution Time',
        null=True, blank=True
    )

    ccds_with_asteroids = models.PositiveIntegerField(
        verbose_name='CCDs With Asteroids',
        help_text='number of CCDs with Asteroids for this exposure',
        default=0
    )

    # Quantidade de posições retornadas pelo skybot
    positions = models.PositiveIntegerField(
        verbose_name='Positions',
        help_text='number of positions returned by skybot for this exposure',
        default=0
    )

    # Quantidade de posições dentro de algum CCD desta exposição.
    inside_ccd = models.PositiveIntegerField(
        verbose_name='Inside CCD',
        help_text='number of positions that are within any ccd of this exposure.',
        default=0
    )

    # Quantidade de posições que não estão em nenhum CCD desta exposição.
    outside_ccd = models.PositiveIntegerField(
        verbose_name='Outside CCD',
        help_text='number of positions are not in any ccd of this exposure.',
        default=0
    )

    # nome do arquivo com os resultados retornados pelo skybot.
    filename = models.CharField(
        max_length=100,
        verbose_name='Filename',
        help_text='name of the file with the results returned by skybot.'
    )

    def __str__(self):
        return str(self.id)
