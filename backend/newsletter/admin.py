from django.contrib import admin

# Register your models here.
from newsletter.models import Subscription


@admin.register(Subscription)
class SubscriptionAdmin(admin.ModelAdmin):
    list_display = (
        "id",
        "email",
        "activation_code",
        "subscribe_date",
        "unsubscribe_date",
        "unsubscribe",
    )
