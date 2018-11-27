from django.contrib import admin

from .models import OrbitRun
from .models import ObservationFile
from .models import OrbitalParameterFile
from .models import BspJplFile
from .models import RefinedAsteroid
from .models import RefinedOrbit
from .models import RefinedOrbitInput


@admin.register(OrbitRun)
class OrbitRunsAdmin(admin.ModelAdmin):
    list_display = ('id', 'owner', 'proccess', 'status', 'input_list', 'input_praia', 'start_time', 'finish_time',)


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


@admin.register(RefinedAsteroid)
class RefinedAsteroidAdmin(admin.ModelAdmin):
    list_display = ('id', 'orbit_run', 'name', 'number',
                    'start_time', 'finish_time', 'execution_time', 'status', 'error_msg',)
    search_fields = ('name', 'number')


@admin.register(RefinedOrbit)
class RefinedOrbitAdmin(admin.ModelAdmin):
    list_display = ('id', 'asteroid', 'type', 'filename', 'file_size', 'file_type', 'relative_path',)
    search_fields = ('asteroid__name',)


@admin.register(RefinedOrbitInput)
class RefinedOrbitInputAdmin(admin.ModelAdmin):
    list_display = ('id', 'asteroid', 'input_type', 'source', 'date_time', 'filename', 'relative_path',)
    search_fields = ('asteroid__name',)
