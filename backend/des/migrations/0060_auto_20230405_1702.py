# Generated by Django 3.2.18 on 2023-04-05 17:02

from django.db import migrations


class Migration(migrations.Migration):

    dependencies = [
        ('des', '0059_auto_20230401_0011'),
    ]

    operations = [
        migrations.AlterUniqueTogether(
            name='observation',
            unique_together=set(),
        ),
        migrations.RemoveField(
            model_name='observation',
            name='ccd',
        ),
    ]