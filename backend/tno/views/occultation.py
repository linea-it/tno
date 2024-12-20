import hashlib
import json
import logging
from datetime import datetime, time, timezone
from pathlib import Path

import django_filters
import humanize
from dateutil.relativedelta import relativedelta
from django.conf import settings
from django.core.cache import cache
from django.db.models import F, FloatField, Q, Value
from django.shortcuts import get_object_or_404
from drf_spectacular.utils import extend_schema, inline_serializer
from rest_framework import serializers, viewsets
from rest_framework.decorators import action
from rest_framework.permissions import AllowAny
from rest_framework.response import Response
from tno.db import CatalogDB
from tno.models import Catalog, Occultation
from tno.occviz import occultation_path, visibility_from_coeff
from tno.prediction_map import maps_folder_stats
from tno.serializers import OccultationSerializer
from tno.tasks import assync_visibility_from_coeff, create_occ_map_task
from tno.views.geo_location import GeoLocation


class CharInFilter(django_filters.BaseInFilter, django_filters.CharFilter):
    pass


class OccultationFilter(django_filters.FilterSet):

    hash_id = django_filters.CharFilter(
        label="Hash ID", field_name="hash_id", lookup_expr="exact"
    )
    date_time = django_filters.DateTimeFromToRangeFilter()

    name = CharInFilter(field_name="name", lookup_expr="in")

    number = CharInFilter(field_name="number", lookup_expr="in")

    dynclass = django_filters.CharFilter(field_name="dynclass", lookup_expr="iexact")

    magnitude = django_filters.RangeFilter(field_name="g_star", label="Magnitude g")

    diameter = django_filters.RangeFilter(field_name="diameter")

    event_duration = django_filters.RangeFilter(field_name="event_duration")

    base_dynclass = django_filters.CharFilter(
        field_name="base_dynclass", lookup_expr="iexact"
    )

    nightside = django_filters.BooleanFilter(
        field_name="occ_path_is_nightside",
        label="nightside",
    )

    magnitude_drop = django_filters.RangeFilter(field_name="magnitude_drop")

    closest_approach_uncertainty_km = django_filters.RangeFilter(
        field_name="closest_approach_uncertainty_km"
    )

    longitude = django_filters.NumberFilter(
        method="longitude_filter", label="Longitude"
    )

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
            temp_longitude__gte=F("occ_path_min_longitude"),
            temp_longitude__lte=F("occ_path_max_longitude"),
        )

    latitude = django_filters.NumberFilter(method="latitude_filter", label="Latitude")

    def latitude_filter(self, queryset, name, value):
        value = float(value)
        # Query de exemplo usando valor de longitude = 2
        # select count(*) from tno_occultation to2 where 2 between min_latitude and max_latitude
        # Para fazer o between entre duas colunas diferentes, é preciso
        # Criar uma coluna com o valor fixo usando annotate.
        # E usar o F para dizer ao Django que é uma coluna.
        # A logica aqui é, a latitude é maior ou igual a coluna min_latitude
        # e menor ou igual a coluna max_latitude.
        return queryset.annotate(
            temp_latitude=Value(value, output_field=FloatField())
        ).filter(
            have_path_coeff=True,
            temp_latitude__gte=F("occ_path_min_latitude"),
            temp_latitude__lte=F("occ_path_max_latitude"),
        )

    location_radius = django_filters.NumberFilter(
        method="radius_filter", label="Location Radius"
    )

    def radius_filter(self, queryset, name, value):
        # O filtro por latitude vai ser aplicado na get_queryset
        # Esta declarado aqui só para ficar explicito e visivel na interface DRF
        return queryset

    jobid = django_filters.NumberFilter(field_name="job_id", label="Jobid")

    local_solar_time = django_filters.TimeRangeFilter(
        method="solar_time", label="Local Solar Time After"
    )

    def solar_time(self, queryset, name, value):
        # Se value.start for maior que value.stop
        if value.start > value.stop:
            # Periodo de Meio dia até meia noite e de meia noite até meio dia
            # Na pratica o start é de meio dia até meio dia do proximo dia.
            after = Q(loc_t__gte=value.start, loc_t__lte=time(23, 59, 59))
            before = Q(loc_t__gte=time(0, 0, 0), loc_t__lte=value.stop)
            return queryset.filter(Q(after | before))
        else:
            # Se value.start for menor ou igual a value.stop
            return queryset.filter(Q(loc_t__gte=value.start, loc_t__lte=value.stop))

    class Meta:
        model = Occultation
        fields = [
            "date_time",
            "name",
            "number",
            "base_dynclass",
            "dynclass",
            "magnitude",
            "magnitude_drop",
            "diameter",
            "event_duration",
            "closest_approach_uncertainty_km",
            "local_solar_time",
            "nightside",
            "jobid",
        ]


class OccultationViewSet(viewsets.ReadOnlyModelViewSet):
    permission_classes = [AllowAny]

    lookup_field = "hash_id"

    queryset = Occultation.objects.all()
    serializer_class = OccultationSerializer

    filterset_class = OccultationFilter
    search_fields = ("name", "principal_designation", "number")

    ordering_fields = (
        "id",
        "name",
        "number",
        "principal_designation",
        "base_dynclass",
        "dynclass",
        "date_time",
        "ra_star_candidate",
        "dec_star_candidate",
        "ra_target",
        "dec_target",
        "closest_approach",
        "position_angle",
        "velocity",
        "delta",
        "g_star",
        "j_star",
        "h_star",
        "k_star",
        "long",
        "loc_t",
        "off_ra",
        "off_dec",
        "proper_motion",
        "ct",
        "multiplicity_flag",
        "e_ra",
        "e_dec",
        "pmra",
        "pmdec",
        "ra_star_deg",
        "dec_star_deg",
        "ra_target_deg",
        "dec_target_deg",
        "created_at",
        "diameter",
        "event_duration",
        "magnitude_drop",
    )
    ordering = ("date_time",)

    def check_user_location_params(self, params):
        lat = params.get("latitude", None)
        long = params.get("longitude", None)
        radius = params.get("location_radius", None)

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

    # TODO: Remover este metodo depois que todas as predições tiverem hash_id.
    # Este metodo sobrescreve o metodo base que retorna o objeto pela lookup_field na url.
    # Este metodo foi criado para permitir a busca pelo ID do objeto no banco de dados visando manter a compatibilidade com urls antigas.
    def get_object(self):
        """
        Returns the object the view is displaying.

        You may want to override this if you need to provide non-standard
        queryset lookups.  Eg if objects are referenced using multiple
        keyword arguments in the url conf.
        """
        queryset = self.filter_queryset(self.get_queryset())

        # Perform the lookup filtering.
        lookup_url_kwarg = self.lookup_url_kwarg or self.lookup_field

        assert lookup_url_kwarg in self.kwargs, (
            "Expected view %s to be called with a URL keyword argument "
            'named "%s". Fix your URL conf, or set the `.lookup_field` '
            "attribute on the view correctly."
            % (self.__class__.__name__, lookup_url_kwarg)
        )

        try:
            id = int(self.kwargs[lookup_url_kwarg])
            filter_kwargs = {"pk": id}
        except:
            filter_kwargs = {self.lookup_field: self.kwargs[lookup_url_kwarg]}

        obj = get_object_or_404(queryset, **filter_kwargs)

        # May raise a permission denied
        self.check_object_permissions(self.request, obj)

        return obj

    def list(self, request):
        t0 = datetime.now()
        logger = logging.getLogger("predict_events")
        logger.info(f"------------------------------------------------")
        logger.info(f"Prediction query for the following parameters")

        # Aplica os fitros da classe OccultationFilter
        # Mas não calcula a visibilidade
        queryset = self.filter_queryset(self.get_queryset())
        # logger.debug(queryset.query)
        logger.info(f"Results after filters in the database: [{queryset.count()}]")

        # Recupera os parametros da requisição
        params = self.request.query_params
        # logger.debug(dict(params))

        # Verifica se é uma consulta por geo localização.
        lat, long, radius = self.check_user_location_params(params)
        if None not in [lat, long, radius]:
            gl = GeoLocation(params.dict(), queryset)

            queryset = gl.execute()
            page = self.paginate_queryset(queryset)
            serializer = self.get_serializer(page, many=True)
            result = self.get_paginated_response(serializer.data)

        else:
            page = self.paginate_queryset(queryset)
            serializer = self.get_serializer(page, many=True)
            result = self.get_paginated_response(serializer.data)

        t1 = datetime.now()
        dt = t1 - t0
        logger.info(f"Query Completed in {humanize.naturaldelta(dt)}")
        return result

    @extend_schema(exclude=True)
    @action(detail=False, methods=["get"], permission_classes=(AllowAny,))
    def highlights_unique_asteroids(self, request):

        count = Occultation.objects.count()

        unique_asteroids = 0
        first_datetime = None
        last_datetime = None

        if count > 0:
            unique_asteroids = Occultation.objects.values("name").distinct().count()
            first_datetime = Occultation.objects.earliest("date_time")
            last_datetime = Occultation.objects.latest("date_time")
            first_datetime = first_datetime.date_time.isoformat()
            last_datetime = last_datetime.date_time.isoformat()

        return Response(
            {
                "count": count,
                "unique_asteroids": unique_asteroids,
                "earliest": first_datetime,
                "latest": last_datetime,
            }
        )

    @extend_schema(exclude=True)
    @action(detail=False, methods=["get"], permission_classes=(AllowAny,))
    def highlights_weekly_forecast(self, request):

        today_utc = datetime.utcnow().date()
        today_events = Occultation.objects.filter(date_time__date=today_utc)

        week_number = today_utc.isocalendar().week
        next_week_number = week_number + 1

        this_week_count = Occultation.objects.filter(
            date_time__date__week=week_number
        ).count()
        next_week_count = Occultation.objects.filter(
            date_time__date__week=next_week_number
        ).count()
        return Response(
            {
                "today_count": today_events.count(),
                "week_count": this_week_count,
                "next_week_count": next_week_count,
            }
        )

    @extend_schema(exclude=True)
    @action(detail=False, methods=["get"], permission_classes=(AllowAny,))
    def highlights_monthly_forecast(self, request):

        today_utc = datetime.utcnow().date()

        next_month = today_utc + relativedelta(months=1)
        this_month_count = Occultation.objects.filter(
            date_time__date__month=today_utc.month
        ).count()
        next_month_count = Occultation.objects.filter(
            date_time__date__month=next_month.month
        ).count()

        return Response(
            {
                "month_count": this_month_count,
                "next_month_count": next_month_count,
            }
        )

    @extend_schema(exclude=True)
    @action(detail=False, methods=["get"], permission_classes=(AllowAny,))
    def highlights_maps_stats(self, request):

        return Response(maps_folder_stats())

    @extend_schema(
        responses={
            200: inline_serializer(
                name="OccultationMap",
                fields={
                    "url": serializers.URLField(),
                    "occultation": serializers.IntegerField(),
                    "name": serializers.CharField(),
                    "date_time": serializers.DateTimeField(),
                    "filename": serializers.CharField(),
                    "filezise": serializers.IntegerField(),
                    "creation_time": serializers.DateTimeField(),
                },
            )
        },
    )
    @action(detail=True, methods=["get"], permission_classes=(AllowAny,))
    def get_or_create_map(self, request, pk=None, hash_id=None):
        """Retorna o mapa para o evento de ocultação.

        Verifica se já existe mapa para o evento especifico para o ID.
        se existir apenas retorna os dados do mapa e a url.
        se não exisitir cria o mapa, a criação pode demorar alguns segundos e seu timeout será de 180s.
        """
        obj = self.get_object()

        filepath = obj.get_map_filepath()

        filepath.parent.mkdir(parents=True, exist_ok=True)

        force = False
        if "force" in request.query_params and request.query_params["force"] == "true":
            force = True

        if force == True and filepath.exists():
            filepath.unlink()

        if not filepath.exists():
            res = create_occ_map_task(
                name=obj.name,
                diameter=obj.diameter,
                ra_star_candidate=obj.ra_star_candidate,
                dec_star_candidate=obj.dec_star_candidate,
                date_time=obj.date_time.isoformat(),
                closest_approach=obj.closest_approach,
                position_angle=obj.position_angle,
                velocity=obj.velocity,
                delta=obj.delta,
                g=obj.g_star,
                long=obj.long,
                error=(
                    None
                    if obj.closest_approach_uncertainty is None
                    else obj.closest_approach_uncertainty * 1000
                ),  # it is multiplied by 1000 because sora need the value in miliarcsec
                filepath=str(filepath),
                dpi=50,
            )
        if filepath.exists():
            return Response(
                {
                    "url": request.build_absolute_uri(obj.get_map_relative_url()),
                    "occultation": obj.id,
                    "name": obj.name,
                    "date_time": obj.date_time.isoformat(),
                    "filename": filepath.name,
                    "filezise": filepath.stat().st_size,
                    "creation_time": datetime.fromtimestamp(filepath.stat().st_ctime)
                    .astimezone(timezone.utc)
                    .isoformat(),
                }
            )
        else:
            # TODO: Retornar mensagem de erro
            return Response(
                {
                    "url": None,
                }
            )

    @action(detail=True, methods=["get"], permission_classes=(AllowAny,))
    def get_occultation_paths(self, request, pk=None, hash_id=None):
        """Retorna um json contendo os caminhos da sombra."""
        obj = self.get_object()

        star_coordinates = obj.ra_star_candidate + " " + obj.dec_star_candidate
        object_diameter = obj.diameter if obj.diameter is not None else 0
        object_diameter_error_min = (
            obj.diameter_err_min if obj.diameter_err_min is not None else 0
        )
        object_diameter_error_max = (
            obj.diameter_err_max if obj.diameter_err_max is not None else 0
        )
        object_diameter_error = max(
            object_diameter_error_min, object_diameter_error_max
        )
        object_diameter_error = (
            None if object_diameter_error == 0 else object_diameter_error
        )

        paths = occultation_path(
            obj.date_time,
            star_coordinates,
            obj.closest_approach,
            obj.position_angle,
            obj.velocity,
            obj.delta,
            offset=[0, 0],
            object_diameter=object_diameter,
            object_diameter_error=object_diameter_error,
            closest_approach_error=obj.closest_approach_uncertainty_km,
            interpolate=True,
        )
        output = {}
        output["datetime"] = obj.date_time
        output["diameter"] = object_diameter if object_diameter > 0 else None
        diameter_upper_limit = (
            (object_diameter + object_diameter_error_max)
            if object_diameter > 0 and object_diameter_error_max > 0
            else None
        )
        output["diameter_upper_limit"] = diameter_upper_limit
        diameter_lower_limit = (
            (object_diameter - object_diameter_error_min)
            if object_diameter > 0 and object_diameter_error_min > 0
            else None
        )
        output["diameter_lower_limit"] = diameter_lower_limit

        # output["max_longitude"] = obj.occ_path_coeff["max_longitude"]
        # output["min_longitude"] = obj.occ_path_coeff["min_longitude"]
        # output["max_latitude"] = obj.occ_path_coeff["max_latitude"]
        # output["min_latitude"] = obj.occ_path_coeff["min_latitude"]

        for key, value in paths.items():
            output[key] = value

        return Response(output)

    @extend_schema(
        responses={
            200: inline_serializer(
                name="BaseDynclassWithEvents",
                fields={
                    "results": serializers.ListSerializer(
                        child=serializers.CharField()
                    ),
                    "count": serializers.IntegerField(),
                },
            )
        },
    )
    @action(detail=False, methods=["get"], permission_classes=(AllowAny,))
    def base_dynclass_with_prediction(self, request):
        """Returns all base_dynclass that have at least one prediction event."""
        # needs to be unique
        cache_key = "base_dynclass_with_prediction"
        # time in seconds for cache to be valid
        cache_time = 86400  # 24h
        # returns None if no key-value pair
        data = cache.get(cache_key)

        if data is not None:
            return Response(data)

        queryset = Occultation.objects.order_by("base_dynclass").distinct(
            "base_dynclass"
        )

        rows = [x.base_dynclass for x in queryset]
        result = {"results": rows, "count": len(rows)}

        # Store the data in the cache
        cache.set(cache_key, result, cache_time)

        return Response(result)

    @extend_schema(
        responses={
            200: inline_serializer(
                name="DynclassWithEvents",
                fields={
                    "results": serializers.ListSerializer(
                        child=serializers.CharField()
                    ),
                    "count": serializers.IntegerField(),
                },
            )
        },
    )
    @action(detail=False, methods=["get"], permission_classes=(AllowAny,))
    def dynclass_with_prediction(self, request):
        """Returns all dynclass that have at least one prediction event."""
        # needs to be unique
        cache_key = "dynclass_with_prediction"
        # time in seconds for cache to be valid
        cache_time = 86400  # 24h
        # returns None if no key-value pair
        data = cache.get(cache_key)

        if data is not None:
            return Response(data)

        queryset = Occultation.objects.order_by("dynclass").distinct("dynclass")

        rows = [x.dynclass for x in queryset]
        result = {"results": rows, "count": len(rows)}

        # Store the data in the cache
        cache.set(cache_key, result, cache_time)

        return Response(result)

    @extend_schema(
        responses={
            200: inline_serializer(
                name="AsteroidsNamesWithEvents",
                fields={
                    "results": serializers.ListSerializer(
                        child=serializers.CharField()
                    ),
                    "count": serializers.IntegerField(),
                },
            )
        },
    )
    @action(detail=False, methods=["get"], permission_classes=(AllowAny,))
    def asteroids_with_prediction(self, request):
        """Returns all asteroid name that have at least one prediction event.

        Não paginada
        """
        queryset = Occultation.objects.order_by("name").distinct("name")

        rows = [x.name for x in queryset]
        return Response(dict({"results": rows, "count": len(rows)}))

    @extend_schema(exclude=True)
    @action(detail=True, methods=["get"], permission_classes=(AllowAny,))
    def get_star_by_event(self, request, pk=None, hash_id=None):
        pre_occ = self.get_object()

        source_id = pre_occ.gaia_source_id
        ra = pre_occ.ra_star_deg
        dec = pre_occ.dec_star_deg

        # Faz a consulta baseado na versao de catalogo gaia
        # utilizada na predição do evento.
        catalog = Catalog.objects.get(display_name=pre_occ.catalog)

        try:
            db = CatalogDB(pool=False)
            rows = db.radial_query(
                tablename=catalog.tablename,
                schema=catalog.schema,
                ra_property=catalog.ra_property,
                dec_property=catalog.dec_property,
                ra=float(ra),
                dec=float(dec),
                radius=0.001,
                source_id=source_id,
            )
            if len(rows) > 0:
                return Response(rows[0])
            return Response({})
        except:
            return Response({})
