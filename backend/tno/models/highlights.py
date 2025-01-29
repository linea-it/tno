from django.db import models


class Highlights(models.Model):

    month_count = models.BigIntegerField(
        verbose_name="Month count",
        help_text="The month count of the occultations",
        default=0,
    )
    next_month_count = models.BigIntegerField(
        verbose_name="Next month count",
        help_text="The month count of the next month occultations",
        default=0,
    )
    week_count = models.BigIntegerField(
        verbose_name="Week count",
        help_text="The week count of the occultations",
        default=0,
    )
    next_week_count = models.BigIntegerField(
        verbose_name="Next week count",
        help_text="The week count of the next week occultations",
        default=0,
    )
    day_count = models.BigIntegerField(
        verbose_name="Day count",
        help_text="The day count of the occultations",
        default=0,
    )
    unique_asteroids = models.BigIntegerField(
        verbose_name="Unique asteroids",
        help_text="The unique asteroids count",
        default=0,
    )
    occultations_count = models.BigIntegerField(
        verbose_name="Occultations count",
        help_text="The total forecast occultations count",
        default=0,
    )
    earliest_occultation = models.DateTimeField(
        verbose_name="Earliest occultation",
        help_text="The earliest forecast occultation",
        null=True,
        blank=True,
    )
    latest_occultation = models.DateTimeField(
        verbose_name="Latest occultation",
        help_text="The latest forecast occultation",
        null=True,
        blank=True,
    )

    created_at = models.DateTimeField(auto_now_add=True)
