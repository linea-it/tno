# Generated by Django 2.2.13 on 2022-04-29 19:31

from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ("tno", "0006_auto_20211026_2032"),
    ]

    operations = [
        migrations.AlterField(
            model_name="occultation",
            name="pmdec",
            field=models.FloatField(
                blank=True,
                default=0,
                help_text="star proper motion (mas/yr); (0 when not provided by Gaia DR1)",
                null=True,
                verbose_name="pmdec",
            ),
        ),
    ]