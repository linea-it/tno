from django.contrib import admin

from tno.models import JohnstonArchive
from tno.models import Asteroid


@admin.register(Asteroid)
class AsteroidAdmin(admin.ModelAdmin):
    list_display = ('id', 'name', 'number', 'base_dynclass', 'dynclass',)


@admin.register(JohnstonArchive)
class JohnstonArchiveAdmin(admin.ModelAdmin):
    list_display = ('id', 'number', 'name', 'provisional_designation',
                    'dynamical_class', 'diameter', 'density', 'updated')
