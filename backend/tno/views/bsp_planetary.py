import logging

from rest_framework import viewsets
from tno.models import BspPlanetary
from tno.serializers import BspPlanetarySerializer


class BspPlanetaryViewSet(viewsets.ReadOnlyModelViewSet):

    queryset = BspPlanetary.objects.all().order_by("-id")
    serializer_class = BspPlanetarySerializer
    filterset_fields = (
        "id",
        "name",
    )
