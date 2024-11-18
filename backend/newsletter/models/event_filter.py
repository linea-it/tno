from django.conf import settings
from django.db import models
from newsletter.models.subscription import Subscription

FREQUENCY_CHOICES = [
    (1, "Monthly"),
    (2, "Weekly"),
    (3, "Daily"),
]

FILTER_TYPE_CHOICES = [
    ("name", "Object name"),
    ("dynclass", "Dynamic class (with subclasses)"),
    ("base_dynclass", "Dynamic class"),
]


class EventFilter(models.Model):

    # Usuario que solicitou a subscricao.
    user = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.CASCADE,
        verbose_name="User",
        related_name="event_filter",
    )

    filter_name = models.CharField(
        verbose_name="Filter Name",
        max_length=100,
        help_text="Nome utilizado para identificar o filtro.",
    )

    description = models.TextField(
        verbose_name="Description", null=True, blank=True, default=None
    )

    frequency = models.IntegerField(
        verbose_name="Frequency",
        choices=FREQUENCY_CHOICES,
        default=1,
        help_text="Frequencia de recebimento do periodico 1-mensal, 2-semanal, 3-diario.",
    )

    magnitude_max = models.IntegerField(
        verbose_name="Magnitude max",
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
        blank=True,
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

    magnitude_drop_max = models.IntegerField(
        verbose_name="Magnitude Drop max",
        help_text="Magnitude Drop max.",
        null=True,
        blank=True,
        default=None,
    )

    event_duration = models.FloatField(
        verbose_name="Event Duration",
        help_text="Duraçao da ocorrencia do evento.",
        null=True,
        blank=True,
        default=None,
    )

    closest_approach_uncertainty_km = models.FloatField(
        verbose_name="Uncertainty (km)",
        help_text="Uncertainty in geocentric closest approach (km).",
        null=True,
        blank=True,
        default=None,
    )

    diameter_min = models.FloatField(
        verbose_name="Diameter",
        help_text="Diametro do objeto.",
        null=True,
        blank=True,
        default=None,
    )
    diameter_max = models.FloatField(
        verbose_name="Diameter",
        help_text="Diametro do objeto.",
        null=True,
        blank=True,
        default=None,
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

    def can_delete(self, user) -> bool:
        if self.user.id == user.id or user.is_superuser():
            return True
        return False
