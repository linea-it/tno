from django.db import models


# Esta tabela representa as classes dinamicas que possuem pelo menos um evento de predição
# É utilizada no filtro por asteroid basedynclass e dynclass.
class DynclassCache(models.Model):

    skybot_dynbaseclass = models.CharField(
        verbose_name="Object's base dynamical classification as defined by Skybot",
        help_text="(ucd=“meta.code.class”) Object's base dynamical classification as defined by Skybot (KBO, Centaur, Trojan, MB, etc.).",
        max_length=24,
    )

    skybot_dynsubclass = models.CharField(
        verbose_name="Object's dynamical subclass as defined by Skybot",
        help_text="(ucd=“meta.code.class;src.class”) Object's dynamical subclass as defined by Skybot (KBO>Resonant>12:5, MB>Inner, etc.).",
        max_length=24,
        default=None,
        null=True,
        blank=True,
    )

    class Meta:
        verbose_name = "Dynclass Cache"
        verbose_name_plural = "Dynclass Cache"

        constraints = [
            models.UniqueConstraint(
                fields=["skybot_dynbaseclass", "skybot_dynsubclass"],
                name="unique_dynclass",
            ),
        ]

        indexes = [
            models.Index(
                fields=[
                    "skybot_dynbaseclass",
                ]
            ),
            models.Index(
                fields=[
                    "skybot_dynsubclass",
                ]
            ),
        ]
