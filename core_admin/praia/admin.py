from django.contrib import admin

from .models import Run, Configuration, AstrometryAsteroid, AstrometryInput, AstrometryOutput


@admin.register(Run)
class PraiaRunsAdmin(admin.ModelAdmin):
    list_display = ('id', 'owner', 'proccess', 'configuration',
                    'start_time', 'finish_time', )


@admin.register(Configuration)
class PraiaConfigAdmin(admin.ModelAdmin):
    list_display = ('id', 'displayname', 'owner', 'creation_date', )


@admin.register(AstrometryAsteroid)
class AstrometryAsteroidAdmin(admin.ModelAdmin):
    list_display = ('astrometry_run', 'name', 'number',
                    'status', 'ccd_images', 'error_msg',)
    search_fields = ('name',)


@admin.register(AstrometryInput)
class AstrometryInputAdmin(admin.ModelAdmin):
    list_display = ('asteroid', 'input_type', 'filename',
                    'file_size', 'file_type', 'file_path', 'execution_time', 'error_msg',)


@admin.register(AstrometryOutput)
class AstrometryOutputAdmin(admin.ModelAdmin):
    list_display = ('asteroid', 'type', 'filename',
                    'file_size', 'file_type', 'file_path',)
