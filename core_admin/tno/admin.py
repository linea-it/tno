from django.contrib import admin

from .models import Pointing, SkybotOutput, CcdImage

@admin.register(Pointing)
class PointingAdmin(admin.ModelAdmin):
    list_display = ('id', 'date_obs', 'expnum', 'ccdnum', 'band', 'filename',)
    search_fields = ('expnum', 'ccdnum', 'filename',)


@admin.register(SkybotOutput)
class SkybotOutputAdmin(admin.ModelAdmin):
    list_display = ('id', 'pointing', 'name', 'dynclass', 'raj2000', 'decj2000', 'expnum', 'ccdnum', 'band',)
    search_fields = ('name', 'dynaclass', 'expnum')

    # Retira do Formulario a campo de chave estrangeira "pointing" 
    # que tem milhares de registros e causa tavamento da interface
    # exclude = ('pointing',)

    # Troca o tipo de imput de Select para um text field com botao de busca
    raw_id_fields = ('pointing',)

@admin.register(CcdImage)
class CcdImageAdmin(admin.ModelAdmin):
    list_display = ('id', 'desfile_id', 'filename', 'download_start_time', 'download_finish_time', 'file_size',)
    search_fields = ('desfile_id', 'filename',)

    # Troca o tipo de imput de Select para um text field com botao de busca
    raw_id_fields = ('pointing',)