import queue
import time
from datetime import datetime, timezone
from operator import attrgetter

import django_filters
from dateutil.relativedelta import relativedelta
from django.conf import settings
from rest_framework import viewsets
from rest_framework.authentication import (BasicAuthentication,
                                           SessionAuthentication,
                                           TokenAuthentication)
from rest_framework.decorators import action
from rest_framework.pagination import PageNumberPagination
from rest_framework.permissions import AllowAny, IsAuthenticated
from rest_framework.response import Response

from tno.db import CatalogDB
from tno.models import Occultation
from tno.occviz import visibility, visibility_from_coeff2
from tno.prediction_map import sora_occultation_map, maps_folder_stats
from tno.serializers import OccultationSerializer
from tno.tasks import create_occ_map_task, create_prediction_maps, create_occultation_path_coeff
from django.db.models import Q, F, Value, FloatField
from functools import reduce
import operator
from pathlib import Path
import os

class CharInFilter(django_filters.BaseInFilter, django_filters.CharFilter):
    pass


# class OccultationFilter(django_filters.FilterSet):
#     start_date = django_filters.DateTimeFilter(
#         field_name='date_time', lookup_expr='gte')
#     end_date = django_filters.DateTimeFilter(
#         field_name='date_time', lookup_expr='lte')
#     min_mag = django_filters.NumberFilter(field_name='g', lookup_expr='gte')
#     max_mag = django_filters.NumberFilter(field_name='g', lookup_expr='lte')
#     dynclass = django_filters.CharFilter(
#         field_name='asteroid__dynclass', lookup_expr='iexact')
#     base_dynclass = django_filters.CharFilter(
#         field_name='asteroid__base_dynclass', lookup_expr='iexact')
#     name = CharInFilter(field_name='asteroid__name', lookup_expr='in')
#     asteroid_id = django_filters.NumberFilter(
#         field_name='asteroid__id', lookup_expr='exact')

#     class Meta:
#         model = Occultation
#         fields = ['start_date', 'end_date', 'min_mag', 'max_mag',
#                   'dynclass', 'base_dynclass', 'name', 'asteroid_id']

class OccultationFilter(django_filters.FilterSet):

    date_time = django_filters.DateTimeFromToRangeFilter()

    name = CharInFilter(field_name='name', lookup_expr='in')

    number = CharInFilter(field_name='number', lookup_expr='in')

    mag_g = django_filters.RangeFilter(field_name='g')

    dynclass = django_filters.CharFilter(
        field_name='asteroid__dynclass', lookup_expr='iexact')

    base_dynclass = django_filters.CharFilter(
        field_name='asteroid__base_dynclass', lookup_expr='iexact')

    long = django_filters.NumberFilter(
        method='longitude_filter', label="Longitude")

    def longitude_filter(self, queryset, name, value):
        value = float(value)
        # Query de exemplo usando valor de longitude = 2
        # select count(*) from tno_occultation to2 where 2 between min_longitude  and max_longitude
        # Para fazer o between entre duas colunas diferentes, é preciso
        # Criar uma coluna com o valor fixo usando annotate.
        # E usar o F para dizer ao Django que é uma coluna.
        # A logica aqui é, a longitude é maior ou igual a coluna min_longitude
        # e menor ou igua a coluna max_longitude.
        return queryset.annotate(
            temp_longitude=Value(value, output_field=FloatField())
        ).filter(
            have_path_coeff=True,
            temp_longitude__gte=F('min_longitude'),
            temp_longitude__lte=F('max_longitude'))

    lat = django_filters.NumberFilter(
        method='latitude_filter', label="Latitude")

    lat = django_filters.NumberFilter(
        method='latitude_filter', label="Latitude")

    def latitude_filter(self, queryset, name, value):
        value = float(value)
        # Query de exemplo usando valor de latitude = 2
        # select count(*) from tno_occultation to2 where 2 between min_latitude and max_latitude
        # Para fazer o between entre duas colunas diferentes, é preciso
        # Criar uma coluna com o valor fixo usando annotate.
        # E usar o F para dizer ao Django que é uma coluna.
        # A logica aqui é, a latitude é maior ou igual a coluna min_latitude
        # e menor ou igual a coluna max_latitude
        # TODO: Esperando implementação do campo min_latitude e max_latitude na função de path.
        # return queryset.annotate(
        #     temp_latitude=Value(value, output_field=FloatField())
        # ).filter(
        #     have_path_coeff=True,
        #     temp_latitude__gte=F('min_latitude'),
        #     temp_latitude__lte=F('max_latitude'))
        return queryset

    radius = django_filters.NumberFilter(
        method='radius_filter', label="Radius")

    def latitude_filter(self, queryset, name, value):
        # O filtro por latitude vai ser aplicado na get_queryset
        # Esta declarado aqui só para vicar explicito e visivel na interface DRF
        return queryset

    def radius_filter(self, queryset, name, value):
        # O filtro por latitude vai ser aplicado na get_queryset
        # Esta declarado aqui só para vicar explicito e visivel na interface DRF
        return queryset

    class Meta:
        model = Occultation
        fields = [
            "date_time",
            "mag_g", "dynclass",
            "base_dynclass",
            "name",
            "number",
            "long"
        ]


class OccultationViewSet(viewsets.ReadOnlyModelViewSet):

    authentication_classes = [
        SessionAuthentication,
        BasicAuthentication,
        TokenAuthentication,
    ]
    permission_classes = [AllowAny]

    serializer_class = OccultationSerializer

    filterset_class = OccultationFilter
    search_fields = ("name", "number")

    ordering_fields = ("id", "name", "number", "date_time", "ra_star_candidate", "dec_star_candidate", "ra_target", " dec_target", "closest_approach", "position_angle", "velocity", "delta", "g", "j", "h",
                       "k", "long", "loc_t", "off_ra", "off_dec", "proper_motion", "ct", "multiplicity_flag", "e_ra", "e_dec", "pmra", "pmdec", "ra_star_deg", "dec_star_deg", "ra_target_deg", "dec_target_deg", "created_at")
    ordering = ("date_time",)

    def check_user_location_params(self, params):
        lat = params.get('lat', None)
        long = params.get('long', None)
        radius = params.get('radius', None)

        if None in [lat, long, radius]:
            return lat, long, radius

        lat = float(lat)
        if lat < -90 or lat > 90:
            raise Exception("the lat parameter must be between -90 and 90")

        long = float(long)
        # TODO: Tratar os intervalos da longitude

        radius = float(radius)
        if radius < 10 or radius > 5000:
            raise Exception("the radius parameter must be between 10 and 5000")

        return lat, long, radius

    def get_queryset(self):
        queryset = Occultation.objects.all()
        # Usando Filter_Queryset e aplicado os filtros listados no filterbackend
        queryset = self.filter_queryset(queryset)
        # print(queryset.query)

        # Recupera os parametros da requisição
        params = self.request.query_params
        lat, long, radius = self.check_user_location_params(params)

        # TODO: Necessário implementar forma de fazer a paginação.
        # TODO: Implementar memcache para eventos já processados
        # TODO: Estudar a possibilidade de um metodo asyncrono
        if None not in [lat, long, radius]:
            # print("Todos os parametros de user location OK")
            # print(f"Latitude: {lat} Longitude: {long} Radius: {radius}")

            wanted_ids = []
            count = 0
            # TODO Executar a função de visibilidade
            for event in queryset:
                is_visible, info = visibility_from_coeff2(
                    latitude=lat,
                    longitude=long,
                    radius=radius,
                    date_time=event.date_time,
                    inputdict=event.occultation_path_coeff,
                    # object_diameter=event.diameter,
                    # ring_diameter=event.diameter,
                    # n_elements= 1500,
                    # ignore_nighttime= False,
                    # latitudinal= False
                )

                if is_visible == True:
                    wanted_ids.append(event.id)
                    count += 1
                    # print(f"IS VISIBLE: {is_visible}: {event.id} - {event.date_time} - {event.name}")
                    if count == 10:
                        return queryset.filter(id__in=wanted_ids)
        else:
            # Verifica se pelo menos um dos parametros de user location tem valor
            # TODO avisar que os 3 parametros precisam ter valores
            print("Falta um dos parametros")

        return queryset

    @action(detail=False, methods=["get"], permission_classes=(AllowAny,))
    def highlights(self, request):

        count = Occultation.objects.count()
        first_datetime = Occultation.objects.earliest('date_time')
        last_datetime = Occultation.objects.latest('date_time')
        unique_asteroids = Occultation.objects.values(
            'asteroid').distinct().count()

        today_utc = datetime.utcnow().date()
        today_events = Occultation.objects.filter(date_time__date=today_utc)

        # Total de eventos para hoje que já possuem mapas.
        maps_size = []
        for event in today_events:
            map_filepath = event.get_map_filepath()
            if (map_filepath.exists()):
                maps_size.append(map_filepath.stat().st_size)       

        today_already_have_map = len(maps_size)
        total_maps_size = sum(maps_size)

        week_number = today_utc.isocalendar().week
        next_week_number = week_number+1

        this_week_count = Occultation.objects.filter(
            date_time__date__week=week_number).count()
        next_week_count = Occultation.objects.filter(
            date_time__date__week=next_week_number).count()

        next_month = today_utc + relativedelta(months=1)
        this_month_count = Occultation.objects.filter(
            date_time__date__month=today_utc.month).count()
        next_month_count = Occultation.objects.filter(
            date_time__date__month=next_month.month).count()

        maps_stats = maps_folder_stats()
        return Response({
            "count": count,
            "earliest": first_datetime.date_time.isoformat(),
            "latest": last_datetime.date_time.isoformat(),
            "unique_asteroids": unique_asteroids,
            "today_count": today_events.count(),
            "today_already_have_map": today_already_have_map,
            "total_maps_size": total_maps_size,
            "week_count": this_week_count,
            "next_week_count": next_week_count,
            "month_count": this_month_count,
            "next_month_count": next_month_count,
            "maps_stats": maps_stats,
        })

    @action(detail=False, methods=["get"], permission_classes=(IsAuthenticated,))
    def create_prediction_path(self, request):

        # create_occultation_path_coeff()

        return Response({
            "success": True,
        })

    @action(detail=False, methods=["get"], permission_classes=(IsAuthenticated,))
    def create_maps_for_today(self, request):
        create_prediction_maps.delay()

        block_size = int(settings.PREDICTION_MAP_BLOCK_SIZE)
        return Response({
            "success": True,
            "message": f"It was submitted to create {block_size} maps in the background.",
        })

    @action(detail=True, methods=["get"], permission_classes=(AllowAny,))
    def get_or_create_map(self, request, pk):
        obj = self.get_object()

        filepath = obj.get_map_filepath()

        force = False
        if "force" in request.query_params and request.query_params["force"] == "true":
            force = True

        if force == True and filepath.exists():
            filepath.unlink()

        if not filepath.exists():
            # Generate in background with celery
            res = create_occ_map_task.delay(
                name=obj.name,
                diameter=obj.diameter,
                ra_star_candidate=obj.ra_star_candidate,
                dec_star_candidate=obj.dec_star_candidate,
                date_time=obj.date_time.isoformat(),
                closest_approach=obj.closest_approach,
                position_angle=obj.position_angle,
                velocity=obj.velocity,
                delta=obj.delta,
                g=obj.g,
                long=obj.long,
                filepath=str(filepath),
                dpi=50
            )
            res.wait()

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
            return Response({
                "url": None,
            })

    # @action(detail=False, methods=["get"], permission_classes=(AllowAny,))
    # def next_twenty(self, request):
    #     """
    #     #     Este endpoint obtem as próximas 20 occultações .

    #     #     Returns:
    #     #         result (json): Ocultation list.
    #     #     """
    #     paginator = PageNumberPagination()
    #     paginator.page_size = 10
    #     lista = Occultation.objects.filter(
    #         date_time__gte=datetime.now()).order_by('date_time')[:20]
    #     ordered = sorted(lista, key=attrgetter(request.query_params.get('ordering', '').replace(
    #         '-', '')), reverse='-' in request.query_params.get('ordering', ''))
    #     result_page = paginator.paginate_queryset(ordered, request)
    #     serializer = OccultationSerializer(result_page, many=True)
    #     return paginator.get_paginated_response(serializer.data)

    # @action(detail=False, methods=["get"], permission_classes=(AllowAny,))
    # def filter_location(self, request):
    #     queryset = Occultation.objects.all()
    #     # date filter
    #     start_date = self.request.query_params.get('start_date', None)
    #     end_date = self.request.query_params.get('end_date', None)
    #     if start_date and end_date:
    #         queryset = queryset.filter(date_time__range=[start_date, end_date])
    #     elif start_date:
    #         queryset = queryset.filter(date_time__gte=start_date)
    #     elif end_date:
    #         queryset = queryset.filter(date_time__lte=end_date)
    #     # magnitude filter
    #     min_mag = self.request.query_params.get('min_mag', None)
    #     max_mag = self.request.query_params.get('max_mag', None)
    #     if min_mag and max_mag:
    #         queryset = queryset.filter(g__range=[min_mag, max_mag])
    #     # asteroid filter  (filter_type, filter_value)
    #     if (self.request.query_params.get('filter_type', None) == "name"):
    #         values = self.request.query_params.get('filter_value', None)
    #         names = values.split(';')
    #         queryset = queryset.filter(asteroid__name__in=names)
    #     elif (self.request.query_params.get('filter_type', None) == "dynclass"):
    #         dynclass = self.request.query_params.get('filter_value', None)
    #         queryset = queryset.filter(asteroid__dynclass=dynclass)
    #     elif (self.request.query_params.get('filter_type', None) == "base_dynclass"):
    #         basedyn = self.request.query_params.get('filter_value', None)
    #         queryset = queryset.filter(asteroid__base_dynclass=basedyn)
    #     # geografic filter
    #     latitude = self.request.query_params.get('lat', None)
    #     longitude = self.request.query_params.get('long', None)
    #     radius = self.request.query_params.get('radius', None)
    #     if latitude and longitude and radius:
    #         tempo_inicio = time.time()
    #         limite_tempo = 3 * 60
    #         visibles = []
    #         for item in queryset:
    #             tempo_atual = time.time()
    #             tempo_decorrido = tempo_atual - tempo_inicio
    #             if tempo_decorrido >= limite_tempo:
    #                 break
    #             star_cordinates = item.ra_star_candidate + " " + item.dec_star_candidate
    #             status, info = visibility(float(latitude), float(longitude), float(radius), item.date_time, star_cordinates,
    #                                       item.closest_approach, item.position_angle, item.velocity, item.delta, offset=(item.off_ra, item.off_dec))
    #             if (status):
    #                 visibles.append(item.id)
    #         queryset = queryset.filter(id__in=visibles)
    #     # order
    #     ordering = self.request.query_params.get('ordering', None)
    #     if ordering:
    #         queryset = queryset.order_by(ordering)
    #     # return
    #     paginator = PageNumberPagination()
    #     paginator.page_size = 10
    #     result_page = paginator.paginate_queryset(queryset, request)
    #     serializer = OccultationSerializer(result_page, many=True)
    #     return paginator.get_paginated_response(serializer.data)

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
