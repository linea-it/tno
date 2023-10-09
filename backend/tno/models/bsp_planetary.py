from django.db import models


class BspPlanetary(models.Model):
    class Meta:
        verbose_name = "Planetary Ephemeris"
        verbose_name_plural = "Planetary Ephemeris"

    name = models.CharField(
        max_length=100,
        verbose_name="Name",
        help_text="Internal name",
        null=True,
        blank=True,
    )

    display_name = models.CharField(
        max_length=100,
        verbose_name="Display name",
        help_text="Display Name.",
        null=True,
        blank=True,
    )

    url = models.URLField(
        max_length=100,
        verbose_name="URL",
        help_text="URL of archives.",
        null=True,
        blank=True,
    )

    def __str__(self):
        return str(self.name)
