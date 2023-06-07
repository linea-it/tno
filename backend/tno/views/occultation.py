import django_filters
from rest_framework import viewsets
from rest_framework.authentication import (
    BasicAuthentication,
    SessionAuthentication,
    TokenAuthentication,
)
from rest_framework.permissions import IsAuthenticated, AllowAny

from tno.models import Occultation
from tno.serializers import OccultationSerializer
from rest_framework.decorators import action
from rest_framework.response import Response
from datetime import datetime
from rest_framework.pagination import PageNumberPagination
from operator import  attrgetter


class CharInFilter(django_filters.BaseInFilter, django_filters.CharFilter):
    pass

class OccultationFilter(django_filters.FilterSet):
    start_date = django_filters.DateTimeFilter(field_name='date_time',lookup_expr='gte')
    end_date = django_filters.DateTimeFilter(field_name='date_time',lookup_expr='lte')
    min_mag = django_filters.NumberFilter(field_name='g', lookup_expr='gte')
    max_mag = django_filters.NumberFilter(field_name='g', lookup_expr='lte')
    dynclass = django_filters.CharFilter(field_name='asteroid__dynclass', lookup_expr='iexact')
    base_dynclass = django_filters.CharFilter(field_name='asteroid__base_dynclass', lookup_expr='iexact')
    name = CharInFilter(field_name='asteroid__name', lookup_expr='in')
    asteroid_id = django_filters.NumberFilter(field_name='asteroid__id', lookup_expr='exact')
    class Meta:
        model = Occultation
        fields = ['start_date','end_date', 'min_mag', 'max_mag', 'dynclass', 'base_dynclass', 'name', 'asteroid_id']


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

    ordering_fields = ("id", "name", "number", "date_time", "ra_star_candidate", "dec_star_candidate", "ra_target", " dec_target", "closest_approach", "position_angle", "velocity", "delta", "g", "j", "h", "k", "long", "loc_t", "off_ra", "off_dec", "proper_motion", "ct", "multiplicity_flag", "e_ra", "e_dec", "pmra", "pmdec", "ra_star_deg", "dec_star_deg", "ra_target_deg", "dec_target_deg", "created_at")
    ordering = ("date_time",)
    

    @action(detail=False, methods=["get"], permission_classes=(AllowAny,))
    def next_twenty(self, request):
        """
        #     Este endpoint obtem as próximas 20 occultações .

        #     Returns:
        #         result (json): Ocultation list.
        #     """
        paginator = PageNumberPagination()
        paginator.page_size = 10
        lista = Occultation.objects.filter(date_time__gte=datetime.now()).order_by('date_time')[:20]
        ordered = sorted(lista, key=attrgetter(request.query_params.get('ordering', '').replace('-', '')), reverse='-' in request.query_params.get('ordering', ''))
        result_page = paginator.paginate_queryset(ordered, request)
        serializer = OccultationSerializer(result_page, many=True)
        return paginator.get_paginated_response(serializer.data)

