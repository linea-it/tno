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


class CharInFilter(django_filters.BaseInFilter, django_filters.CharFilter):
    pass

class OccultationFilter(django_filters.FilterSet):
    start_date = django_filters.DateTimeFilter(field_name='date_time',lookup_expr='gte')
    end_date = django_filters.DateTimeFilter(field_name='date_time',lookup_expr='lte')
    dynclass = django_filters.CharFilter(field_name='asteroid__dynclass', lookup_expr='iexact')
    base_dynclass = django_filters.CharFilter(field_name='asteroid__base_dynclass', lookup_expr='iexact')
    name = CharInFilter(field_name='asteroid__name', lookup_expr='in')
    class Meta:
        model = Occultation
        fields = ['start_date','end_date', 'dynclass', 'base_dynclass', 'name']


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

    ordering_fields = ("id", "name", "number", "date_time")
    ordering = ("date_time",)
    

    

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
    @action(detail=True, methods=["get"])
    def get_by_asteroid(self, request, pk=None):
        """
        #     Este endpoint obtem as observações de dado asteroide.

        #     Parameters:
        #         pk (string): asteroid id.

        #     Returns:
        #         occultations list .
        #     """
        ordering = request.query_params.get('ordering', None)
        occ = Occultation.objects.filter(asteroid=pk) if Occultation.objects.filter(asteroid=pk).exists() else None
        if occ is not None:
            if(ordering):
                occ = occ.order_by(ordering)
            result = OccultationSerializer(occ, many=True)    
        else:
            result = OccultationSerializer([], many=True)
        return Response(result.data)
