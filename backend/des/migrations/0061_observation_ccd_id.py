# Generated by Django 3.2.18 on 2023-04-05 17:03

from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ('des', '0060_auto_20230405_1702'),
    ]

    operations = [
        migrations.AddField(
            model_name='observation',
            name='ccd_id',
            field=models.IntegerField(default=0, help_text='Field that identifies an CCD in the DES CCD table. represents desfile_id', verbose_name='CCD'),
        ),
    ]