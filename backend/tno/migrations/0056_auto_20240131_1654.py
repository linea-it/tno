# Generated by Django 3.2.18 on 2024-01-31 16:54

from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ('tno', '0055_auto_20240131_1643'),
    ]

    operations = [
        migrations.RenameField(
            model_name='occultation',
            old_name='j',
            new_name='j_star',
        ),
        migrations.RenameField(
            model_name='occultation',
            old_name='k',
            new_name='k_star',
        ),
        migrations.AddField(
            model_name='occultation',
            name='g_star',
            field=models.FloatField(default=0, help_text='G*, J*, H*, K* are normalized magnitudes to a common', verbose_name='G*'),
        ),
        migrations.AddField(
            model_name='occultation',
            name='h_star',
            field=models.FloatField(blank=True, default=None, help_text='G*, J*, H*, K* are normalized magnitudes to a common', null=True, verbose_name='H*'),
        ),
    ]