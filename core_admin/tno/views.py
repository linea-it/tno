from rest_framework import viewsets, response, mixins

import humanize
from django.contrib.auth.models import User
from rest_framework import viewsets, response, mixins
from rest_framework.decorators import list_route
from rest_framework.permissions import IsAuthenticated, IsAdminUser
from rest_framework.response import Response
from django.conf import settings

from .models import *
from .serializers import *
from .skybotoutput import FilterObjects
from .skybotoutput import SkybotOutput as SkybotOutputDB
from .skybotoutput import Pointing as PointingDB
from common.jsonfile import JsonFile
import os
from django.core.exceptions import ObjectDoesNotExist
from tno.db import CatalogDB
from tno.models import Catalog
from rest_framework.authentication import SessionAuthentication, BasicAuthentication, TokenAuthentication
from rest_framework.permissions import IsAuthenticated
from django.http import HttpResponse
import csv
from .johnstons import JhonstonArchive
from django.utils import timezone
from datetime import datetime
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


class PointingViewSet(viewsets.ModelViewSet):
    queryset = Pointing.objects.all()
    serializer_class = PointingSerializer
    filter_fields = ('id', 'desfile_id', 'expnum', 'band',
                     'exptime', 'date_obs', 'downloaded')
    search_fields = ('id', 'filename', 'desfile_id', 'expnum')
    ordering_fields = ('id', 'expnum', 'date_obs', 'nite')
    ordering = ('-date_obs',)

    def generate_statistics(self):
        db = PointingDB()

        pointings = db.count_pointings()
        downloaded = db.count_downloaded()
        not_downloaded = db.count_not_downloaded()
        bands = db.counts_by_bands()
        last = db.last()
        first = db.first()
        exposures = db.count_unique_exposures()
        exp_range = db.counts_range_exposures()

        statistics = dict({
            'success': True,
            'count_pointings': pointings,
            'downloaded': downloaded,
            'not_downloaded': not_downloaded,
            'band': bands,
            'last': last.get("date_obs").strftime('%Y/%m/%d'),
            'first': first.get("date_obs").strftime('%Y/%m/%d'),
            'exposures': exposures,
            'updated': 'xxxx-xx-xx',
            'size': 'xx Gb',
            'exp_range': exp_range
        })

        # Escrever o Arquivo de cache com as informações
        temp_file = os.path.join(
            settings.MEDIA_TMP_DIR, 'pointings_statistics.json')
        JsonFile().write(statistics, temp_file)

        JsonFile().write(statistics, temp_file)

        return statistics

    @list_route()
    def statistics(self, request):
        refresh = request.query_params.get('refresh', False)

        statistics = dict()
        if refresh:
            statistics = self.generate_statistics()

        else:
            temp_file = os.path.join(
                settings.MEDIA_TMP_DIR, 'pointings_statistics.json')
            if (os.path.exists(temp_file)):
                statistics = JsonFile().read(temp_file)
            else:
                statistics = self.generate_statistics()

        return Response(statistics)


class SkybotOutputViewSet(viewsets.ModelViewSet):
    queryset = SkybotOutput.objects.select_related().all()
    serializer_class = SkybotOutputSerializer
    filter_fields = ('id', 'name', 'expnum', 'dynclass', 'mv')
    search_fields = ('name', 'dynclass', 'num')

    @list_route()
    def objects(self, request):
        """

        """
        # Retrive Params

        name = request.query_params.get('name')

        objectTable = request.query_params.get('objectTable')

        magnitude = None
        if request.query_params.get('useMagnitude') and float(request.query_params.get('magnitude')) > 0:
            magnitude = float(request.query_params.get('magnitude'))

        diffDateNights = None
        if request.query_params.get('useDifferenceTime') and float(request.query_params.get('diffDateNights')) > 0:
            diffDateNights = float(request.query_params.get('diffDateNights'))

        moreFilter = request.query_params.get('moreFilter')

        page = request.query_params.get('page', 1)
        pageSize = request.query_params.get(
            'pageSize', self.pagination_class.page_size)

        rows, count = FilterObjects().get_objects(
            name, objectTable, magnitude, diffDateNights,
            moreFilter, int(page), int(pageSize))

        return Response({
            'success': True,
            "results": rows,
            "count": count
        })

    def generate_statistics(self):

        db = SkybotOutputDB()
        unique_ccds = db.count_unique_ccds()
        asteroids = db.count_asteroids()
        dynclass = db.distinct_dynclass()
        asteroids_by_dynaclass = db.count_asteroids_by_dynclass()
        asteroids_by_class = db.count_asteroids_by_class()

        histogram = db.histogram('dhelio', 10)

        statistics = dict({
            'success': True,
            'unique_ccds': unique_ccds,
            'count_asteroids': asteroids,
            'dynclass': dynclass,
            'asteroids_by_dynaclass': asteroids_by_dynaclass,
            'asteroids_by_class': asteroids_by_class,
            'histogram': histogram
        })

        # Escrever o Arquivo de cache com as informações
        temp_file = os.path.join(
            settings.MEDIA_TMP_DIR, 'skybot_statistics.json')
        JsonFile().write(statistics, temp_file)

        JsonFile().write(statistics, temp_file)

        return statistics

    @list_route()
    def statistics(self, request):
        refresh = request.query_params.get('refresh', False)

        statistics = dict()
        if refresh:
            statistics = self.generate_statistics()

        else:
            temp_file = os.path.join(
                settings.MEDIA_TMP_DIR, 'skybot_statistics.json')
            if (os.path.exists(temp_file)):
                statistics = JsonFile().read(temp_file)
            else:
                statistics = self.generate_statistics()

        return Response(statistics)


class ObjectClassViewSet(viewsets.GenericViewSet,
                         mixins.ListModelMixin):
    queryset = SkybotOutput.objects.select_related().order_by(
        'dynclass').distinct('dynclass')
    serializer_class = ObjectClassSerializer
    # Turn off pagination Class
    pagination_class = None


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
            'data': data
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
    # permission_classes = (IsAuthenticated,)

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

        db = CatalogDB()

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

    @list_route()
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
                        discovery = datetime.strptime(row['discovery'], '%Y-%m')

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


