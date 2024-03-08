from drf_spectacular.utils import extend_schema
from rest_framework import viewsets
from rest_framework.permissions import IsAuthenticated
from tno.models import AsteroidJob
from tno.serializers import AsteroidJobSerializer


@extend_schema(exclude=True)
class AsteroidJobViewSet(viewsets.ReadOnlyModelViewSet):
    permission_classes = [IsAuthenticated]
    swagger_schema = None
    queryset = AsteroidJob.objects.select_related().all()
    serializer_class = AsteroidJobSerializer
    ordering_fields = (
        "id",
        "start",
        "end",
        "asteroids_before",
        "asteroids_after",
        "new_records",
    )
    ordering = ("-start",)
