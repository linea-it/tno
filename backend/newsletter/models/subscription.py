import uuid

from django.conf import settings
from django.db import models


class Subscription(models.Model):

    # email = models.EmailField(
    #     verbose_name="Email",
    #     unique=True,
    #     db_index=True,
    # )

    # Usuario que solicitou a subscricao.
    user = models.OneToOneField(
        settings.AUTH_USER_MODEL,
        on_delete=models.CASCADE,
        verbose_name="User",
        related_name="subscription",
        null=True,
        default=None,
    )

    activation_code = models.CharField(
        verbose_name="Activation Code",
        max_length=40,
        default=uuid.uuid4,
        editable=False,
        db_index=True,
        help_text="Codigo utilizado para identificar o usuario ao inves de usar email.",
    )

    subscribe_date = models.DateTimeField(
        verbose_name="Subscribe Date", auto_now_add=True
    )

    unsubscribe_date = models.DateTimeField(
        verbose_name="Unsubscribe Date", null=True, blank=True, default=None
    )

    unsubscribe = models.BooleanField(
        verbose_name="Unsubscribe",
        help_text="Indica que o usuario desativou a sua inscricao.",
        default=False,
    )

    activated_date = models.DateTimeField(
        verbose_name="Activated Date", null=True, blank=True, default=None
    )

    activated = models.BooleanField(
        verbose_name="Activate",
        help_text="Indica que o usuario ativou a sua inscricao.",
        default=False,
    )
