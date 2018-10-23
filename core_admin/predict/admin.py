from django.contrib import admin
from .models import PredictRun, PredictAsteroid, LeapSecond, BspPlanetary


# Register your models here.
@admin.register(PredictRun)
class PredictRunAdmin(admin.ModelAdmin):
    list_display = ('id', 'owner', 'process', 'status', 'input_list', 'input_orbit', 'start_time', 'finish_time',)


@admin.register(PredictAsteroid)
class PredictAsteroidAdmin(admin.ModelAdmin):
    list_display = ('id', 'predict_run', 'name', 'number',
                    'start_time', 'finish_time', 'execution_time', 'status', 'error_msg',)
    search_fields = ('name', 'number')

@admin.register(LeapSecond)
class LeapSecondAdmin(admin.ModelAdmin):
    list_display = ('name', 'display_name', 'url', 'upload',)
    search_fields = ('name', 'display_name')

@admin.register(BspPlanetary)
class BspPlanetaryAdmin(admin.ModelAdmin):
    list_display = ('name', 'display_name', 'url', 'upload',)
    search_fields = ('name', 'display_name')