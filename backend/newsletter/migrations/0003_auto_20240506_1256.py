# Generated by Django 3.2.18 on 2024-05-06 12:56

import django.db.models.deletion
from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ("newsletter", "0002_alter_subscription_activation_code"),
    ]

    operations = [
        migrations.CreateModel(
            name="EventFilter",
            fields=[
                (
                    "id",
                    models.BigAutoField(
                        auto_created=True,
                        primary_key=True,
                        serialize=False,
                        verbose_name="ID",
                    ),
                ),
                (
                    "filter_name",
                    models.CharField(
                        help_text="Nome utilizado para identificar o filtro.",
                        max_length=100,
                        verbose_name="Filter Name",
                    ),
                ),
                (
                    "frequency",
                    models.CharField(
                        help_text="Frequencia de recebimento do periodico quinzenal, mensal ou semestral.",
                        max_length=100,
                        verbose_name="Frequency",
                    ),
                ),
                (
                    "magnitude",
                    models.IntegerField(
                        default=15,
                        help_text="Magnitude do objeto.",
                        verbose_name="Magnitude",
                    ),
                ),
                (
                    "filter_type",
                    models.CharField(
                        help_text="Filtro que permite escolher entre objeto, classe ou subclasse.",
                        max_length=50,
                        verbose_name="Filter Type",
                    ),
                ),
                (
                    "local_solar_time_after",
                    models.TimeField(
                        help_text="Restringir o instante mais próximo de uma hora local específica (em termos de longitude).",
                        verbose_name="Local Solar Time",
                    ),
                ),
                (
                    "local_solar_time_before",
                    models.TimeField(
                        help_text="Restringir o instante mais próximo de uma hora local específica (em termos de longitude).",
                        verbose_name="Local Solar Time",
                    ),
                ),
                (
                    "magnitude_drop",
                    models.IntegerField(
                        help_text="Magnitude Drop.", verbose_name="Magnitude Drop"
                    ),
                ),
                (
                    "event_duration",
                    models.IntegerField(
                        help_text="Duraçao da ocorrencia do evento.",
                        verbose_name="Event Duration",
                    ),
                ),
                (
                    "diameter",
                    models.IntegerField(
                        help_text="Diametro do objeto.", verbose_name="Diameter"
                    ),
                ),
                (
                    "geo_location",
                    models.BooleanField(
                        help_text="Filtro de geolocalizaçao.",
                        verbose_name="Geo Location",
                    ),
                ),
                (
                    "lat",
                    models.FloatField(
                        help_text="Latitude em graus.", verbose_name="Latitude"
                    ),
                ),
                (
                    "lon",
                    models.FloatField(
                        help_text="Longitude em graus.", verbose_name="Longitude"
                    ),
                ),
                (
                    "alt",
                    models.FloatField(
                        help_text="Altitude em kilometros.", verbose_name="Altitude"
                    ),
                ),
                (
                    "radius",
                    models.FloatField(
                        help_text="Raio em kilometro.", verbose_name="Radius"
                    ),
                ),
            ],
        ),
        migrations.CreateModel(
            name="Submission",
            fields=[
                (
                    "id",
                    models.BigAutoField(
                        auto_created=True,
                        primary_key=True,
                        serialize=False,
                        verbose_name="ID",
                    ),
                ),
                (
                    "process_date",
                    models.DateTimeField(
                        help_text="Data do processamento da submissao.",
                        verbose_name="Process Datte",
                    ),
                ),
                (
                    "events_count",
                    models.IntegerField(
                        help_text="Contagem dos eventos.", verbose_name="Events Count"
                    ),
                ),
                (
                    "prepared",
                    models.BooleanField(
                        help_text="Indica se a submmissao foi preparada ou nao.",
                        verbose_name="Prepared",
                    ),
                ),
                (
                    "sending",
                    models.BooleanField(
                        help_text="Indica se a submissao está sendo enviada ou nao.",
                        verbose_name="Sending",
                    ),
                ),
                (
                    "sent",
                    models.BooleanField(
                        help_text="Indica se a submissao foi enviada ou nao.",
                        verbose_name="Sent",
                    ),
                ),
                (
                    "title",
                    models.TextField(
                        help_text="Titulo da submissao.", verbose_name="Title"
                    ),
                ),
                (
                    "sent_date",
                    models.BooleanField(
                        help_text="Indica se a data de envio da submissao.",
                        verbose_name="Sent Date",
                    ),
                ),
                (
                    "eventFilter_id",
                    models.ForeignKey(
                        on_delete=django.db.models.deletion.CASCADE,
                        to="newsletter.eventfilter",
                    ),
                ),
                (
                    "subscription_id",
                    models.ForeignKey(
                        on_delete=django.db.models.deletion.CASCADE,
                        to="newsletter.subscription",
                    ),
                ),
            ],
        ),
        migrations.CreateModel(
            name="Preference",
            fields=[
                (
                    "id",
                    models.BigAutoField(
                        auto_created=True,
                        primary_key=True,
                        serialize=False,
                        verbose_name="ID",
                    ),
                ),
                (
                    "subscription_id",
                    models.ForeignKey(
                        on_delete=django.db.models.deletion.CASCADE,
                        to="newsletter.subscription",
                    ),
                ),
            ],
        ),
        migrations.AddField(
            model_name="eventfilter",
            name="preference_id",
            field=models.ForeignKey(
                on_delete=django.db.models.deletion.CASCADE, to="newsletter.preference"
            ),
        ),
        migrations.CreateModel(
            name="Attachment",
            fields=[
                (
                    "id",
                    models.BigAutoField(
                        auto_created=True,
                        primary_key=True,
                        serialize=False,
                        verbose_name="ID",
                    ),
                ),
                (
                    "filename",
                    models.CharField(
                        help_text="Nome do arquivo anexado.",
                        max_length=200,
                        verbose_name="Filename",
                    ),
                ),
                (
                    "size",
                    models.IntegerField(
                        help_text="Tamanho do arquivo anexado.", verbose_name="Size"
                    ),
                ),
                (
                    "submission_id",
                    models.ForeignKey(
                        on_delete=django.db.models.deletion.CASCADE,
                        to="newsletter.submission",
                    ),
                ),
            ],
        ),
    ]
