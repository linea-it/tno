from des.models.ccd import Ccd
from des.models.exposure import Exposure
from django.db import models
from skybot.models import Position


class SkybotPosition(models.Model):
    """
    Representa as posições de objetos do skybot que
    estão dentro de algum CCD do DES.
    """

    # Ligação com a tabela Skybot
    # so existe essa ligação se a posição na skybot estiver dentro de um CCD do DES.
    # Uma posição, é um Objeto que no momento de uma exposição
    # estava na area da exposição.
    position = models.ForeignKey(
        Position,
        on_delete=models.CASCADE,
        verbose_name="Position",
        help_text="Represents a specific position in the Skybot result.",
    )

    # Ligação com a tabela de apontamentos.
    # Uma exposição é unica usando o campo pfw_attempt_id.
    # Exposição = 62 CCDs em uma Data/Hora em uma poisção central, em uma banda.
    exposure = models.ForeignKey(
        Exposure,
        on_delete=models.CASCADE,
        verbose_name="Exposure",
        help_text="Field that identifies an exposure in the Pointings table. represents pfw_attempt_id.",
    )

    # Ligação com a tabela de apontamentos.
    # Este campo representa um CCD unico. que é a composição de
    # CCD = Parte de uma exposição, em uma data/hora, banda, uma area retangular com um numero que vai de 1 a 62.
    # Importante: O campo que representa um CCD individualmente no des é o desfile_id.
    ccd = models.ForeignKey(
        Ccd,
        on_delete=models.CASCADE,
        # related_name='skybot_position_ccd',
        verbose_name="CCD",
        help_text="Field that identifies an CCD in the DES CCD table. represents desfile_id",
    )

    ticket = models.BigIntegerField(
        verbose_name="Skybot Ticket",
        help_text="Id of the request made in the skybot. it serves to group all the positions that are of the same request.",
        default=0,
        db_index=True,
    )

    # TODO: Talvez seja necessário acrescentar uma relação com a execução que identificou esses CCD/Posição.

    class Meta:
        # A mesma posição não pode se repetir em um mesmo ccd.
        unique_together = ("position", "exposure", "ccd")

    def __str__(self):
        return str(self.id)
