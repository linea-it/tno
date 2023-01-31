from rest_framework import viewsets

from des.models import Observation
from des.serializers import ObservationSerializer


class ObservationViewSet(viewsets.ReadOnlyModelViewSet):

    # queryset = Observation.objects.select_related().all()
    queryset = Observation.objects.all()
    serializer_class = ObservationSerializer
    # ordering_fields = ("date_obs", "id", "name",)
    # ordering = ("date_obs",)
    filter_fields = (
        "id",
        "asteroid",
        "ccd",
        "name",
        "date_obs",
    )
    search_fields = ("name",)
