# Generated by Django 3.2.18 on 2024-08-13 18:42

from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ("tno", "0004_auto_20240417_1724"),
    ]

    operations = [
        migrations.AlterField(
            model_name="profile",
            name="dashboard",
            field=models.BooleanField(default=False),
        ),
    ]
