# Generated by Django 2.0.12 on 2020-06-26 18:50

from django.conf import settings
from django.db import migrations, models
import django.db.models.deletion


class Migration(migrations.Migration):

    dependencies = [
        migrations.swappable_dependency(settings.AUTH_USER_MODEL),
        ('des', '0006_auto_20200624_2016'),
    ]

    operations = [
        migrations.CreateModel(
            name='DownloadCcdJob',
            fields=[
                ('id', models.AutoField(auto_created=True, primary_key=True, serialize=False, verbose_name='ID')),
                ('date_initial', models.DateField(verbose_name='Date Initial')),
                ('date_final', models.DateField(verbose_name='Date Final')),
                ('status', models.IntegerField(choices=[(1, 'Idle'), (2, 'Running'), (3, 'Completed'), (4, 'Failed'), (5, 'Aborted'), (6, 'Stoped')], default=1, verbose_name='Status')),
                ('start', models.DateTimeField(auto_now_add=True, verbose_name='Start')),
                ('finish', models.DateTimeField(blank=True, null=True, verbose_name='Finish')),
                ('execution_time', models.DurationField(blank=True, null=True, verbose_name='Execution Time')),
                ('ccds', models.BigIntegerField(default=0, help_text='total ccds that were run in this job', verbose_name='CCDs')),
                ('t_size_downloaded', models.BigIntegerField(default=0, help_text='Total size downloaded in this job.', verbose_name='Size Downloaded')),
                ('error', models.TextField(blank=True, null=True, verbose_name='Error')),
                ('owner', models.ForeignKey(on_delete=django.db.models.deletion.CASCADE, related_name='des_download_ccd_job', to=settings.AUTH_USER_MODEL, verbose_name='Owner')),
            ],
        ),
    ]
