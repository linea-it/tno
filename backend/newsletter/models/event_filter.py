from django.db import models
from newsletter.models.subscription import Subscription

FREQUENCY_CHOICES = [
    (1, "Monthly"),
    (2, "Weekly"),
]

FILTER_TYPE_CHOICES = [
    ("name", "Object name"),
    ("dynclass", "Dynamic class (with subclasses)"),
    ("base_dynclass", "Dynamic class"),
]

class EventFilter(models.Model):

    subscription_id = models.ForeignKey(
        Subscription,
        on_delete=models.CASCADE,
    )

    filter_name = models.CharField(
        verbose_name="Filter Name",
        max_length=100,
        help_text="Nome utilizado para identificar o filtro.",
    )

    frequency = models.IntegerField(
        verbose_name="Frequency",
        choices=FREQUENCY_CHOICES,
        default=1,
        help_text="Frequencia de recebimento do periodico 1-semanal, 2-mensal.",
    )

    magnitude = models.IntegerField(
        verbose_name="Magnitude",
        default=15,
        help_text="Magnitude do objeto.",
        null=True,
        blank=True,
    )

    filter_type = models.CharField(
        verbose_name="Filter Type",
        help_text="Filtro que permite escolher entre objeto, classe ou subclasse.",
        max_length=15,
        choices=FILTER_TYPE_CHOICES,
        default="name",
    )

    filter_value = models.TextField(
        verbose_name="Filter Value",
        help_text="Valor que será utilizado no filtro.",
        null=True,
        blank=True,
    )

    local_solar_time_after = models.TimeField(
        verbose_name="Local Solar Time",
        help_text="Restringir o instante mais próximo de uma hora local específica (em termos de longitude).",
        null=True,
        blank=True,
        default=None,
    )

    local_solar_time_before = models.TimeField(
        verbose_name="Local Solar Time",
        help_text="Restringir o instante mais próximo de uma hora local específica (em termos de longitude).",
        null=True,
        blank=True,
        default=None,
    )

    magnitude_drop = models.IntegerField(
        verbose_name="Magnitude Drop",
        help_text="Magnitude Drop.",
        null=True,
        blank=True,
        default=None,
    )

    event_duration = models.IntegerField(
        verbose_name="Event Duration",
        help_text="Duraçao da ocorrencia do evento.",
        null=True,
        blank=True,
        default=None,
    )

    diameter = models.IntegerField(
        verbose_name="Diameter",
        help_text="Diametro do objeto.",
        null=True,
        blank=True,
        default=None,
    )

    geo_location = models.BooleanField(
        verbose_name="Geo Location",
        help_text="Filtro de geolocalizaçao.",
        default=False,
    )

    latitude = models.FloatField(
        verbose_name="Latitude",
        help_text="Latitude em graus.",
        null=True,
        blank=True,
        default=None,
    )

    longitude = models.FloatField(
        verbose_name="Longitude",
        help_text="Longitude em graus.",
        null=True,
        blank=True,
        default=None,
    )

    altitude = models.FloatField(
        verbose_name="Altitude",
        help_text="Altitude em kilometros.",
        null=True,
        blank=True,
        default=None,
    )

    location_radius = models.FloatField(
        verbose_name="Radius",
        help_text="Raio em kilometro.",
        null=True,
        blank=True,
        default=None,
    )

    def __str__(self):
        return str(self.id)
