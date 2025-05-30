# Generated by Django 3.2.18 on 2025-02-10 17:30

from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ("tno", "0011_rename_asteroidname_asteroidcache"),
    ]

    operations = [
        migrations.CreateModel(
            name="DynclassCache",
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
                    "skybot_dynbaseclass",
                    models.CharField(
                        help_text="(ucd=“meta.code.class”) Object's base dynamical classification as defined by Skybot (KBO, Centaur, Trojan, MB, etc.).",
                        max_length=24,
                        verbose_name="Object's base dynamical classification as defined by Skybot",
                    ),
                ),
                (
                    "skybot_dynsubclass",
                    models.CharField(
                        blank=True,
                        default=None,
                        help_text="(ucd=“meta.code.class;src.class”) Object's dynamical subclass as defined by Skybot (KBO>Resonant>12:5, MB>Inner, etc.).",
                        max_length=24,
                        null=True,
                        verbose_name="Object's dynamical subclass as defined by Skybot",
                    ),
                ),
            ],
            options={
                "verbose_name": "Dynclass Cache",
                "verbose_name_plural": "Dynclass Cache",
            },
        ),
        migrations.AlterModelOptions(
            name="asteroidcache",
            options={
                "verbose_name": "Asteroid Cache",
                "verbose_name_plural": "Asteroid Cache",
            },
        ),
        migrations.AddIndex(
            model_name="asteroidcache",
            index=models.Index(fields=["name"], name="tno_asteroi_name_00f33a_idx"),
        ),
        migrations.AddIndex(
            model_name="asteroidcache",
            index=models.Index(fields=["number"], name="tno_asteroi_number_0f30ab_idx"),
        ),
        migrations.AddIndex(
            model_name="asteroidcache",
            index=models.Index(
                fields=["principal_designation"], name="tno_asteroi_princip_475d9e_idx"
            ),
        ),
        migrations.AddIndex(
            model_name="asteroidcache",
            index=models.Index(fields=["alias"], name="tno_asteroi_alias_d016b2_idx"),
        ),
        migrations.AddIndex(
            model_name="dynclasscache",
            index=models.Index(
                fields=["skybot_dynbaseclass"], name="tno_dynclas_skybot__512a12_idx"
            ),
        ),
        migrations.AddIndex(
            model_name="dynclasscache",
            index=models.Index(
                fields=["skybot_dynsubclass"], name="tno_dynclas_skybot__f7c205_idx"
            ),
        ),
    ]
