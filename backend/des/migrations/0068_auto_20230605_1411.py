# Generated by Django 3.2.18 on 2023-06-05 14:11

from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ('des', '0067_orbittracejobstatus'),
    ]

    operations = [
        migrations.AddField(
            model_name='orbittracejobstatus',
            name='task',
            field=models.CharField(default='-', help_text='Name of the task being executed.', max_length=100, verbose_name='Task'),
            preserve_default=False,
        ),
        migrations.AlterField(
            model_name='orbittracejobstatus',
            name='step',
            field=models.IntegerField(help_text='Identification of the step in the pipeline.', verbose_name='Step'),
        ),
    ]