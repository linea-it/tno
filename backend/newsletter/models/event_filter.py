from django.db import models
from app_newsletter.models.preference import Preference

class EventFilter(models.Model):

    preference_id = models.ForeignKey(Preference,
        on_delete=models.CASCADE,
    )

    filter_name = models.CharField(
        verbose_name="Filter Name",
        max_length=100,
        help_text="Nome utilizado para identificar o filtro.",
    )

    frequency = models.CharField(
        verbose_name="Frequency",
        max_length=100,
        help_text="Frequencia de recebimento do periodico quinzenal, mensal ou semestral.",
    )

    magnitude = models.IntegerField(
        verbose_name="Magnitude",
        default=15,
        help_text="Magnitude do objeto.",
    )

    filter_type = models.CharField(
        verbose_name="Filter Type",
        max_length=50,
        help_text="Filtro que permite escolher entre objeto, classe ou subclasse.",
    )

    local_solar_time_after = models.TimeField(
        verbose_name="Local Solar Time",
        help_text="Restringir o instante mais próximo de uma hora local específica (em termos de longitude).",
    )

    local_solar_time_before = models.TimeField(
        verbose_name="Local Solar Time",
        help_text="Restringir o instante mais próximo de uma hora local específica (em termos de longitude).",
    )

    magnitude_drop = models.IntegerField(
        verbose_name="Magnitude Drop",
        help_text="Magnitude Drop.",
    )

    event_duration = models.IntegerField(
        verbose_name="Event Duration",
        help_text="Duraçao da ocorrencia do evento.",
    )

    diameter = models.IntegerField(
        verbose_name="Diameter",
        help_text="Diametro do objeto.",
    )

    geo_location = models.BooleanField(
        verbose_name="Geo Location",
        help_text="Filtro de geolocalizaçao.",
    )

    lat = models.FloatField(
        verbose_name="Latitude",
        help_text="Latitude em graus.",
    )
    
    lon = models.FloatField(
        verbose_name="Longitude",
        help_text="Longitude em graus.",
    )
    
    alt = models.FloatField(
        verbose_name="Altitude",
        help_text="Altitude em kilometros.",
    )

    radius = models.FloatField(
        verbose_name="Radius",
        help_text="Raio em kilometro.",
    )
    
    def __str__(self):
        return str(self.id)