# Generated by Django 3.2.18 on 2024-01-22 15:18

from django.db import migrations


class Migration(migrations.Migration):

    dependencies = [
        ('tno', '0046_auto_20240108_2241'),
    ]

    operations = [
        migrations.RemoveField(
            model_name='occultation',
            name='asteroid',
        ),
    ]