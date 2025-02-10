from django.db import models


# Esta tabela representa os asteroides que possuem pelo menos um evento de predição
# de ocultação. É utilizada no filtro por asteroid name.
class AsteroidCache(models.Model):
    name = models.CharField(
        max_length=35,
        verbose_name="Name",
        unique=True,
        db_index=True,
        help_text="(ucd=“meta.id;meta.main”) Object name (official or provisional designation).",
    )

    number = models.CharField(
        max_length=35,
        default="",
        verbose_name="Number",
        db_index=True,
        help_text="(ucd=“meta.id;meta.number”) Object number (not all objects have numbers assigned).",
    )

    principal_designation = models.CharField(
        max_length=35,
        verbose_name="Principal Designation",
        help_text="Principal designation assigned by the International Astronomical Union (IAU)",
        db_index=True,
        default=None,
        null=True,
        blank=True,
    )

    alias = models.CharField(
        max_length=35,
        verbose_name="Alias used internally as an internal name, formed by the name without special characters and with the addition of sequential numbers if necessary.",
        help_text="",
        null=True,
        blank=True,
        default=None,
    )

    class Meta:
        verbose_name = "Asteroid Cache"
        verbose_name_plural = "Asteroid Cache"
        indexes = [
            models.Index(
                fields=[
                    "name",
                ]
            ),
            models.Index(
                fields=[
                    "number",
                ]
            ),
            models.Index(
                fields=[
                    "principal_designation",
                ]
            ),
            models.Index(
                fields=[
                    "alias",
                ]
            ),
        ]
