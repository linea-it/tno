from django.contrib import admin

from .models import Pointings

@admin.register(Pointings)
class PointingsAdmin(admin.ModelAdmin):
    list_display = ('id', 'date_obs', 'expnum', 'ccdnum', 'band', 'filename',)
    search_fields = ('expnum', 'ccdnum', 'filename',)