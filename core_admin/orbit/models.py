from django.db import models

# Create your models here.
# class Observation(models.Model):
#     """
#         Este modelo representa a lista de arquivos de Observacoes baixados do MPC ou AstDys,
#         guarda o path, tamanho e datas do arquivos.
#         Este modelo esta ligado ao SkybotOutput, pelo atributo name.
#         Um Skybot Object name so pode ter um arquivo de observacoes.
#         OBS: Nao pode ser uma ForeignKey por que name na skybot nao e unico.
#         Os dados sao extraidos deste servico: https://minorplanetcenter.net/db_search/show_object?object_id=2006+BF208
#     """
#
#     name = models.CharField(
#         verbose_name='Name',
#         max_length=32,
#         unique=True,
#         null=False, blank=False,
#         help_text='(ucd=“meta.id;meta.main”) Object name (official or provisional designation).')
#
#     source = models.CharField(
#         verbose_name='Source',
#         max_length=6,
#         null=False, blank=False,
#         choices=(('MPC', 'MPC'), ('AstDys', 'AstDys'),)
#     )
#
#     observations = models.PositiveIntegerField(
#         verbose_name='Observations',
#         null=True, blank=True,
#         help_text='Number of Observations for this object or number of lines in the file.'
#     )
#
#     filename = models.CharField(
#         max_length=256,
#         null=True, blank=True,
#         verbose_name='Filename', help_text='Name of FITS file with a CCD image.'
#     )
#
#     download_start_time = models.DateTimeField(
#         verbose_name='Download Start',
#         auto_now_add=True, null=True, blank=True)
#
#     download_finish_time = models.DateTimeField(
#         verbose_name='Download finish',
#         auto_now_add=False, null=True, blank=True)
#
#     file_size = models.PositiveIntegerField(
#         verbose_name='File Size',
#         null=True, blank=True, default=None, help_text='File Size in bytes')
#
#     external_url = models.URLField(
#         verbose_name='External URL',
#         null=True, blank=True,
#         help_text='File Url in the original service.'
#     )
#
#
# class OrbitalParameter(models.Model):
#     """
#         Este modelo representa a lista de arquivos de Parametros Orbitais baixados do MPC ou AstDys,
#         guarda o path, tamanho e datas do arquivos.
#         Este modelo esta ligado ao SkybotOutput, pelo atributo name.
#         Um Skybot Object name so pode ter um arquivo de Parametros Orbitais.
#         OBS: Nao pode ser uma ForeignKey por que name na skybot nao e unico.
#         Os dados sao extraidos deste servico: https://minorplanetcenter.net/db_search/show_object?object_id=2006+BF208
#     """
#
#     name = models.CharField(
#         verbose_name='Name',
#         max_length=32,
#         unique=True,
#         null=False, blank=False,
#         help_text='(ucd=“meta.id;meta.main”) Object name (official or provisional designation).')
#
#     source = models.CharField(
#         verbose_name='Source',
#         max_length=6,
#         null=False, blank=False,
#         choices=(('MPC', 'MPC'), ('AstDys', 'AstDys'),)
#     )
#
#     filename = models.CharField(
#         max_length=256,
#         null=True, blank=True,
#         verbose_name='Filename', help_text='Name of FITS file with a CCD image.'
#     )
#
#     download_start_time = models.DateTimeField(
#         verbose_name='Download Start',
#         auto_now_add=True, null=True, blank=True)
#
#     download_finish_time = models.DateTimeField(
#         verbose_name='Download finish',
#         auto_now_add=False, null=True, blank=True)
#
#     file_size = models.PositiveIntegerField(
#         verbose_name='File Size',
#         null=True, blank=True, default=None, help_text='File Size in bytes')
#
#     external_url = models.URLField(
#         verbose_name='External URL',
#         null=True, blank=True,
#         help_text='File Url in the original service.'
#     )