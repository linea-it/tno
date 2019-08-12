from django.contrib import admin

from .models import (AstrometryAsteroid, AstrometryInput, AstrometryJob,
                     AstrometryOutput, Configuration, Run)


@admin.register(Run)
class PraiaRunsAdmin(admin.ModelAdmin):
    list_display = ('id', 'status', 'owner', 'proccess', 'catalog', 'configuration',
                    'start_time', 'finish_time', 'count_objects', 'count_success', 'count_failed', 'count_warning', 'count_not_executed', 'step')


@admin.register(Configuration)
class PraiaConfigAdmin(admin.ModelAdmin):
    list_display = ('id', 'displayname', 'owner', 'creation_date', )


@admin.register(AstrometryAsteroid)
class AstrometryAsteroidAdmin(admin.ModelAdmin):
    list_display = ('id', 'astrometry_run', 'name', 'number', 'status',
                    'ccd_images', 'catalog_rows', 'execution_time', 'error_msg',)
    search_fields = ('name',)


@admin.register(AstrometryInput)
class AstrometryInputAdmin(admin.ModelAdmin):
    list_display = ('id', 'asteroid', 'input_type', 'filename',
                    'file_size', 'file_type', 'file_path', 'execution_time', 'error_msg',)


@admin.register(AstrometryOutput)
class AstrometryOutputAdmin(admin.ModelAdmin):
    list_display = ('id', 'asteroid', 'type', 'catalog', 'ccd_image', 'filename',
                    'file_size', 'file_type', 'file_path',)


@admin.register(AstrometryJob)
class AstrometryJobs(admin.ModelAdmin):
    list_display = ('id', 'astrometry_run', 'asteroid', 'job_status', 'clusterid',
                    'procid', 'submit_time', 'start_time', 'finish_time', 'execution_time')
