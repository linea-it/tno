# Generated by Django 2.0.12 on 2020-04-29 18:43

from django.db import migrations


class Migration(migrations.Migration):

    dependencies = [
        ('tno', '0011_auto_20200429_1842'),
    ]

    operations = [
        migrations.RemoveField(
            model_name='skybotoutput',
            name='band',
        ),
        migrations.RemoveField(
            model_name='skybotoutput',
            name='ccdnum',
        ),
        migrations.RemoveField(
            model_name='skybotoutput',
            name='expnum',
        ),
        migrations.RemoveField(
            model_name='skybotoutput',
            name='externallink',
        ),
    ]