# Generated by Django 3.2.18 on 2023-03-06 19:35

from django.conf import settings
from django.db import migrations, models
import django.db.models.deletion


class Migration(migrations.Migration):

    dependencies = [
        migrations.swappable_dependency(settings.AUTH_USER_MODEL),
        ('tno', '0013_predictionjob'),
    ]

    operations = [
        migrations.AddField(
            model_name='predictionjob',
            name='owner',
            field=models.ForeignKey(default=1, on_delete=django.db.models.deletion.CASCADE, related_name='predicition_run', to='auth.user', verbose_name='Owner'),
            preserve_default=False,
        ),
    ]