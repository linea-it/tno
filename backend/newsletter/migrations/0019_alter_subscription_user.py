# Generated by Django 3.2.18 on 2024-08-16 20:23

import django.db.models.deletion
from django.conf import settings
from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        migrations.swappable_dependency(settings.AUTH_USER_MODEL),
        ("newsletter", "0018_eventfilter_description"),
    ]

    operations = [
        migrations.AlterField(
            model_name="subscription",
            name="user",
            field=models.OneToOneField(
                default=1,
                on_delete=django.db.models.deletion.CASCADE,
                related_name="subscription",
                to="auth.user",
                verbose_name="User",
            ),
            preserve_default=False,
        ),
    ]