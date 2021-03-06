# Generated by Django 2.0.12 on 2020-06-24 20:16

from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ('des', '0005_auto_20200623_2039'),
    ]

    operations = [
        migrations.AddField(
            model_name='skybotjob',
            name='ccds',
            field=models.BigIntegerField(default=0, help_text='total ccds in the period of this job', verbose_name='CCDs'),
        ),
        migrations.AddField(
            model_name='skybotjob',
            name='nights',
            field=models.BigIntegerField(default=0, help_text='total nights with exhibitions in the period of this job.', verbose_name='Nights'),
        ),
        migrations.AlterField(
            model_name='skybotjob',
            name='exposures',
            field=models.BigIntegerField(default=0, help_text='total exposures that were run in this job', verbose_name='Exposures'),
        ),
    ]
