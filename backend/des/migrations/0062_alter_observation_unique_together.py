# Generated by Django 3.2.18 on 2023-04-05 17:04

from django.db import migrations


class Migration(migrations.Migration):

    dependencies = [
        ('tno', '0022_auto_20230401_0011'),
        ('des', '0061_observation_ccd_id'),
    ]

    operations = [
        migrations.AlterUniqueTogether(
            name='observation',
            unique_together={('asteroid', 'ccd_id')},
        ),
    ]