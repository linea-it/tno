# Generated by Django 2.2.13 on 2021-07-13 21:27

from django.db import migrations


class Migration(migrations.Migration):

    dependencies = [
        ('des', '0031_auto_20210713_2122'),
    ]

    operations = [
        migrations.RenameField(
            model_name='astrometryjob',
            old_name='Asteroids',
            new_name='asteroids',
        ),
    ]