from django.contrib import admin

from .models import Run, Configuration, AstrometryAsteroid, AstrometryInput

@admin.register(Run)
class PraiaRunsAdmin(admin.ModelAdmin):
    list_display = ('id', 'owner', 'proccess', 'configuration', 'start_time', 'finish_time', )

@admin.register(Configuration)
class PraiaConfigAdmin(admin.ModelAdmin):
    list_display = ('id', 'displayname', 'owner', 'creation_date', )


@admin.register(AstrometryAsteroid)
class AstrometryAsteroidAdmin(admin.ModelAdmin):
    list_display = ('astrometry_run', 'name', 'number', 'status', 'error_msg',)
    search_fields = ('name',)

@admin.register(AstrometryInput)
class AstrometryInputAdmin(admin.ModelAdmin):
    list_display = ('asteroid', 'input_type', 'filename', 'file_size', 'file_type', 'file_path',)
#     search_fields = ('asteroid',)

