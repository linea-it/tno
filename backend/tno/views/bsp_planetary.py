import logging

from drf_spectacular.utils import extend_schema
from rest_framework import viewsets
from rest_framework.permissions import IsAuthenticated

from tno.models import BspPlanetary
from tno.serializers import BspPlanetarySerializer


@extend_schema(exclude=True)
class BspPlanetaryViewSet(viewsets.ReadOnlyModelViewSet):
    permission_classes = [IsAuthenticated]
    swagger_schema = None
    queryset = BspPlanetary.objects.all().order_by("-id")
    serializer_class = BspPlanetarySerializer
    filterset_fields = (
        "id",
        "name",
    )
