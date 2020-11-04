from django.db import models


class DashboardSkybotDynclassResult(models.Model):

    dynclass = models.CharField(
        max_length=12,
        verbose_name='Dynamic Class',
        unique=True,
        null=False,
        blank=False,
        choices=(('Centaur', 'Centaur'), ('Comet', 'Comet'),
                 ('Hungaria', 'Hungaria'), ('KBO', 'KBO'),
                 ('MB', 'MB'), ('Mars-Crosser', 'Mars-Crosser'),
                 ('NEA', 'NEA'), ('Planet', 'Planet'),
                 ('Trojan', 'Trojan')),
    )

    nights = models.IntegerField(
        verbose_name='Nights',
        default=0,
        null=False,
        blank=False,
    )

    ccds = models.IntegerField(
        verbose_name='CCDs',
        default=0,
        null=False,
        blank=False,
    )

    asteroids = models.IntegerField(
        verbose_name='Asteroids',
        default=0,
        null=False,
        blank=False,
    )

    positions = models.IntegerField(
        verbose_name='Positions',
        default=0,
        null=False,
        blank=False,
    )

    u = models.IntegerField(
        verbose_name='Band u',
        default=0,
        null=False,
        blank=False,
    )

    g = models.IntegerField(
        verbose_name='Band g',
        default=0,
        null=False,
        blank=False,
    )

    r = models.IntegerField(
        verbose_name='Band r',
        default=0,
        null=False,
        blank=False,
    )

    i = models.IntegerField(
        verbose_name='Band i',
        default=0,
        null=False,
        blank=False,
    )

    z = models.IntegerField(
        verbose_name='Band z',
        default=0,
        null=False,
        blank=False,
    )

    y = models.IntegerField(
        verbose_name='Band Y',
        default=0,
        null=False,
        blank=False,
    )

    def __str__(self):
        return str(self.id)
