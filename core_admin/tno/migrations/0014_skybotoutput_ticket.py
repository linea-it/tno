# Generated by Django 2.0.12 on 2020-04-29 19:26

from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ('tno', '0013_remove_skybotoutput_pointing'),
    ]

    operations = [
        migrations.AddField(
            model_name='skybotoutput',
            name='ticket',
            field=models.BigIntegerField(default=0, help_text='Id of the request made in the skybot. it serves to group all the positions that are of the same request.', verbose_name='Skybot Ticket'),
        ),
    ]