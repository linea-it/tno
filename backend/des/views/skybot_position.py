from des.models import SkybotPosition
from des.serializers import SkybotPositionSerializer
from drf_spectacular.utils import extend_schema
from rest_framework import viewsets
from rest_framework.permissions import IsAuthenticated


@extend_schema(exclude=True)
class DesSkybotPositionViewSet(viewsets.ReadOnlyModelViewSet):
    permission_classes = [IsAuthenticated]
    swagger_schema = None
    queryset = SkybotPosition.objects.select_related().all()
    # queryset = SkybotPosition.objects.all()
    serializer_class = SkybotPositionSerializer
    filter_fields = (
        "id",
        "position",
        "exposure",
        "ccd",
        "ticket",
    )
    ordering_fields = (
        "id",
        "position__name",
        "position__number",
        "position__dynclass",
        "position__raj2000",
        "position__decj2000",
        "position__mv",
    )
    # ordering = ("id",)
    search_fields = (
        "position__name",
        "position__number",
    )
