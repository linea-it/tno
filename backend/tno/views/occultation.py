import logging
from datetime import datetime, time, timezone

import django_filters
import humanize
from dateutil.relativedelta import relativedelta
from django.conf import settings
from django.db.models import F, FloatField, Q, Value
from rest_framework import viewsets
from rest_framework.authentication import (
    BasicAuthentication,
    SessionAuthentication,
    TokenAuthentication,
)
from rest_framework.decorators import action
from rest_framework.pagination import CursorPagination
from rest_framework.permissions import AllowAny, IsAuthenticated
from rest_framework.response import Response
from tno.db import CatalogDB
from tno.models import Occultation
from tno.occviz import visibility_from_coeff
from tno.prediction_map import maps_folder_stats
from tno.serializers import OccultationSerializer
from tno.tasks import create_occ_map_task, create_prediction_maps


class CharInFilter(django_filters.BaseInFilter, django_filters.CharFilter):
    pass


class OccultationFilter(django_filters.FilterSet):

    date_time = django_filters.DateTimeFromToRangeFilter()

    name = CharInFilter(field_name="name", lookup_expr="in")

    number = CharInFilter(field_name="number", lookup_expr="in")

    mag_g = django_filters.RangeFilter(field_name="g_star")

    dynclass = django_filters.CharFilter(field_name="dynclass", lookup_expr="iexact")

    base_dynclass = django_filters.CharFilter(
        field_name="base_dynclass", lookup_expr="iexact"
    )

    long = django_filters.NumberFilter(method="longitude_filter", label="Longitude")

    nightside = django_filters.BooleanFilter(
        field_name="occ_path_is_nightside", label="nightside"
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

    lat = django_filters.NumberFilter(method="latitude_filter", label="Latitude")

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

    radius = django_filters.NumberFilter(method="radius_filter", label="Radius")

    def radius_filter(self, queryset, name, value):
        # O filtro por latitude vai ser aplicado na get_queryset
        # Esta declarado aqui só para ficar explicito e visivel na interface DRF
        return queryset

    jobid = django_filters.NumberFilter(field_name="job_id", label="Jobid")

    local_solar_time = django_filters.TimeRangeFilter(
        method="solar_time", label="Local Solar Time After"
    )

    def solar_time(self, queryset, name, value):
        # Periodo de Meio dia até o meio meia noite e de meia noite até meio dia
        # Na pratica o start é de meio dia até meio dia do proximo dia.
        after = Q(loc_t__gte=value.start, loc_t__lte=time(23, 59, 59))
        before = Q(loc_t__gte=time(0, 0, 0), loc_t__lte=value.stop)

        return queryset.filter(Q(after | before))

    class Meta:
        model = Occultation
        fields = [
            "date_time",
            "mag_g",
            "dynclass",
            "base_dynclass",
            "name",
            "number",
            "long",
            "local_solar_time",
            "nightside",
            "jobid",
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
        " dec_target",
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
    )
    ordering = ("date_time",)

    def check_user_location_params(self, params):
        lat = params.get("lat", None)
        long = params.get("long", None)
        radius = params.get("radius", None)

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
        t0 = datetime.now()

        logger = logging.getLogger("predict_events")
        logger.info(f"------------------------------------------------")
        logger.info(f"Prediction query for the following parameters")

        # Recupera os parametros da requisição
        params = self.request.query_params
        logger.info(dict(params))

        # Base queryset usando join com a tabela asteroids
        queryset = Occultation.objects.select_related().all()
        # Aplica os fitros da classe OccultationFilter
        # Filter_Queryset  aplica todos os filtros passados por parametro
        # Mas não calcula a visibilidade
        queryset = self.filter_queryset(queryset)
        # print(queryset.query)
        logger.info(f"Results after filters in the database: [{queryset.count()}]")

        lat, long, radius = self.check_user_location_params(params)

        # TODO: Necessário implementar forma de fazer a paginação.
        # TODO: Implementar memcache para eventos já processados
        pageSize = int(params.get("pageSize", 10))

        # Sync Method
        if None not in [lat, long, radius]:
            logger.info(f"Applying the visibility function to each result")
            logger.debug(f"Latitude: {lat} Longitude: {long} Radius: {radius}")

            wanted_ids = []
            count = 0
            processed = 0
            for event in queryset:
                is_visible, info = visibility_from_coeff(
                    latitude=lat,
                    longitude=long,
                    radius=radius,
                    date_time=event.date_time,
                    inputdict=event.occ_path_coeff,
                    # object_diameter=event.diameter,
                    # ring_diameter=event.diameter,
                    # n_elements= 1500,
                    # ignore_nighttime= False,
                    # latitudinal= False
                )
                processed += 1

                if is_visible:
                    wanted_ids.append(event.id)
                    count += 1
                    logger.info(
                        f"Event: [{event.id}] - IS VISIBLE: [{is_visible}] - {event.date_time} - {event.name}"
                    )
                else:
                    logger.debug(
                        f"Event: [{event.id}] - IS VISIBLE: [{is_visible}] - {event.date_time} - {event.name}"
                    )

                if count == pageSize:
                    logger.info("The page's registration limit has been reached.")
                    break

            logger.debug(f"Event IDs with visibility equal to true: {wanted_ids}")
            logger.info(f"Number of events processed: [{processed}]")
            logger.info(
                f"Number of events that the visibility function returned true: [{count}]"
            )

            if count > 0:
                queryset = queryset.filter(id__in=wanted_ids)
                logger.info(f"Results after visibility function: [{queryset.count()}]")
                logger.debug(queryset.query)

        # TODO: Estudar a possibilidade de um metodo asyncrono
        # Teste Com metodo assincrono pode ser promissor!
        # if None not in [lat, long, radius]:
        #     # print(f"Latitude: {lat} Longitude: {long} Radius: {radius}")
        #     job = group(
        #         assync_visibility_from_coeff.s(
        #             event_id=event.id,
        #             latitude=lat,
        #             longitude=long,
        #             radius=radius,
        #             date_time=event.date_time.isoformat(),
        #             inputdict=event.occ_path_coeff,
        #             # object_diameter=event.diameter,
        #             # ring_diameter=event.diameter,
        #             # n_elements= 1500,
        #             # ignore_nighttime= False,
        #             # latitudinal= False
        #          ) for event in queryset)

        #     result = job.apply_async()
        #     while result.ready() == False:
        #         print(f"Completed: {result.completed_count()}")
        #         sleep(1)
        t1 = datetime.now()
        dt = t1 - t0
        logger.info(f"Query Completed in {humanize.naturaldelta(dt)}")
        return queryset

    @action(detail=False, methods=["get"], permission_classes=(AllowAny,))
    def highlights(self, request):

        count = Occultation.objects.count()
        first_datetime = Occultation.objects.earliest("date_time")
        last_datetime = Occultation.objects.latest("date_time")
        unique_asteroids = Occultation.objects.values("name").distinct().count()

        today_utc = datetime.utcnow().date()
        today_events = Occultation.objects.filter(date_time__date=today_utc)

        # Total de eventos para hoje que já possuem mapas.
        maps_size = []
        for event in today_events:
            map_filepath = event.get_map_filepath()
            if map_filepath.exists():
                maps_size.append(map_filepath.stat().st_size)

        today_already_have_map = len(maps_size)
        total_maps_size = sum(maps_size)

        week_number = today_utc.isocalendar().week
        next_week_number = week_number + 1

        this_week_count = Occultation.objects.filter(
            date_time__date__week=week_number
        ).count()
        next_week_count = Occultation.objects.filter(
            date_time__date__week=next_week_number
        ).count()

        next_month = today_utc + relativedelta(months=1)
        this_month_count = Occultation.objects.filter(
            date_time__date__month=today_utc.month
        ).count()
        next_month_count = Occultation.objects.filter(
            date_time__date__month=next_month.month
        ).count()

        maps_stats = maps_folder_stats()

        return Response(
            {
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
            }
        )

    @action(detail=False, methods=["get"], permission_classes=(IsAuthenticated,))
    def create_maps_for_today(self, request):
        create_prediction_maps.delay()

        block_size = int(settings.PREDICTION_MAP_BLOCK_SIZE)
        return Response(
            {
                "success": True,
                "message": f"It was submitted to create {block_size} maps in the background.",
            }
        )

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
                g=obj.g_star,
                long=obj.long,
                filepath=str(filepath),
                dpi=50,
            )
            res.wait()

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

    @action(detail=False, methods=["get"], permission_classes=(AllowAny,))
    def base_dynclass_with_prediction(self, request):
        """Returns all base_dynclass that have at least one prediction event."""
        queryset = Occultation.objects.order_by("base_dynclass").distinct(
            "base_dynclass"
        )

        rows = [x.base_dynclass for x in queryset]
        return Response(dict({"results": rows, "count": len(rows)}))

    @action(detail=False, methods=["get"], permission_classes=(AllowAny,))
    def dynclass_with_prediction(self, request):
        """Returns all dynclass that have at least one prediction event."""
        queryset = Occultation.objects.order_by("dynclass").distinct("dynclass")

        rows = [x.dynclass for x in queryset]
        return Response(dict({"results": rows, "count": len(rows)}))

    @action(detail=False, methods=["get"], permission_classes=(AllowAny,))
    def asteroids_with_prediction(self, request):
        """Returns all Asteroid that have at least one prediction event."""
        queryset = Occultation.objects.order_by("name").distinct("name")

        rows = [x.name for x in queryset]
        return Response(dict({"results": rows, "count": len(rows)}))

    @action(detail=True, methods=["get"], permission_classes=(AllowAny,))
    def get_star_by_event(self, request, pk=None):
        pre_occ = self.get_object()
        ra = pre_occ.ra_star_deg
        dec = pre_occ.dec_star_deg

        # TODO: No futuro vai ser necessário identificar qual o catalogo de estrela foi utilizado
        # nas predição, no momento todas as predições estão utilizando o gaia.DR2
        try:
            db = CatalogDB(pool=False)
            rows = db.radial_query(
                tablename="dr2",
                schema="gaia",
                ra_property="ra",
                dec_property="dec",
                ra=float(ra),
                dec=float(dec),
                radius=0.001,
            )
            if len(rows) > 0:
                return Response(rows[0])
            return Response({})
        except:
            return Response({})
