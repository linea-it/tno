from django.contrib import admin

from .models import Run, Configuration

@admin.register(Run)
class PraiaRunsAdmin(admin.ModelAdmin):
    list_display = ('id', 'owner', 'configuration', 'start_time', 'finish_time', )

@admin.register(Configuration)
class PraiaConfigAdmin(admin.ModelAdmin):
    list_display = ('id', 'displayname', 'owner', 'creation_date', )

