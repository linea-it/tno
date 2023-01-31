from django_filters import rest_framework as filters
from rest_framework import viewsets

from des.models import SkybotPosition
from des.serializers import SkybotPositionSerializer


class DesSkybotPositionViewSet(viewsets.ReadOnlyModelViewSet):

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
