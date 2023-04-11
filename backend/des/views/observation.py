import json
import os
import threading
import django_filters

from rest_framework import viewsets

from des.models import Observation
from des.serializers import ObservationSerializer
from rest_framework.decorators import action
from rest_framework.response import Response
from tno.models import Asteroid
from des.models import Observation
from tno.asteroid_utils import plot_observations_by_asteroid

class ObservationFilter(django_filters.FilterSet):
    asteroid_id = django_filters.NumberFilter(field_name='asteroid__id', lookup_expr='exact')
    class Meta:
        model = Observation
        fields = ['asteroid_id']

class ObservationViewSet(viewsets.ReadOnlyModelViewSet):

    queryset = Observation.objects.select_related().all()
    # queryset = Observation.objects.all()
    serializer_class = ObservationSerializer
    filterset_class = ObservationFilter
    ordering_fields = ("date_obs", "id", "name",)
    # ordering = ("date_obs",)
    filter_fields = (
        "id",
        "asteroid",
        "ccd_id",
        "name",
        "date_obs",
    )
    search_fields = ("name",)

    @action(detail=False, methods=["get"])
    def plot_by_asteroid(self, request):

        asteroid_id = self.request.query_params.get('asteroid', None)
        asteroid_name = self.request.query_params.get('name', None)

        if asteroid_id is None and asteroid_name is None:
            return Response(dict(
                {
                    "success": False,
                    "message": "It is necessary to specify an identifier for the asteroid. use asteroid parameter for id or name.",
                }
            ))

        if asteroid_id:
            ast = Asteroid.objects.get(pk=int(asteroid_id))
            asteroid_name = ast.name

        plot_url = plot_observations_by_asteroid(asteroid_name, "html")

        return Response(dict({
            "success": True,
            "plot_url": plot_url
        }))
