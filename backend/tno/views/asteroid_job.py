from rest_framework import viewsets
from tno.models import AsteroidJob
from tno.serializers import AsteroidJobSerializer


class AsteroidJobViewSet(viewsets.ReadOnlyModelViewSet):

    queryset = AsteroidJob.objects.select_related().all()
    serializer_class = AsteroidJobSerializer
    # filter_fields = ("id", "name", "number", "dynclass", "base_dynclass")
    # search_fields = ("name", "number")

