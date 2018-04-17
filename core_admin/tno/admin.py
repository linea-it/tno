from django.contrib import admin

from .models import Pointing

@admin.register(Pointing)
class PointingAdmin(admin.ModelAdmin):
    list_display = ('id', 'date_obs', 'expnum', 'ccdnum', 'band', 'filename',)
    search_fields = ('expnum', 'ccdnum', 'filename',)