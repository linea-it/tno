import logging

from rest_framework import viewsets

from tno.models import Catalog

from tno.serializers import CatalogSerializer


class CatalogViewSet(viewsets.ReadOnlyModelViewSet):

    queryset = Catalog.objects.all()
    serializer_class = CatalogSerializer
    filterset_fields = ("id", "name",)