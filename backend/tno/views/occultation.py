from rest_framework import viewsets
from rest_framework.authentication import (
    BasicAuthentication,
    SessionAuthentication,
    TokenAuthentication,
)
from rest_framework.permissions import IsAuthenticated

from tno.models import Occultation
from tno.serializers import OccultationSerializer


class OccultationViewSet(viewsets.ReadOnlyModelViewSet):

    authentication_classes = [
        SessionAuthentication,
        BasicAuthentication,
        TokenAuthentication,
    ]
    permission_classes = [IsAuthenticated]

    queryset = Occultation.objects.all()
    serializer_class = OccultationSerializer

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