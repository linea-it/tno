# Generated by Django 2.0.12 on 2020-07-27 21:04

from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ("des", "0014_auto_20200720_1617"),
    ]

    operations = [
        migrations.AddField(
            model_name="skybotjob",
            name="asteroids",
            field=models.BigIntegerField(
                default=0,
                help_text="Total unique objects returned by skybot",
                verbose_name="Asteroids",
            ),
        ),
        migrations.AddField(
            model_name="skybotjob",
            name="ccds_with_asteroid",
            field=models.BigIntegerField(
                default=0,
                help_text="Total CCDs that have at least one object through the skybot",
                verbose_name="CCDs with Asteroid",
            ),
        ),
        migrations.AddField(
            model_name="skybotjob",
            name="exposures_with_asteroid",
            field=models.BigIntegerField(
                default=0,
                help_text="Total Exposures that have at least one object through the skybot",
                verbose_name="Exposures with Asteroid",
            ),
        ),
        migrations.AddField(
            model_name="skybotjob",
            name="positions",
            field=models.BigIntegerField(
                default=0,
                help_text="Total positions returned by skybot that are in DES ccds.",
                verbose_name="Positions",
            ),
        ),
    ]