# Generated by Django 3.2.18 on 2023-05-24 14:12

from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ('tno', '0024_auto_20230524_0047'),
    ]

    operations = [
        migrations.AddField(
            model_name='occultation',
            name='created_at',
            field=models.DateTimeField(auto_now=True, verbose_name='Created at'),
        ),
    ]