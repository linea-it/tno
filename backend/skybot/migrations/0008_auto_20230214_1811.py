# Generated by Django 3.2 on 2023-02-14 18:11

from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ('skybot', '0007_alter_position_id'),
    ]

    operations = [
        migrations.AddField(
            model_name='position',
            name='skybot_job',
            field=models.IntegerField(default=0, verbose_name='Skybot Job'),
        ),
        migrations.AlterUniqueTogether(
            name='position',
            unique_together={('name', 'raj2000', 'decj2000')},
        ),
        migrations.AddIndex(
            model_name='position',
            index=models.Index(fields=['skybot_job'], name='skybot_posi_skybot__aea079_idx'),
        ),
    ]