from django.contrib import admin

from .models import Position


@admin.register(Position)
class PositionAdmin(admin.ModelAdmin):
    list_display = (
        "id",
        "name",
        "dynclass",
        "raj2000",
        "decj2000",
        "ticket",
        "skybot_job"
    )
    search_fields = ("name",)
