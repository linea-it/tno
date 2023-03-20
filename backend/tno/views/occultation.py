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


class OccultationViewSet(viewsets.ReadOnlyModelViewSet):

    authentication_classes = [
        SessionAuthentication,
        BasicAuthentication,
        TokenAuthentication,
    ]
    permission_classes = [AllowAny]

    queryset = Occultation.objects.all()
    serializer_class = OccultationSerializer

    filter_fields = ("id", "name", "number", "date_time")
    search_fields = ("name", "number")

    ordering_fields = ("id", "name", "number", "date_time")
    ordering = ("date_time",)

    def get_queryset(self):
        #filter date
        start_date = self.request.query_params.get('start_date', None)
        end_date = self.request.query_params.get('end_date', None)
        queryset = self.queryset
        if start_date and end_date:
            queryset = queryset.filter(date_time__range=[start_date, end_date])  
        elif start_date:
            queryset = queryset.filter(date_time__gte=start_date)
        elif end_date:
            queryset = queryset.filter(date_time__lte=end_date)  
        #filter asteroids (filter_type, filter_value)
        if(self.request.query_params.get('filter_type', None) == "name"):
            values = self.request.query_params.get('filter_value', None)
            names = values.split(';')
            queryset = queryset.filter(asteroid__name__in=names)
        elif (self.request.query_params.get('filter_type', None) == "dynclass"):
            dynclass = self.request.query_params.get('filter_value', None)
            queryset = queryset.filter(asteroid__dynclass=dynclass)
        elif(self.request.query_params.get('filter_type', None) == "base_dynclass"):
            basedyn = self.request.query_params.get('filter_value', None)
            queryset = queryset.filter(asteroid__base_dynclass=basedyn)
        return queryset    

    

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
        occ = Occultation.objects.filter(asteroid=pk) if Occultation.objects.filter(asteroid=pk).exists() else None
        
        if occ is not None:
            result = OccultationSerializer(occ, many=True)
            return Response(result.data)
        else:
            return Response("no observations found")
