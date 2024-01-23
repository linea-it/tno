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

# class ObservationFilter(django_filters.FilterSet):
#     asteroid_id = django_filters.NumberFilter(field_name='asteroid__id', lookup_expr='exact')
#     class Meta:
#         model = Observation
#         fields = ['asteroid_id']

class ObservationViewSet(viewsets.ReadOnlyModelViewSet):

    queryset = Observation.objects.select_related().all()
    serializer_class = ObservationSerializer
    # filterset_class = ObservationFilter
    ordering_fields = ("date_obs", "id", "name", "ra", "dec", "offset_ra", "offset_dec", "mag_psf", "mag_psf_err", "ccd_id")
    filter_fields = (
        "id",
        "ccd_id",
        "name",
        "date_obs",
    )
    search_fields = ("name",)

    @action(detail=False, methods=["get"])
    def plot_by_asteroid(self, request):

        asteroid_name = self.request.query_params.get('name', None)

        plot_url = plot_observations_by_asteroid(asteroid_name, "html")

        return Response(dict({
            "success": True,
            "plot_url": plot_url
        }))
