# Generated by Django 3.2.18 on 2023-05-23 23:59

from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ('tno', '0022_auto_20230401_0011'),
    ]

    operations = [
        migrations.AddField(
            model_name='predictionjob',
            name='avg_exec_time',
            field=models.FloatField(blank=True, default=0, help_text='average execution time per asteroid. (seconds)', null=True, verbose_name='Average Execution Time'),
        ),
        migrations.AlterField(
            model_name='predictionjob',
            name='filter_type',
            field=models.CharField(choices=[('name', 'Object name'), ('dynclass', 'Dynamic class (with subclasses)'), ('base_dynclass', 'Dynamic class')], max_length=15, verbose_name='Filter Type'),
        ),
        migrations.AlterField(
            model_name='predictionjobresult',
            name='bsp_jpl_dw_run',
            field=models.BooleanField(blank=True, default=False, null=True, verbose_name='bsp_jpl_dw_run'),
        ),
        migrations.AlterField(
            model_name='predictionjobresult',
            name='des_obs_gen_run',
            field=models.BooleanField(blank=True, default=False, null=True, verbose_name='des_obs_gen_run'),
        ),
        migrations.AlterField(
            model_name='predictionjobresult',
            name='obs_dw_run',
            field=models.BooleanField(blank=True, default=False, null=True, verbose_name='obs_dw_run'),
        ),
    ]