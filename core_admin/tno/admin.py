from django.contrib import admin

from .models import Pointing, SkybotOutput, CcdImage, CustomList, Proccess, Catalog, JohnstonArchive, SkybotRun
@admin.register(Pointing)
class PointingAdmin(admin.ModelAdmin):
    list_display = ('id', 'date_obs', 'expnum', 'ccdnum', 'band', 'filename',)
    search_fields = ('expnum', 'ccdnum', 'filename',)


@admin.register(SkybotOutput)
class SkybotOutputAdmin(admin.ModelAdmin):
    list_display = ('id', 'pointing', 'name', 'dynclass', 'raj2000',
        'decj2000', 'expnum', 'ccdnum', 'band',)
    search_fields = ('name', 'dynclass', 'expnum')

    # Retira do Formulario a campo de chave estrangeira "pointing"
    # que tem milhares de registros e causa tavamento da interface
    # exclude = ('pointing',)

    # Troca o tipo de imput de Select para um text field com botao de busca
    raw_id_fields = ('pointing',)

@admin.register(CcdImage)
class CcdImageAdmin(admin.ModelAdmin):
    list_display = ('id', 'desfile_id', 'filename', 'download_start_time',
        'download_finish_time', 'file_size',)
    search_fields = ('desfile_id', 'filename',)

    # Troca o tipo de imput de Select para um text field com botao de busca
    raw_id_fields = ('pointing',)


@admin.register(CustomList)
class CustomListAdmin(admin.ModelAdmin):
    list_display = ('id', 'status', 'displayname', 'schema', 'tablename', 'owner', 'rows',
        'n_columns', 'size', 'creation_date', 'creation_time', )
    search_fields = ('displayname', 'tablename', 'description')


@admin.register(Proccess)
class ProccessAdmin(admin.ModelAdmin):
    list_display = ('id', 'owner', 'start_time', 'finish_time', 'status', 'relative_path')

@admin.register(Catalog)
class CatalogAdmin(admin.ModelAdmin):
    list_display = ('id', 'display_name', 'database', 'schema', 'tablename', 'rows', 'columns', 'size')

@admin.register(JohnstonArchive)
class JohnstonArchiveAdmin(admin.ModelAdmin):
    list_display = ('id', 'number', 'name', 'provisional_designation', 'dynamical_class', 'diameter', 'density', 'updated')

@admin.register(SkybotRun)
class SkybotRunAdmin(admin.ModelAdmin):
    list_display = ('id', 'owner', 'start', 'finish', 'status', 'exposure', 'dateInitial', 'dateFinal','ra_cent', 'dec_cent', 'typeRun')

