# Generated by Django 3.2.18 on 2024-01-22 18:00

from django.db import migrations


class Migration(migrations.Migration):

    dependencies = [
        ('tno', '0047_remove_occultation_asteroid'),
    ]

    operations = [
        migrations.RemoveField(
            model_name='predictionjobresult',
            name='asteroid',
        ),
    ]