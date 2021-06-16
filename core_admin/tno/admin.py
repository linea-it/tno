from django.contrib import admin

from tno.models import JohnstonArchive
from tno.models import Asteroid
from tno.models import BspPlanetary
from tno.models import LeapSecond


@admin.register(Asteroid)
class AsteroidAdmin(admin.ModelAdmin):
    list_display = ('id', 'name', 'number', 'base_dynclass', 'dynclass',)
    search_fields = ('name', 'number', )


@admin.register(JohnstonArchive)
class JohnstonArchiveAdmin(admin.ModelAdmin):
    list_display = ('id', 'number', 'name', 'provisional_designation',
                    'dynamical_class', 'diameter', 'density', 'updated')


@admin.register(LeapSecond)
class LeapSecondAdmin(admin.ModelAdmin):
    list_display = ('name', 'display_name', 'url', 'upload',)
    search_fields = ('name', 'display_name')


@admin.register(BspPlanetary)
class BspPlanetaryAdmin(admin.ModelAdmin):
    list_display = ('name', 'display_name', 'url', 'upload',)
    search_fields = ('name', 'display_name')
