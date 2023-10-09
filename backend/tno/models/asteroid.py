
from django.db import models


class Asteroid(models.Model):

    name = models.CharField(
        max_length=32,
        verbose_name="Name",
        unique=True,
        db_index=True,
        help_text="(ucd=“meta.id;meta.main”) Object name (official or provisional designation).",
    )

    number = models.CharField(
        max_length=35,
        default=None,
        null=True,
        blank=True,
        verbose_name="Number",
        help_text="(ucd=“meta.id;meta.number”) Object number (not all objects have numbers assigned).",
    )

    base_dynclass = models.CharField(
        max_length=24,
        verbose_name="Base Object classification",
        help_text="(ucd=“meta.code.class”) Base Object class (TNO, Centaur, Trojan, etc.).",
        db_index=True,
    )

    dynclass = models.CharField(
        max_length=24,
        verbose_name="Object classification",
        db_index=True,
        help_text="(ucd=“meta.code.class;src.class”) Object class (TNO, Centaur, Trojan, etc.).",
    )

    def __str__(self):
        if self.number:
            return "%s (%s)" % (self.name, self.number)
        else:
            return self.name

    def get_alias(self):
        alias = self.name.replace(" ", "").replace("_", "").replace("/", "")
        return alias
