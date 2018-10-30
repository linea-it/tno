from django.contrib import admin
from .models import PredictRun, PredictAsteroid, PredictInput, PredictOutput, LeapSecond, BspPlanetary


# Register your models here.
@admin.register(PredictRun)
class PredictRunAdmin(admin.ModelAdmin):
    list_display = ('id', 'owner', 'process', 'status', 'input_list', 'input_orbit', 'start_time', 'finish_time',)


@admin.register(PredictAsteroid)
class PredictAsteroidAdmin(admin.ModelAdmin):
    list_display = ('id', 'predict_run', 'name', 'number', 'execution_time', 'status', 'error_msg',)
    search_fields = ('name', 'number')

@admin.register(PredictInput)
class PredictInputAdmin(admin.ModelAdmin):
    list_display = ('id', 'asteroid', 'input_type', 'filename', 'file_size', 'file_type', 'file_path',)
    search_fields = ('asteroid', 'input_type', 'filename')

@admin.register(PredictOutput)
class PredictOutputAdmin(admin.ModelAdmin):
    list_display = ('id', 'asteroid', 'type', 'filename', 'file_size', 'file_type', 'file_path',)
    search_fields = ('asteroid', 'type', 'filename')

@admin.register(LeapSecond)
class LeapSecondAdmin(admin.ModelAdmin):
    list_display = ('name', 'display_name', 'url', 'upload',)
    search_fields = ('name', 'display_name')

@admin.register(BspPlanetary)
class BspPlanetaryAdmin(admin.ModelAdmin):
    list_display = ('name', 'display_name', 'url', 'upload',)
    search_fields = ('name', 'display_name')