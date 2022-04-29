import csv
import fnmatch
import logging
import os
import urllib
from concurrent import futures
from datetime import datetime, timedelta

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

from rest_framework.permissions import IsAuthenticated

from rest_framework.response import Response

from tno.models import Asteroid, Occultation, JohnstonArchive
from tno.serializers import (AsteroidSerializer, OccultationSerializer, JohnstonArchiveSerializer,
                             UserSerializer)

from .johnstons import JhonstonArchive


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


class AsteroidViewSet(viewsets.ReadOnlyModelViewSet):

    queryset = Asteroid.objects.all()
    serializer_class = AsteroidSerializer

    filter_fields = ('number', 'name')

    # TODO: Interessante que essa função ficasse disponivel para uso apos o skybot ou que fosse executada automaticamente.
    @list_route(permission_classes=(IsAuthenticated, ))
    def update_asteroid_table(self, request):
        """Esta função é utilizada para povoar a tabela Asteroid. 
        Faz uma query nas tabelas de resultados do skybot, e efetua um insert/update 
        na tabela asteroid, inserindo informações de Nome, numero, classe

        Args:
            request ([type]): [description]

        Returns:
            [type]: [description]
        """
        import logging

        from tno.dao.asteroids import AsteroidDao
        log = logging.getLogger('asteroids')

        log.info("-----------------------------")
        log.info("Test Asteroid DAO")

        count = AsteroidDao().count()

        log.info("Count Asteroids: %s" % count)

        # from skybot.dao.skybot_positions import SkybotPositionsDao

        # asteroids = SkybotPositionsDao().distinct_asteroids()

        # log.info("Asteroids: %s" % asteroids[0:3])

        a = AsteroidDao().insert_update()
        log.info(a)

        result = dict({
            'success': True,
        })

        return Response(result)


class OccultationViewSet(viewsets.ReadOnlyModelViewSet):

    authentication_classes = [
        SessionAuthentication, BasicAuthentication, TokenAuthentication]
    permission_classes = [IsAuthenticated]

    queryset = Occultation.objects.all()
    serializer_class = OccultationSerializer

    filter_fields = ('id', 'name', 'number', 'date_time')
    search_fields = ('name', 'number')

    ordering_fields = ('id', 'name', 'number', 'date_time')
    ordering = ('date_time',)

    # @list_route(permission_classes=(IsAuthenticated, ))
    # def test(self, request):

    #     import logging

    #     from tno.dao.asteroids import AsteroidDao
    #     log = logging.getLogger('asteroids')

    #     log.info("-----------------------------")
    #     log.info("Test Asteroid DAO")

    #     count = AsteroidDao().count()

    #     log.info("Count Asteroids: %s" % count)

    #     # from skybot.dao.skybot_positions import SkybotPositionsDao

    #     # asteroids = SkybotPositionsDao().distinct_asteroids()

    #     # log.info("Asteroids: %s" % asteroids[0:3])

    #     a = AsteroidDao().insert_update()
    #     log.info(a)

    #     result = dict({
    #         'success': True,
    #     })

    #     return Response(result)


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
