import csv
import fnmatch
import logging
import os
import urllib
from concurrent import futures
from datetime import datetime

import humanize
import pandas as pd
from dateutil.parser import parse
from django.conf import settings
from django.contrib.auth.models import User
from django.core.exceptions import ObjectDoesNotExist
from django.db.models import Count, Sum
from django.db.models.functions import TruncMonth
from django.http import HttpResponse
from django.utils import timezone
from rest_framework import mixins, response, viewsets
from rest_framework.authentication import (BasicAuthentication,
                                           SessionAuthentication,
                                           TokenAuthentication)
from rest_framework.decorators import (detail_route, list_route,
                                       permission_classes)
from rest_framework.permissions import (IsAdminUser, IsAuthenticated,
                                        IsAuthenticatedOrReadOnly)
from rest_framework.response import Response

from common.jsonfile import JsonFile
from skybot.plot_ccds_objects import (ccds_objects, get_circle_from_ra_dec,
                                      read_skybot_output)
from tno.db import CatalogDB
from tno.des_ccds import download_des_ccds
from tno.models import Catalog

from .johnstons import JhonstonArchive
from .models import *
from .serializers import *
from .skybotoutput import FilterObjects
from .skybotoutput import Pointing as PointingDB
from .skybotoutput import SkybotOutput as SkybotOutputDB


class UserViewSet(viewsets.ModelViewSet):
    queryset = User.objects.all()
    serializer_class = UserSerializer

    def get_permissions(self):
        """
        Instantiates and returns the list of permissions that this view requires.
        """
        if self.action == 'retrieve':
            permission_classes = [IsAuthenticated]
        else:
            permission_classes = [IsAdminUser]

        return [permission() for permission in permission_classes]

    def retrieve(self, request, pk=None):
        """
            este metodo serve para retornar informacoes do usuario logado e
            so retorna informacao se o id passado por 'i'
        """
        if pk == 'i':
            return response.Response(UserSerializer(request.user,
                                                    context={'request': request}).data)

        return super(UserViewSet, self).retrieve(request, pk)


# class PointingViewSet(viewsets.ModelViewSet):
#     queryset = Pointing.objects.all()
#     serializer_class = PointingSerializer
#     filter_fields = ('id', 'desfile_id', 'expnum', 'band',
#                      'exptime', 'date_obs', 'downloaded')
#     search_fields = ('id', 'filename', 'desfile_id', 'expnum')
#     ordering_fields = ('id', 'expnum', 'date_obs', 'nite', 'expnum', 'ccdnum',
#                        'band', 'filename', 'exposure_time', 'radeg', 'decdeg', 'downloaded')
#     ordering = ('-date_obs', 'expnum', 'ccdnum')

#     @list_route()
#     def histogram_exposure(self, request):

#         queryset = Pointing.objects.annotate(date=TruncMonth('date_obs')).values(
#             'date').annotate(count=Count('id')).values('date', 'count').order_by('date')

#         rows = list()
#         for row in queryset:
#             rows.append(dict({
#                 'date': row['date'].strftime('%Y-%m-%d'),
#                 'count': row['count']
#             }))

#         result = dict({
#             'success': True,
#             'data': rows
#         })

#         return Response(result)

#     def generate_statistics(self):
#         db = PointingDB()

#         pointings = db.count_pointings()
#         downloaded = db.count_downloaded()
#         not_downloaded = db.count_not_downloaded()
#         bands = db.counts_by_bands()
#         last = db.last()
#         first = db.first()
#         exposures = db.count_unique_exposures()
#         exp_range = db.counts_range_exposures()

#         statistics = dict({
#             'success': True,
#             'count_pointings': pointings,
#             'downloaded': downloaded,
#             'not_downloaded': not_downloaded,
#             'band': bands,
#             'last': last.get("date_obs").strftime('%Y/%m/%d'),
#             'first': first.get("date_obs").strftime('%Y/%m/%d'),
#             'exposures': exposures,
#             'updated': 'xxxx-xx-xx',
#             'size': 'xx Gb',
#             'exp_range': exp_range,
#             'histogram_exposure': self.histogram_exposure()

#         })

#         # Escrever o Arquivo de cache com as informações
#         temp_file = os.path.join(
#             settings.MEDIA_TMP_DIR, 'pointings_statistics.json')
#         JsonFile().write(statistics, temp_file)

#         JsonFile().write(statistics, temp_file)

#         return statistics

#     @list_route()
#     def statistics(self, request):
#         refresh = request.query_params.get('refresh', False)

#         statistics = dict()
#         if refresh:
#             statistics = self.generate_statistics()

#         else:
#             temp_file = os.path.join(
#                 settings.MEDIA_TMP_DIR, 'pointings_statistics.json')
#             if (os.path.exists(temp_file)):
#                 statistics = JsonFile().read(temp_file)
#             else:
#                 statistics = self.generate_statistics()

#         return Response(statistics)


# class SkybotOutputViewSet(viewsets.ModelViewSet):
#     queryset = SkybotOutput.objects.select_related().all()
#     serializer_class = SkybotOutputSerializer
#     filter_fields = ('id', 'name', 'expnum', 'dynclass', 'mv', 'ccdnum')
#     search_fields = ('name', 'num', 'dynclass', 'mv')
#     ordering_fields = ('name', 'dynclass', 'num', 'raj2000',
#                        'decj2000', 'expnum', 'ccdnum', 'band', 'mv', 'errpos')
#     ordering = ('expnum', 'ccdnum')

#     @list_route()
#     def objects(self, request):
#         """
#             Especifica para tela de Filter Objects que utiliza a query agrupada por objetos.
#         """
#         # Retrive Params
#         name = request.query_params.get('name')

#         objectTable = request.query_params.get('objectTable')

#         magnitude = None
#         if request.query_params.get('useMagnitude') and float(request.query_params.get('magnitude')) > 0:
#             magnitude = float(request.query_params.get('magnitude'))

#         diffDateNights = None
#         if request.query_params.get('useDifferenceTime') and float(request.query_params.get('diffDateNights')) > 0:
#             diffDateNights = float(request.query_params.get('diffDateNights'))

#         moreFilter = request.query_params.get('moreFilter')

#         page = request.query_params.get('page', 1)

#         pageSize = request.query_params.get('pageSize')

#         if(pageSize):
#             pageSize = int(request.query_params.get(
#                 'pageSize', self.pagination_class.page_size))
#         else:
#             pageSize = None

#         rows, count = FilterObjects().get_objects(
#             name, objectTable, magnitude, diffDateNights,
#             moreFilter, int(page), pageSize)

#         return Response({
#             'success': True,
#             "results": rows,
#             "count": count
#         })

#     @list_route()
#     def objects_count(self, request):
#         """
#             Especifica para tela de Filter Objects que utiliza a query agrupada por objetos.
#         """
#         name = request.query_params.get('name')

#         objectTable = request.query_params.get('objectTable')

#         magnitude = None
#         if request.query_params.get('useMagnitude') and float(request.query_params.get('magnitude')) > 0:
#             magnitude = float(request.query_params.get('magnitude'))

#         diffDateNights = None
#         if request.query_params.get('useDifferenceTime') and float(request.query_params.get('diffDateNights')) > 0:
#             diffDateNights = float(request.query_params.get('diffDateNights'))

#         moreFilter = request.query_params.get('moreFilter')

#         # Total de Objetos unicos que atendem aos filtros da query
#         count_objects = FilterObjects().get_objects_count(
#             name, objectTable, magnitude, diffDateNights,
#             moreFilter
#         )
#         # Total de Observações que atendem aos filtros da query
#         count_observations = FilterObjects().get_observations_count(
#             name, objectTable, magnitude, diffDateNights,
#             moreFilter
#         )

#         return Response({
#             'success': True,
#             "count_objects": count_objects,
#             "count_observations": count_observations
#         })

#     def generate_statistics(self):

#         db = SkybotOutputDB()
#         unique_ccds = db.count_unique_ccds()
#         asteroids = db.count_asteroids()
#         dynclass = db.distinct_dynclass()
#         asteroids_by_dynclass = db.count_asteroids_by_dynclass()
#         asteroids_by_class = db.count_asteroids_by_class()

#         histogram = db.histogram('dhelio', 10)

#         statistics = dict({
#             'success': True,
#             'unique_ccds': unique_ccds,
#             'count_asteroids': asteroids,
#             'dynclass': dynclass,
#             'asteroids_by_dynclass': asteroids_by_dynclass,
#             'asteroids_by_class': asteroids_by_class,
#             'histogram': histogram
#         })

#         # Escrever o Arquivo de cache com as informações
#         temp_file = os.path.join(
#             settings.MEDIA_TMP_DIR, 'skybot_statistics.json')
#         JsonFile().write(statistics, temp_file)

#         JsonFile().write(statistics, temp_file)

#         return statistics

#     @list_route()
#     def statistics(self, request):
#         refresh = request.query_params.get('refresh', False)

#         statistics = dict()
#         if refresh:
#             statistics = self.generate_statistics()

#         else:
#             temp_file = os.path.join(
#                 settings.MEDIA_TMP_DIR, 'skybot_statistics.json')
#             if (os.path.exists(temp_file)):
#                 statistics = JsonFile().read(temp_file)
#             else:
#                 statistics = self.generate_statistics()

#         return Response(statistics)


# class ObjectClassViewSet(viewsets.GenericViewSet,
#                          mixins.ListModelMixin):
#     queryset = SkybotOutput.objects.select_related().order_by(
#         'dynclass').distinct('dynclass')
#     serializer_class = ObjectClassSerializer
#     # Turn off pagination Class
#     pagination_class = None


class CustomListViewSet(viewsets.ModelViewSet):
    queryset = CustomList.objects.all()
    serializer_class = CustomListSerializer
    filter_fields = ('id', 'displayname', 'tablename', 'status')
    search_fields = ('displayname', 'description',)
    ordering_fields = ('id', 'displayname', 'tablename',
                       'status', 'creation_date')
    ordering = ('-creation_date',)

    def perform_create(self, serializer):
        # Adiconar usuario logado
        if not self.request.user.pk:
            raise Exception(
                'It is necessary an active login to perform this operation.')
        serializer.save(owner=self.request.user)

    @list_route()
    def list_objects(self, request):
        """

        """
        # Retrive Params
        tablename = request.query_params.get('tablename')
        page = request.query_params.get('page', 1)
        pageSize = request.query_params.get(
            'pageSize', self.pagination_class.page_size)

        # Retrieve Custom List
        customlist = CustomList.objects.get(
            tablename=tablename, status='success')

        rows, count = FilterObjects().list_objects_by_table(
            customlist.tablename, customlist.schema, page, pageSize)

        return Response({
            'success': True,
            "results": rows,
            "count": count
        })

    @list_route()
    def get_stats(self, request):
        # Retrive Params
        tablename = request.query_params.get('tablename', None)
        id = request.query_params.get('id', None)

        # Retrieve Custom List by tablename
        customlist = None
        if tablename is not None:
            customlist = CustomList.objects.get(
                tablename=tablename, status='success')
        elif id is not None:
            customlist = CustomList.objects.get(pk=id)

        serializer = self.serializer_class(customlist)

        data = serializer.data

        distinct_objects = FilterObjects().count_distinct_objects(
            customlist.tablename, customlist.schema)

        distinct_pointing = FilterObjects().count_distinct_pointing(
            customlist.tablename, customlist.schema)

        not_downloaded = FilterObjects().count_pointing_not_downloaded(
            customlist.tablename, customlist.schema
        )

        missing_pointing = FilterObjects().count_missing_pointing(
            customlist.tablename, customlist.schema)

        size_ccdimages = FilterObjects().count_ccdimage_size(
            customlist.tablename, customlist.schema)

        size_not_downloaded = (
            size_ccdimages / data.get("rows")) * not_downloaded

        data.update({
            'distinct_objects': distinct_objects,
            'distinct_pointing': distinct_pointing,
            'not_downloaded': not_downloaded,
            'missing_pointing': missing_pointing,
            'size_ccdimages': humanize.naturalsize(size_ccdimages),
            'size_not_downloaded': humanize.naturalsize(size_not_downloaded)
        })

        return Response({
            'success': True,
            'data': data,
        })

    def ccds_not_downloaded_by_list(self, record):
        # Verificar todos os ccds que estao disponiveis.
        ccds, count_ccds = FilterObjects().list_pointing_path_by_table(
            record.tablename, record.schema)

        not_download = list()

        for ccd in ccds:
            # Verificar se a imagem esta disponivel no diretorio.
            filepath = os.path.join(
                settings.CCD_IMAGES_DIR, ccd.get("filename"))
            if not os.path.exists(filepath):
                not_download.append(ccd)

        return not_download

    @detail_route(methods=['GET'])
    def check_ccds_not_downloaded(self, request, pk):

        record = self.get_object()

        not_download = self.ccds_not_downloaded_by_list(record)

        return Response({
            'success': True,
            'list_name': record.displayname,
            'count_not_downloaded': len(not_download),
            'ccds': not_download
        })

    @detail_route(methods=['GET'])
    def download_ccds_by_list(self, request, pk):
        """
            Verifica quais ccds relacionados com a lista precisam ser baixados. 
            e executa o download destes ccds.
        """
        record = self.get_object()

        # Todos os CCDs relacioandos com a lista que não foram baixados.
        not_download = self.ccds_not_downloaded_by_list(record)

        # Executa a função de Download em background. 
        with futures.ProcessPoolExecutor(max_workers=1) as ex:
            ex.submit(download_des_ccds, not_download)

        return Response({
            'success': True,
            'list_name': record.displayname,
            'count_not_downloaded': len(not_download),
            'msg': 'These downloads will be executed in the background'
            # 'not_download': not_download,
        })


class ProccessViewSet(viewsets.ModelViewSet):
    queryset = Proccess.objects.all()
    serializer_class = ProccessSerializer
    filter_fields = ('id',)
    search_fields = ('id',)


class CatalogViewSet(viewsets.ModelViewSet):
    queryset = Catalog.objects.all()
    serializer_class = CatalogSerializer
    filter_fields = ('id', 'display_name', 'tablename',)
    search_fields = ('name', 'display_name', 'tablename')
    # authentication_classes = (SessionAuthentication, BasicAuthentication)
    permission_classes = (IsAuthenticatedOrReadOnly,)

    @list_route()
    def radial_query(self, request):

        catalog = None

        mime_type = request.query_params.get('mime_type', 'json')

        try:
            name = request.query_params.get('catalog', None)

            if name:
                catalog = Catalog.objects.get(name=name)

            else:
                schema = request.query_params.get('schema', None)
                tablename = request.query_params.get('tablename', None)

                catalog = Catalog.objects.get(
                    schema=schema, tablename=tablename)
        except ObjectDoesNotExist:
            return Response({
                'success': False,
                'msg': "Catalog not found, use the catalog parameter to enter the catalog name or the schema and "
                       "tablename parameters. "
            })

        ra = request.query_params.get('ra', None)
        dec = request.query_params.get('dec', None)
        radius = request.query_params.get('radius', 0.001)
        limit = request.query_params.get('limit', None)
        s_columns = request.query_params.get('columns', None)
        columns = list()

        if s_columns is not None:
            l = s_columns.split(',')
            for i in l:
                columns.append(i.strip())

        if ra is None or dec is None:
            return Response({
                'success': False,
                'msg': "The ra and dec parameters are mandatory"
            })

        db = CatalogDB(pool=False)

        rows = db.radial_query(
            schema=catalog.schema,
            tablename=catalog.tablename,
            ra_property=catalog.ra_property,
            dec_property=catalog.dec_property,
            ra=ra,
            dec=dec,
            radius=radius,
            columns=columns,
            limit=limit,
        )

        if mime_type == 'csv':
            if len(rows) == 0:
                response = HttpResponse(content_type='text/csv')

            else:
                headers = columns
                if len(headers) == 0:
                    first = rows[0]
                    for prop in first:
                        headers.append(prop.strip())

                response = HttpResponse(content_type='text/csv')
                # response['Content-Disposition'] = 'attachment; filename="somefilename.csv"'
                writer = csv.DictWriter(
                    response, fieldnames=headers, extrasaction='ignore', delimiter=';')
                writer.writeheader()
                for row in rows:
                    writer.writerow(row)
            return response
        else:
            return Response({
                'success': True,
                'results': rows,
                'count': len(rows)
            })


class JohnstonArchiveViewSet(viewsets.ModelViewSet):
    """
        List of Known Trans-Neptunian Objects and other outer solar system objects

        Downloaded from: http://www.johnstonsarchive.net/astro/tnoslist.html

        Table includes TNOs, SDOs, and Centaurs listed by the MPC as of 7 October 2018,
        plus other unusual asteroids with aphelion distances greater than 7.5 AU,
        plus several additional reported objects without MPC designations.

        To search for the object name use the 'search' attribute
        example searches for chariklo object
        /known_tnos_johnston/?search=chariklo

        Any attribute can be used as a filter, just pass the property name as parameter and value.
        example filter all objects with a diameter less than 100
        /known_tnos_johnston/?diameter__lt=100

        For details on how to make filters through the url. (https://github.com/miki725/django-url-filter)

        to update all the contents of the table, just access this url.
        http://localhost:7001/known_tnos_johnston/update_list/

        use the format=json attribute to have the result in json.
        example /known_tnos_johnston/?diameter__lt=100&format=json

    """
    title = "List of Known Trans-Neptunian Objects from Johnston Archive"
    queryset = JohnstonArchive.objects.all()
    serializer_class = JohnstonArchiveSerializer
    filter_fields = ('id',
                     'number',
                     'name',
                     'provisional_designation',
                     'dynamical_class',
                     'a',
                     'e',
                     'perihelion_distance',
                     'aphelion_distance',
                     'i',
                     'diameter',
                     'diameter_flag',
                     'albedo',
                     'b_r_mag',
                     'taxon',
                     'density',
                     'known_components',
                     'discovery',
                     'updated')
    search_fields = ('name', 'number', 'provisional_designation')
    permission_classes = (IsAuthenticatedOrReadOnly,)

    @list_route(permission_classes=(IsAuthenticated, ))
    # @permission_classes((IsAuthenticated, ))
    def update_list(self, request):

        ja = JhonstonArchive()

        try:
            rows = ja.get_table_data()

            count_created = 0
            count_updated = 0

            if len(rows) > 0:

                # Gera o CSV
                filename = ja.write_csv(rows)

                # Update na tabela
                for row in rows:

                    discovery = None
                    if row['discovery']:
                        discovery = datetime.strptime(
                            row['discovery'], '%Y-%m')

                    record, created = JohnstonArchive.objects.update_or_create(
                        provisional_designation=row['provisional_designation'],
                        defaults={
                            'number': row['number'],
                            'name': row['name'],
                            'dynamical_class': row['dynamical_class'],
                            'a': row['a'],
                            'e': row['e'],
                            'perihelion_distance': row['perihelion_distance'],
                            'aphelion_distance': row['aphelion_distance'],
                            'i': row['i'],
                            'diameter': row['diameter'],
                            'diameter_flag': row['diameter_flag'],
                            'albedo': row['albedo'],
                            'b_r_mag': row['b_r_mag'],
                            'taxon': row['taxon'],
                            'density': row['density'],
                            'known_components': row['known_components'],
                            'discovery': discovery,
                            'updated': timezone.now(),
                        },
                    )

                    record.save()

                    if created:
                        count_created += 1
                    else:
                        count_updated += 1

            return Response({
                'success': True,
                'count': len(rows),
                # 'filename': filename,
                'created': count_created,
                'updated': count_updated
            })

        except Exception as e:
            raise e


# class SkybotRunViewSet(viewsets.ModelViewSet):
#     queryset = SkybotRun.objects.all()
#     serializer_class = SkybotRunSerializer
#     filter_fields = ('id',)
#     # search_fields = ('id',)
#     ordering_fields = ('id', 'type_run', 'start', 'exposure', 'rows',)
#     ordering = ('-start',)

#     def perform_create(self, serializer):
#         # Adiconar usuario logado
#         if not self.request.user.pk:
#             raise Exception(
#                 'It is necessary an active login to perform this operation.')
#         serializer.save(
#             owner=self.request.user,
#             start=datetime.now()
#         )

#     def perform_update(self, serializer):
#         instance = serializer.save()
#         if instance.status == 'pending':
#             instance.start = datetime.now()
#             instance.finish = None
#             instance.execution_time = None
#             instance.exposure = None
#             instance.rows = None
#             instance.error = None
#             instance.save()

#         if instance.status == 'cancel':
#             instance.finish = None
#             instance.save()

#     def get_output_path(self, skybotrun):
#         # Diretorio onde ficam os csv baixados do skybot
#         self.base_path = settings.SKYBOT_OUTPUT

#         output_path = os.path.join(self.base_path, str(skybotrun.id))
#         if not os.path.exists(output_path):
#             os.mkdir(output_path)

#         return output_path

#     def read_result_csv(self, skybotrun, page=1, pageSize=None):

#         output_path = self.get_output_path(skybotrun)

#         results_file = os.path.join(output_path, 'results.csv')

#         headers = ['expnum', 'band', 'date_obs', 'skybot_downloaded', 'skybot_url', 'download_start', 'download_finish', 'download_time', 'filename',
#                    'file_size', 'file_path', 'import_start', 'import_finish', 'import_time', 'count_created', 'count_updated', 'count_rows',
#                    'ccd_count', 'ccd_count_rows', 'ccd_start', 'ccd_finish', 'ccd_time', 'error']

#         if page == 1:
#             skiprows = 1
#         else:
#             skiprows = (page * pageSize) - pageSize

#         df = pd.read_csv(
#             results_file,
#             skiprows=skiprows,
#             delimiter=';',
#             names=headers,
#             nrows=pageSize)

#         return df

#     def read_skybotoutput_csv(self, filepath):

#         headers = ["num", "name", "ra", "dec", "dynclass", "mv", "errpos", "d", "dra", "ddec",
#                    "dg", "dh", "phase", "sunelong", "x", "y", "z", "vx", "vy", "vz", "epoch"]

#         df = pd.read_csv(filepath, skiprows=3, delimiter='|', names=headers)

#         rows = list()
#         for record in df.itertuples():
#             row = dict({})
#             for header in headers:
#                 row[header] = getattr(record, header)

#             rows.append(row)
#             # rows.append(dict((y, x) for x, y in row))

#         return rows

#     @list_route()
#     def time_profile(self, request):

#         run_id = request.query_params.get('run_id', None)

#         skybotrun = None
#         try:
#             skybotrun = SkybotRun.objects.get(pk=int(run_id))

#         except ObjectDoesNotExist:
#             return Response({
#                 'success': False,
#                 'msg': "SkybotRun not found. run_id %s" % run_id
#             })

#         output_path = self.get_output_path(skybotrun)

#         time_profile = os.path.join(output_path, 'time_profile.csv')

#         headers = ["expnum", "operation", "start", "finish"]

#         df = pd.read_csv(time_profile, skiprows=1,
#                          delimiter=';', names=headers)

#         rows = list()
#         for row in df.itertuples():
#             rows.append([row[1], row[2], row[3], row[4]])

#         return Response({
#             'success': True,
#             'headers': headers,
#             'data': rows
#         })

#     @list_route()
#     def results(self, request):

#         run_id = int(request.query_params.get('run_id', None))
#         page = int(request.query_params.get('page', 1))
#         pageSize = int(request.query_params.get('pageSize', 100))

#         skybotrun = None
#         try:
#             skybotrun = SkybotRun.objects.get(pk=int(run_id))

#         except ObjectDoesNotExist:
#             return Response({
#                 'success': False,
#                 'msg': "SkybotRun not found. run_id %s" % run_id
#             })

#         df = self.read_result_csv(skybotrun, page, pageSize)

#         rows = list()
#         for row in df.itertuples():

#             d_time = float("{0:.2f}".format(getattr(row, "download_time")))
#             i_time = float("{0:.2f}".format(getattr(row, "import_time")))
#             a_time = float("{0:.2f}".format(getattr(row, "ccd_time")))

#             exec_time = float("{0:.2f}".format(d_time + i_time + a_time))

#             # Define status
#             status = 'failure'
#             if getattr(row, "skybot_downloaded") is True and getattr(row, "count_rows") > 0:
#                 status = 'success'
#             elif getattr(row, "skybot_downloaded") is True and getattr(row, "count_rows") == 0:
#                 status = 'warning'

#             date_obs = getattr(row, "date_obs")

#             rows.append(dict({
#                 'expnum': getattr(row, "expnum"),
#                 'band': getattr(row, "band"),
#                 'date_obs': date_obs.split('.')[0],
#                 'status': status,
#                 'download_time': d_time,
#                 'import_time': i_time,
#                 'ccd_time': a_time,
#                 'created': getattr(row, "count_created"),
#                 'updated': getattr(row, "count_updated"),
#                 'count_rows': getattr(row, "count_rows"),
#                 'ccd_count_rows': getattr(row, "ccd_count_rows"),
#                 'execution_time': exec_time,
#                 # 'error': getattr(row, "error", None),
#             }))

#         return Response({
#             'success': True,
#             'totalCount': skybotrun.exposure,
#             'data': rows
#         })

#     @list_route()
#     def statistic(self, request):

#         run_id = int(request.query_params.get('run_id', None))

#         skybotrun = None
#         try:
#             skybotrun = SkybotRun.objects.get(pk=int(run_id))

#         except ObjectDoesNotExist:
#             return Response({
#                 'success': False,
#                 'msg': "SkybotRun not found. run_id %s" % run_id
#             })

#         df = self.read_result_csv(skybotrun)

#         d_time = df['download_time'].sum()
#         i_time = df['import_time'].sum()
#         a_time = df['ccd_time'].sum()

#         return Response({
#             'success': True,
#             'download_time': d_time,
#             'import_time': i_time,
#             'ccd_time': a_time,
#             'created': df['count_created'].sum(),
#             'updated': df['count_updated'].sum(),
#             'h_download_time': humanize.naturaldelta(d_time),
#             'h_import_time': humanize.naturaldelta(i_time),
#             'rows': df['count_rows'].sum()
#         })

#     @list_route()
#     def skybot_output_by_exposure(self, request):

#         run_id = int(request.query_params.get('run_id', None))
#         expnum = int(request.query_params.get('expnum', None))

#         skybotrun = None
#         try:
#             skybotrun = SkybotRun.objects.get(pk=int(run_id))

#         except ObjectDoesNotExist:
#             return Response({
#                 'success': False,
#                 'msg': "SkybotRun not found. run_id %s" % run_id
#             })

#         if expnum is None:
#             return Response({
#                 'success': False,
#                 'msg': "Expnum is required"
#             })

#         df = self.read_result_csv(skybotrun)

#         # Pega o primeiro resultado da busca
#         first = df[df.expnum == expnum].iloc[0]

#         filename = getattr(first, 'filename')
#         output_path = self.get_output_path(skybotrun)
#         filepath = os.path.join(output_path, filename)

#         rows = self.read_skybotoutput_csv(filepath)

#         return Response({
#             'success': True,
#             'filepath': filepath,
#             'rows': rows
#         })

#     @list_route()
#     def skybot_output_plot(self, request):

#         run_id = int(request.query_params.get('run_id', None))
#         expnum = int(request.query_params.get('expnum', None))
#         image = bool(request.query_params.get('image', False))

#         skybotrun = None
#         try:
#             skybotrun = SkybotRun.objects.get(pk=int(run_id))

#         except ObjectDoesNotExist:
#             return Response({
#                 'success': False,
#                 'msg': "SkybotRun not found. run_id %s" % run_id
#             })

#         if expnum is None:
#             return Response({
#                 'success': False,
#                 'msg': "Expnum is required"
#             })

#         # lista de CCDs da exposicao
#         ccdModels = Pointing.objects.filter(expnum=expnum)
#         serializer = PointingSerializer(ccdModels, many=True)
#         ccds = serializer.data

#         # Exposure center
#         ra = ccds[0]['radeg']
#         dec = ccds[0]['decdeg']

#         # Objetos dentro de ccd.
#         mAsteroids = SkybotOutput.objects.filter(
#             expnum=expnum, ccdnum__isnull=False)

#         # Objetos retornados skybot
#         df = self.read_result_csv(skybotrun)

#         # Pega o primeiro resultado da busca por expnum
#         first = df[df.expnum == expnum].iloc[0]

#         # Recupera o path para o arquivo de saida do skybot
#         filename = getattr(first, 'filename')
#         output_path = self.get_output_path(skybotrun)
#         skybot_output_file = os.path.join(output_path, filename)

#         # O arquivo de plot deve ficar no diretorio tmp, para ficar disponivel para as interfaces.
#         plot_filename = 'ccd_object_%s.png' % expnum
#         plot_file_path = os.path.join(settings.MEDIA_TMP_DIR, plot_filename)
#         plot_src = urllib.parse.urljoin(settings.MEDIA_TMP_URL, plot_filename)

#         if image:
#             plot = ccds_objects(
#                 ra=ra,
#                 dec=dec,
#                 ccds=ccds,
#                 skybot_file=skybot_output_file,
#                 file_path=plot_file_path)

#             return Response({
#                 'success': True,
#                 'expnum': expnum,
#                 'ccds': len(ccds),
#                 'asteroids_ccd': len(mAsteroids),
#                 'skybot_output_file': skybot_output_file,
#                 'plot_file_path': plot_file_path,
#                 'plot_src': plot_src,
#                 'plot_filename': plot_filename,
#             })

#         else:

#             skybotRa, skybotDec = read_skybot_output(skybot_output_file)
#             # circleRa, circleDec = get_circle_from_ra_dec(ra, dec)

#             return Response({
#                 'success': True,
#                 'expnum': expnum,
#                 'ccds': len(ccds),
#                 'ra': ra,
#                 'dec': dec,
#                 'ccds': ccds,
#                 'skybot_output': dict({
#                     'ra': skybotRa,
#                     'dec': skybotDec
#                 }),
#             })

#     @list_route()
#     def asteroids_ccd(self, request):
#         expnum = int(request.query_params.get('expnum', None))

#         if expnum is None:
#             return Response({
#                 'success': False,
#                 'msg': "Expnum is required"
#             })

#         asteroids = SkybotOutput.objects.filter(
#             expnum=expnum, ccdnum__isnull=False).order_by('ccdnum')
#         serializer = SkybotOutputSerializer(asteroids, many=True)
#         rows = serializer.data

#         return Response({
#             'success': True,
#             'rows': rows,
#             'count': len(rows)
#         })

#     @list_route()
#     def execution_time_estimate(self, request):
#         """
#         Returns a time estimation (in seconds) based on Skybot's previous runs.

#         You can have an estimate based on ALL unique exposures, by not passing any parameter:
#         Example: /skybot_run/execution_time_estimate/

#         Or you can have an estimate by a particular period, by passing an initial date (YYYY-MM-DD) and a final date (YYYY-MM-DD):
#         Example: /skybot_run/execution_time_estimate/?initial_date=2010-01-20&final_date=2019-02-13

#         Use the format=json attribute to have the result in JSON:
#         Example: /skybot_run/execution_time_estimate/?format=json
#         """
#         exposures = 0

#         db = PointingDB()

#         initial_date = request.query_params.get('initial_date', None)
#         final_date = request.query_params.get('final_date', None)

#         # If the execution is by period, then convert them into a datetime notation:
#         if initial_date and final_date:
#             initial_date = datetime.strptime(initial_date, "%Y-%m-%d")
#             final_date = datetime.strptime(final_date, "%Y-%m-%d")

#             exposures = db.count_unique_exposures_by_period(
#                 initial_date, final_date)
#         else:
#             exposures = db.count_unique_exposures()

#         # Get the summation of all successful exposures and their respective execution time:
#         exposure_and_time_sum = dict(
#             SkybotRun.objects
#             .filter(status='success')
#             .aggregate(
#                 exposure=Sum('exposure'),
#                 execution_time=Sum('execution_time')
#             )
#         )

#         # A rough average: divide the amount of exposures by their execution time (s):
#         execution_mean = exposure_and_time_sum['exposure'] / \
#             exposure_and_time_sum['execution_time'].seconds

#         # The estimate should, then, be the amount of exposures that I want to submit multiplied by the average:
#         execution_estimate = exposures * execution_mean

#         return Response({
#             'success': True,
#             'exposures': exposures,
#             'time_per_exposure': execution_mean,
#             'estimate': execution_estimate,
#         })

#     @list_route()
#     def exposures_by_period(self, request):
#         """
#         Returns exposures and their respective observation date.

#         You can have ALL unique exposures, by not passing any parameter:
#         Example: /skybot_run/exposures_by_period/

#         Or you can have exposures by a particular period, by passing an initial date (YYYY-MM-DD) and a final date (YYYY-MM-DD):
#         Example: /skybot_run/exposures_by_period/?initial_date=2010-01-20&final_date=2019-02-13

#         Use the format=json attribute to have the result in JSON:
#         Example: /skybot_run/exposures_by_period/?format=json
#         """
#         exposures = 0

#         db = PointingDB()

#         initial_date = request.query_params.get('initial_date', None)
#         final_date = request.query_params.get('final_date', None)

#         # If the execution is by period, then convert them into a datetime notation:
#         if initial_date and final_date:
#             initial_date = datetime.strptime(initial_date, "%Y-%m-%d")
#             final_date = datetime.strptime(final_date, "%Y-%m-%d")

#             exposures = db.unique_exposures_by_period(initial_date, final_date)
#         else:
#             exposures = db.unique_exposures()

#         return Response({
#             'success': True,
#             'rows': exposures,
#         })


# class CcdImageViewSet(viewsets.ModelViewSet):
#     queryset = CcdImage.objects.all()
#     serializer_class = CcdImageSerializer
#     filter_fields = ('id', 'desfile_id', 'filename')
#     search_fields = ('desfile_id', 'filename')

#     @list_route()
#     def import_download_logs(self, request):
#         logger = logging.getLogger('django')
#         default_path = os.path.join(settings.CCD_IMAGES_DIR, 'log')

#         path = request.query_params.get('path', None)

#         if path is None:
#             path = default_path

#         # Recuperar todos os arquivos com extensao .csv
#         listOfFiles = os.listdir(path)
#         pattern = "*.csv"

#         files = list([])

#         for filename in listOfFiles:
#             if fnmatch.fnmatch(filename, pattern):
#                 files.append(filename)

#         logger.info("--------------------------------------------------")
#         logger.info("Importando logs de download CCD")

#         files_not_downloaded = list()

#         # Para cada imagem inserir na tabela CCD_IMAGE
#         for logname in files:
#             logpath = os.path.join(path, logname)

#             ccd_filename = logname.replace('.fz.csv', '')

#             # Double Check, conferir se o arquivo de ccd realmente existe no diretorio.
#             # e se o seu tamanho e maior que 0
#             image_filepath = os.path.join(
#                 settings.CCD_IMAGES_DIR, ccd_filename)
#             if os.path.exists(image_filepath) and os.path.getsize(image_filepath) > 0:

#                 # Ler o log em csv
#                 df = pd.read_csv(logpath, sep=';', header=None, index_col=False, names=[
#                                  'download_start_time', 'download_finish_time', 'file_size'])

#                 download_start_time, download_finish_time, file_size = df.iloc[0]

#                 logger.info("CCD Filename %s" % ccd_filename)
#                 logger.info("Start %s" % download_start_time)
#                 logger.info("Finish %s" % download_finish_time)
#                 logger.info("File Size %s" % file_size)

#                 download_time = parse(download_finish_time) - \
#                     parse(download_start_time)
#                 logger.info("Download Time %s" % download_time)

#                 # Recuperar o Apontamento
#                 try:
#                     pointing = Pointing.objects.get(filename=ccd_filename)
#                     logger.info("Pointing Id: %s" % pointing.id)

#                     record, created = CcdImage.objects.update_or_create(
#                         desfile_id=pointing.desfile_id,
#                         filename=ccd_filename,
#                         defaults={
#                             'pointing': pointing,
#                             'download_start_time': download_start_time,
#                             'download_finish_time': download_finish_time,
#                             'download_time': download_time,
#                             'file_size': file_size,
#                         }
#                     )

#                     record.save()
#                     pointing.downloaded = True
#                     pointing.save()

#                     logger.info("CCD Image [ %s ] Created: [ %s ]" % (
#                         ccd_filename, created))

#                 except Pointing.DoesNotExist:
#                     logger.warning("Nao encontrou: %s" % ccd_filename)
#             else:
#                 # Se o arquivo de imagem nao existir no diretorio coloca na mensagem de retorno
#                 files_not_downloaded.append(ccd_filename)

#         logger.info("--------------------------------------------------")
#         return Response({
#             'success': True,
#             'path': path,
#             'count_logs': len(files),
#             'count_not_downloaded': len(files_not_downloaded),
#             'files_not_downloaded': files_not_downloaded
#         })
