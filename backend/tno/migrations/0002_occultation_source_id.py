# Generated by Django 3.2.18 on 2024-03-27 20:18

from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ("tno", "0001_initial"),
    ]

    operations = [
        migrations.AddField(
            model_name="occultation",
            name="source_id",
            field=models.PositiveBigIntegerField(
                blank=True,
                default=None,
                help_text="GAIA source id Star candidate",
                null=True,
                verbose_name="Source ID",
            ),
        ),
    ]