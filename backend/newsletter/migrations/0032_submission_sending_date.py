# Generated by Django 3.2.18 on 2024-11-21 13:07

from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ("newsletter", "0031_remove_submission_sending"),
    ]

    operations = [
        migrations.AddField(
            model_name="submission",
            name="sending_date",
            field=models.DateTimeField(
                blank=True,
                help_text="Data do envio da submissao.",
                null=True,
                verbose_name="Seding Datte",
            ),
        ),
    ]
