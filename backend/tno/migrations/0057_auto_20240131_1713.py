# Generated by Django 3.2.18 on 2024-01-31 17:13

from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ('tno', '0056_auto_20240131_1654'),
    ]

    operations = [
        migrations.AlterField(
            model_name='occultation',
            name='name',
            field=models.CharField(help_text='(ucd=“meta.id;meta.main”) Object name (official or provisional designation).', max_length=35, verbose_name='Name'),
        ),
        migrations.AlterField(
            model_name='occultation',
            name='number',
            field=models.PositiveBigIntegerField(blank=True, default=None, help_text='(ucd=“meta.id;meta.number”) Object number (not all objects have numbers assigned).', null=True, verbose_name='Number'),
        ),
        migrations.AlterField(
            model_name='occultation',
            name='principal_designation',
            field=models.CharField(blank=True, default=None, max_length=35, null=True, verbose_name='Principal Designation'),
        ),
        migrations.AddIndex(
            model_name='occultation',
            index=models.Index(fields=['principal_designation'], name='tno_occulta_princip_85f90a_idx'),
        ),
        migrations.AddIndex(
            model_name='occultation',
            index=models.Index(fields=['astorb_dynbaseclass'], name='tno_occulta_astorb__da9cf2_idx'),
        ),
        migrations.AddIndex(
            model_name='occultation',
            index=models.Index(fields=['astorb_dynsubclass'], name='tno_occulta_astorb__fee3ad_idx'),
        ),
        migrations.AddIndex(
            model_name='occultation',
            index=models.Index(fields=['g_star'], name='tno_occulta_g_star_bb4e32_idx'),
        ),
        migrations.AddIndex(
            model_name='occultation',
            index=models.Index(fields=['created_at'], name='tno_occulta_created_ec9f58_idx'),
        ),
    ]