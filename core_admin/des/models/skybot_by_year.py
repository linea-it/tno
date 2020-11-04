from django.db import models


class SkybotByYear(models.Model):
    year = models.CharField(
        max_length=4,
        verbose_name='Year',
        unique=True,
        null=False,
        blank=False,
        choices=(('2012', '2012'), ('2013', '2013'),
                 ('2014', '2014'), ('2015', '2015'),
                 ('2016', '2016'), ('2017', '2017'),
                 ('2018', '2018'), ('2019', '2019')),
    )

    nights = models.IntegerField(
        verbose_name='Nights with exposures',
        default=0,
        null=False,
        blank=False,
    )

    exposures = models.IntegerField(
        verbose_name='Exposures',
        default=0,
        null=False,
        blank=False,
    )

    ccds = models.IntegerField(
        verbose_name='CCDs with exposures',
        default=0,
        null=False,
        blank=False,
    )

    nights_analyzed = models.IntegerField(
        verbose_name='Nights analyzed',
        default=0,
        null=False,
        blank=False,
    )

    exposures_analyzed = models.IntegerField(
        verbose_name='Exposures analyzed',
        default=0,
        null=False,
        blank=False,
    )

    ccds_analyzed = models.IntegerField(
        verbose_name='CCDs analyzed',
        default=0,
        null=False,
        blank=False,
    )

    def __str__(self):
        return str(self.id)
