from rest_framework import viewsets
from tno.models import AsteroidJob
from tno.serializers import AsteroidJobSerializer


class AsteroidJobViewSet(viewsets.ReadOnlyModelViewSet):

    queryset = AsteroidJob.objects.select_related().all()
    serializer_class = AsteroidJobSerializer
    ordering_fields = ("id", "start", "end", "asteroids_before", "asteroids_after")
    ordering = ("-start",)


