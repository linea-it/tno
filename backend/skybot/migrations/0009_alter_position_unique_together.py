# Generated by Django 3.2 on 2023-02-14 20:03

from django.db import migrations


class Migration(migrations.Migration):

    dependencies = [
        ('skybot', '0008_auto_20230214_1811'),
    ]

    operations = [
        migrations.AlterUniqueTogether(
            name='position',
            unique_together={('name', 'raj2000', 'decj2000', 'ticket')},
        ),
    ]