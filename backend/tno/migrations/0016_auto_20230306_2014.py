# Generated by Django 3.2.18 on 2023-03-06 20:14

from django.db import migrations


class Migration(migrations.Migration):

    dependencies = [
        ('tno', '0015_predictionjob_force_refresh_inputs'),
    ]

    operations = [
        migrations.RenameField(
            model_name='predictionjob',
            old_name='force_refresh_inputs',
            new_name='force_refresh_input',
        ),
        migrations.RenameField(
            model_name='predictionjob',
            old_name='inputs_days_to_expire',
            new_name='input_days_to_expire',
        ),
    ]