# Generated by Django 3.2.18 on 2024-11-13 17:21

from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        (
            "newsletter",
            "0028_rename_closest_approach_uncertainty_in_km_eventfilter_closest_approach_uncertainty_km",
        ),
    ]

    operations = [
        migrations.AlterField(
            model_name="eventfilter",
            name="closest_approach_uncertainty_km",
            field=models.FloatField(
                blank=True,
                default=None,
                help_text="Uncertainty in geocentric closest approach (km).",
                null=True,
                verbose_name="Uncertainty (km)",
            ),
        ),
        migrations.AlterField(
            model_name="eventfilter",
            name="diameter_max",
            field=models.FloatField(
                blank=True,
                default=None,
                help_text="Diametro do objeto.",
                null=True,
                verbose_name="Diameter",
            ),
        ),
        migrations.AlterField(
            model_name="eventfilter",
            name="diameter_min",
            field=models.FloatField(
                blank=True,
                default=None,
                help_text="Diametro do objeto.",
                null=True,
                verbose_name="Diameter",
            ),
        ),
        migrations.AlterField(
            model_name="eventfilter",
            name="event_duration",
            field=models.FloatField(
                blank=True,
                default=None,
                help_text="Duraçao da ocorrencia do evento.",
                null=True,
                verbose_name="Event Duration",
            ),
        ),
    ]