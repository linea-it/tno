# Generated by Django 3.2.18 on 2024-01-23 12:57

from django.db import migrations


class Migration(migrations.Migration):

    dependencies = [
        ('des', '0069_alter_orbittracejobstatus_task'),
    ]

    operations = [
        migrations.AlterUniqueTogether(
            name='observation',
            unique_together={('name', 'ccd_id')},
        ),
        migrations.RemoveField(
            model_name='observation',
            name='asteroid',
        ),
    ]