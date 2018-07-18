from django.contrib import admin

from .models import OrbitRun
from .models import ObservationFile
from .models import OrbitalParameterFile
from .models import BspJplFile

@admin.register(OrbitRun)
class OrbitRunsAdmin(admin.ModelAdmin):
    list_display = ('id', 'owner', 'proccess', 'input_list', 'input_praia', 'start_time', 'finish_time', )


@admin.register(ObservationFile)
class ObservationFileAdmin(admin.ModelAdmin):
    list_display = ('id', 'name', 'source', 'observations', 'filename', 'download_start_time',
        'download_finish_time', 'file_size', 'external_url', 'download_url')
    search_fields = ('name', 'filename', 'external_url', 'download_url')

@admin.register(OrbitalParameterFile)
class OrbitalParameterFileAdmin(admin.ModelAdmin):
    list_display = ('id', 'name', 'source', 'filename', 'download_start_time',
        'download_finish_time', 'file_size', 'external_url', 'download_url')
    search_fields = ('name', 'filename', 'external_url', 'download_url')

@admin.register(BspJplFile)
class BspJplFileAdmin(admin.ModelAdmin):
    list_display = ('id', 'name', 'filename', 'download_start_time',
                    'download_finish_time', 'file_size')
    search_fields = ('name', 'filename')