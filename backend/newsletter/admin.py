from django.contrib import admin
from newsletter.models import Subscription

from .models import Attachment, EventFilter, Submission


@admin.register(Subscription)
class SubscriptionAdmin(admin.ModelAdmin):
    list_display = (
        "id",
        "user",
        "activation_code",
        "subscribe_date",
        "unsubscribe_date",
        "unsubscribe",
    )


@admin.register(EventFilter)
class EventFilterAdmin(admin.ModelAdmin):
    list_display = (
        "id",
        "user",
        "filter_name",
        "frequency",
        "magnitude_min",
        "magnitude_max",
        "filter_type",
        "local_solar_time_after",
        "local_solar_time_before",
        "magnitude_drop_min",
        "magnitude_drop_max",
        "event_duration",
        "closest_approach_uncertainty_in_km",
        "diameter_min",
        "diameter_max",
        "latitude",
        "longitude",
        "altitude",
        "location_radius",
    )


@admin.register(Submission)
class SubmissionAdmin(admin.ModelAdmin):
    list_display = (
        "id",
        "subscription_id",
        "eventFilter_id",
        "process_date",
        "events_count",
        "prepared",
        "sending",
        "sent",
        "title",
        "sent_date",
    )


@admin.register(Attachment)
class AttachmentAdmin(admin.ModelAdmin):
    list_display = (
        "id",
        "submission_id",
        "filename",
        "size",
    )
