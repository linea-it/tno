# Generated by Django 3.2.18 on 2025-01-21 14:59

from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ("tno", "0008_merge_20240830_1446"),
    ]

    operations = [
        migrations.CreateModel(
            name="Highlights",
            fields=[
                (
                    "id",
                    models.BigAutoField(
                        auto_created=True,
                        primary_key=True,
                        serialize=False,
                        verbose_name="ID",
                    ),
                ),
                (
                    "month_count",
                    models.BigIntegerField(
                        default=0,
                        help_text="The month count of the occultations",
                        verbose_name="Month count",
                    ),
                ),
                (
                    "next_month_count",
                    models.BigIntegerField(
                        default=0,
                        help_text="The month count of the next month occultations",
                        verbose_name="Next month count",
                    ),
                ),
                (
                    "week_count",
                    models.BigIntegerField(
                        default=0,
                        help_text="The week count of the occultations",
                        verbose_name="Week count",
                    ),
                ),
                (
                    "next_week_count",
                    models.BigIntegerField(
                        default=0,
                        help_text="The week count of the next week occultations",
                        verbose_name="Next week count",
                    ),
                ),
                (
                    "day_count",
                    models.BigIntegerField(
                        default=0,
                        help_text="The day count of the occultations",
                        verbose_name="Day count",
                    ),
                ),
                (
                    "unique_asteroids",
                    models.BigIntegerField(
                        default=0,
                        help_text="The unique asteroids count",
                        verbose_name="Unique asteroids",
                    ),
                ),
                (
                    "occultations_count",
                    models.BigIntegerField(
                        default=0,
                        help_text="The total forecast occultations count",
                        verbose_name="Occultations count",
                    ),
                ),
                (
                    "earliest_occultation",
                    models.DateTimeField(
                        blank=True,
                        help_text="The earliest forecast occultation",
                        null=True,
                        verbose_name="Earliest occultation",
                    ),
                ),
                (
                    "latest_occultation",
                    models.DateTimeField(
                        blank=True,
                        help_text="The latest forecast occultation",
                        null=True,
                        verbose_name="Latest occultation",
                    ),
                ),
                ("created_at", models.DateTimeField(auto_now_add=True)),
            ],
        ),
    ]