# Generated by Django 3.2 on 2023-02-16 20:41

from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ('des', '0044_auto_20230216_2040'),
    ]

    operations = [
        migrations.AddField(
            model_name='orbittracejob',
            name='count_failures',
            field=models.IntegerField(default=0, help_text='Failures Count', verbose_name='Failures Count'),
        ),
        migrations.AddField(
            model_name='orbittracejob',
            name='count_success',
            field=models.IntegerField(default=0, help_text='Success Count', verbose_name='Success Count'),
        ),
    ]