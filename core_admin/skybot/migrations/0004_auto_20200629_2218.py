# Generated by Django 2.0.12 on 2020-06-29 22:18

from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ('skybot', '0003_position_created'),
    ]

    operations = [
        migrations.AlterField(
            model_name='position',
            name='created',
            field=models.DateTimeField(auto_now_add=True, null=True, verbose_name='Created'),
        ),
    ]
