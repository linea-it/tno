import time
import urllib.parse
from datetime import datetime, timezone
from operator import attrgetter
from pathlib import Path

import django_filters
from django.conf import settings
from rest_framework import viewsets
from rest_framework.authentication import (BasicAuthentication,
                                           SessionAuthentication,
                                           TokenAuthentication)
from rest_framework.decorators import action
from rest_framework.pagination import PageNumberPagination
from rest_framework.permissions import AllowAny, IsAuthenticated
from rest_framework.response import Response
from sqlalchemy.sql import text

from tno.db import CatalogDB, DBBase
from tno.models import Occultation
from tno.occviz import visibility
from tno.serializers import OccultationSerializer
from tno.sora_map import sora_occultation_map
from tno.tasks import create_occ_map_task


class CharInFilter(django_filters.BaseInFilter, django_filters.CharFilter):
    pass


class OccultationFilter(django_filters.FilterSet):
    start_date = django_filters.DateTimeFilter(
        field_name='date_time', lookup_expr='gte')
    end_date = django_filters.DateTimeFilter(
        field_name='date_time', lookup_expr='lte')
    min_mag = django_filters.NumberFilter(field_name='g', lookup_expr='gte')
    max_mag = django_filters.NumberFilter(field_name='g', lookup_expr='lte')
    dynclass = django_filters.CharFilter(
        field_name='asteroid__dynclass', lookup_expr='iexact')
    base_dynclass = django_filters.CharFilter(
        field_name='asteroid__base_dynclass', lookup_expr='iexact')
    name = CharInFilter(field_name='asteroid__name', lookup_expr='in')
    asteroid_id = django_filters.NumberFilter(
        field_name='asteroid__id', lookup_expr='exact')

    class Meta:
        model = Occultation
        fields = ['start_date', 'end_date', 'min_mag', 'max_mag',
                  'dynclass', 'base_dynclass', 'name', 'asteroid_id']


class OccultationViewSet(viewsets.ReadOnlyModelViewSet):

    authentication_classes = [
        SessionAuthentication,
        BasicAuthentication,
        TokenAuthentication,
    ]
    permission_classes = [AllowAny]

    queryset = Occultation.objects.all()

    serializer_class = OccultationSerializer

    filterset_class = OccultationFilter
    filter_fields = ("id", "name", "number", "date_time")
    search_fields = ("name", "number")

    ordering_fields = ("id", "name", "number", "date_time", "ra_star_candidate", "dec_star_candidate", "ra_target", " dec_target", "closest_approach", "position_angle", "velocity", "delta", "g", "j", "h",
                       "k", "long", "loc_t", "off_ra", "off_dec", "proper_motion", "ct", "multiplicity_flag", "e_ra", "e_dec", "pmra", "pmdec", "ra_star_deg", "dec_star_deg", "ra_target_deg", "dec_target_deg", "created_at")
    ordering = ("date_time",)

    @action(detail=True, methods=["get"], permission_classes=(AllowAny,))
    def get_or_create_map(self, request, pk):
        obj = self.get_object()

        filepath = obj.get_map_filepath()

        force = bool(request.query_params.get('force', False))
        if force == True and filepath.exists():
            filepath.unlink()

        if not filepath.exists():
            # TODO: Generate map with celery
            sora_occultation_map(
                name=obj.name,
                diameter=obj.diameter,
                ra_star_candidate=obj.ra_star_candidate,
                dec_star_candidate=obj.dec_star_candidate,
                date_time=obj.date_time,
                closest_approach=obj.closest_approach,
                position_angle=obj.position_angle,
                velocity=obj.velocity,
                delta=obj.delta,
                g=obj.g,
                long=obj.long,
                filepath=filepath,
                dpi=50
            )

        if filepath.exists():
            return Response({
                "url": request.build_absolute_uri(obj.get_map_relative_url()),
                "occultation": obj.id,
                "name": obj.name,
                "date_time": obj.date_time.isoformat(),
                "filename": filepath.name,
                "filezise": filepath.stat().st_size,
                "creation_time": datetime.fromtimestamp(
                    filepath.stat().st_ctime).astimezone(timezone.utc).isoformat()
            })
        else:
            # TODO: Retornar mensagem de erro
            pass

    @action(detail=False, methods=["get"], permission_classes=(AllowAny,))
    def next_twenty(self, request):
        """
        #     Este endpoint obtem as próximas 20 occultações .

        #     Returns:
        #         result (json): Ocultation list.
        #     """
        paginator = PageNumberPagination()
        paginator.page_size = 10
        lista = Occultation.objects.filter(
            date_time__gte=datetime.now()).order_by('date_time')[:20]
        ordered = sorted(lista, key=attrgetter(request.query_params.get('ordering', '').replace(
            '-', '')), reverse='-' in request.query_params.get('ordering', ''))
        result_page = paginator.paginate_queryset(ordered, request)
        serializer = OccultationSerializer(result_page, many=True)
        return paginator.get_paginated_response(serializer.data)

    @action(detail=False, methods=["get"], permission_classes=(AllowAny,))
    def filter_location(self, request):
        queryset = Occultation.objects.all()
        # date filter
        start_date = self.request.query_params.get('start_date', None)
        end_date = self.request.query_params.get('end_date', None)
        if start_date and end_date:
            queryset = queryset.filter(date_time__range=[start_date, end_date])
        elif start_date:
            queryset = queryset.filter(date_time__gte=start_date)
        elif end_date:
            queryset = queryset.filter(date_time__lte=end_date)
        # magnitude filter
        min_mag = self.request.query_params.get('min_mag', None)
        max_mag = self.request.query_params.get('max_mag', None)
        if min_mag and max_mag:
            queryset = queryset.filter(g__range=[min_mag, max_mag])
        # asteroid filter  (filter_type, filter_value)
        if (self.request.query_params.get('filter_type', None) == "name"):
            values = self.request.query_params.get('filter_value', None)
            names = values.split(';')
            queryset = queryset.filter(asteroid__name__in=names)
        elif (self.request.query_params.get('filter_type', None) == "dynclass"):
            dynclass = self.request.query_params.get('filter_value', None)
            queryset = queryset.filter(asteroid__dynclass=dynclass)
        elif (self.request.query_params.get('filter_type', None) == "base_dynclass"):
            basedyn = self.request.query_params.get('filter_value', None)
            queryset = queryset.filter(asteroid__base_dynclass=basedyn)
        # geografic filter
        latitude = self.request.query_params.get('lat', None)
        longitude = self.request.query_params.get('long', None)
        radius = self.request.query_params.get('radius', None)
        if latitude and longitude and radius:
            tempo_inicio = time.time()
            limite_tempo = 3 * 60
            visibles = []
            for item in queryset:
                tempo_atual = time.time()
                tempo_decorrido = tempo_atual - tempo_inicio
                if tempo_decorrido >= limite_tempo:
                    break
                star_cordinates = item.ra_star_candidate + " " + item.dec_star_candidate
                status, info = visibility(float(latitude), float(longitude), float(radius), item.date_time, star_cordinates,
                                          item.closest_approach, item.position_angle, item.velocity, item.delta, offset=(item.off_ra, item.off_dec))
                if (status):
                    visibles.append(item.id)
            queryset = queryset.filter(id__in=visibles)
        # order
        ordering = self.request.query_params.get('ordering', None)
        if ordering:
            queryset = queryset.order_by(ordering)
        # return
        paginator = PageNumberPagination()
        paginator.page_size = 10
        result_page = paginator.paginate_queryset(queryset, request)
        serializer = OccultationSerializer(result_page, many=True)
        return paginator.get_paginated_response(serializer.data)

    @action(detail=True, methods=["get"], permission_classes=(AllowAny,))
    def get_star_by_event(self, request, pk=None):
        pre_occ = self.get_object()
        ra = pre_occ.ra_star_deg
        dec = pre_occ.dec_star_deg

        # TODO: No futuro vai ser necessário identificar qual o catalogo de estrela foi utilizado
        # nas predição, no momento todas as predições estão utilizando o gaia.DR2
        db = CatalogDB(pool=False)
        rows = db.radial_query(
            tablename="dr2",
            schema="gaia",
            ra_property="ra",
            dec_property="dec",
            ra=float(ra),
            dec=float(dec),
            radius=0.001)

        if len(rows) > 0:
            return Response(rows[0])
        return Response({})
