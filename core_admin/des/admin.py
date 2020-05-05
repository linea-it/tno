from django.contrib import admin

from .models import Ccd, Exposure, SkybotPosition


@admin.register(Exposure)
class ExposureAdmin(admin.ModelAdmin):
    list_display = ('id', 'nite', 'date_obs', 'expnum', 'radeg', 'decdeg',
                    'exptime', 'cloud_apass', 'cloud_nomad', 't_eff', 'release',)

    search_fields = ('id',)

    # This will help you to disbale add functionality
    def has_add_permission(self, request):
        return False

    # This will help you to disable delete functionaliyt
    def has_delete_permission(self, request, obj=None):
        return False

    # This will help you to disable the save buttons
    def changeform_view(self, request, object_id=None, form_url='', extra_context=None):
        extra_context = extra_context or {}
        extra_context['show_save_and_continue'] = False
        extra_context['show_save'] = False
        return super(ExposureAdmin, self).changeform_view(request, object_id, extra_context=extra_context)


@admin.register(Ccd)
class CcdAdmin(admin.ModelAdmin):
    list_display = ('id', 'exposure', 'ccdnum', 'ra_cent',
                    'dec_cent', 'filename', 'compression',)

    search_fields = ('id', 'filename',)

    # This will help you to disbale add functionality
    def has_add_permission(self, request):
        return False

    # This will help you to disable delete functionaliyt
    def has_delete_permission(self, request, obj=None):
        return False

    # This will help you to disable the save buttons
    def changeform_view(self, request, object_id=None, form_url='', extra_context=None):
        extra_context = extra_context or {}
        extra_context['show_save_and_continue'] = False
        extra_context['show_save'] = False
        return super(CcdAdmin, self).changeform_view(request, object_id, extra_context=extra_context)

    # Troca o tipo de imput de Select para um text field com botao de busca
    # para os campos de chave estrangeira que tem milhares de registros e causa tavamento da interface
    raw_id_fields = ('exposure',)


@admin.register(SkybotPosition)
class SkybotPositionAdmin(admin.ModelAdmin):
    list_display = ('id', 'position', 'exposure', 'ccd',)

    # Troca o tipo de imput de Select para um text field com botao de busca
    # para os campos de chave estrangeira que tem milhares de registros e causa tavamento da interface
    raw_id_fields = ('position', 'ccd', 'exposure')

    # Busca pelo nome do Asteroid
    search_fields = ('position__name',)

    # This will help you to disbale add functionality
    def has_add_permission(self, request):
        return False

    # This will help you to disable delete functionaliyt
    def has_delete_permission(self, request, obj=None):
        return False

    # This will help you to disable the save buttons
    def changeform_view(self, request, object_id=None, form_url='', extra_context=None):
        extra_context = extra_context or {}
        extra_context['show_save_and_continue'] = False
        extra_context['show_save'] = False
        return super(SkybotPositionAdmin, self).changeform_view(request, object_id, extra_context=extra_context)
