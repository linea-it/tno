# Generated by Django 3.2.18 on 2023-03-13 21:46

from django.db import migrations, models
import django.db.models.deletion


class Migration(migrations.Migration):

    dependencies = [
        ('tno', '0017_predictionjobresult'),
    ]

    operations = [
        migrations.AddField(
            model_name='predictionjobresult',
            name='status',
            field=models.IntegerField(choices=[(1, 'Success'), (2, 'Failed')], default=1, verbose_name='Status'),
        ),
        migrations.AlterField(
            model_name='predictionjob',
            name='status',
            field=models.IntegerField(choices=[(1, 'Idle'), (2, 'Running'), (3, 'Completed'), (4, 'Failed'), (5, 'Aborted'), (6, 'Warning'), (7, 'Aborting')], default=1, verbose_name='Status'),
        ),
        migrations.AlterField(
            model_name='predictionjobresult',
            name='job',
            field=models.ForeignKey(on_delete=django.db.models.deletion.CASCADE, to='tno.predictionjob', verbose_name='Prediction Job'),
        ),
    ]