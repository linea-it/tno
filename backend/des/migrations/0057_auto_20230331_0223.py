# Generated by Django 3.2.18 on 2023-03-31 02:23

from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ('des', '0056_alter_orbittracejob_h_exec_time'),
    ]

    operations = [
        migrations.RenameField(
            model_name='orbittracejobresult',
            old_name='asteroid_name',
            new_name='name',
        ),
        migrations.RemoveField(
            model_name='orbittracejobresult',
            name='asteroid_number',
        ),
        migrations.AddField(
            model_name='orbittracejobresult',
            name='number',
            field=models.CharField(blank=True, max_length=100, null=True, verbose_name='Asteroid Number'),
        ),
        migrations.AlterField(
            model_name='orbittracejobresult',
            name='spk_id',
            field=models.CharField(blank=True, max_length=100, null=True, verbose_name='Spk Id'),
        ),
    ]