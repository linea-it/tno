# Generated by Django 3.2.18 on 2024-02-16 00:17

from django.db import migrations, models
import django.db.models.deletion


class Migration(migrations.Migration):

    dependencies = [
        ("tno", "0002_auto_20240216_0017"),
        ("des", "0001_squashed_0070_auto_20240123_1257"),
    ]

    operations = [
        migrations.AlterField(
            model_name="orbittracejob",
            name="bsp_planetary",
            field=models.ForeignKey(
                on_delete=django.db.models.deletion.CASCADE,
                to="tno.bspplanetary",
                verbose_name="Planetary Ephemeris",
            ),
        ),
        migrations.AlterField(
            model_name="orbittracejob",
            name="leap_seconds",
            field=models.ForeignKey(
                on_delete=django.db.models.deletion.CASCADE,
                to="tno.leapsecond",
                verbose_name="Leap Second",
            ),
        ),
        migrations.AlterField(
            model_name="orbittracejob",
            name="submit_time",
            field=models.DateTimeField(auto_now_add=True, verbose_name="Submit Time"),
        ),
    ]