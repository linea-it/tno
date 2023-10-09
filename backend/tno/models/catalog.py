from django.db import models


class Catalog(models.Model):
    name = models.CharField(max_length=128, verbose_name="Internal Name")
    display_name = models.CharField(
        max_length=128, verbose_name="Display Name")
    database = models.CharField(
        max_length=128,
        verbose_name="Database",
        null=False,
        blank=False,
        help_text="Database identifier",
        default="catalog",
    )
    schema = models.CharField(
        max_length=128, verbose_name="Schema name", null=True, blank=True
    )
    tablename = models.CharField(
        max_length=128, verbose_name="Tablename", help_text="Tablename without schema"
    )

    ra_property = models.CharField(
        max_length=128,
        verbose_name="RA Property",
        help_text="name of the column that represents the RA in degrees",
        default="ra",
    )

    dec_property = models.CharField(
        max_length=128,
        verbose_name="Dec Property",
        help_text="name of the column that represents the Dec in degrees",
        default="dec",
    )

    registration_date = models.DateTimeField(
        verbose_name="Registration Date", auto_now_add=True, null=True, blank=True
    )

    def __str__(self):
        return self.display_name
