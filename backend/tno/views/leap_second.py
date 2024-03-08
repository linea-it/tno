from drf_spectacular.utils import extend_schema
from rest_framework import viewsets
from rest_framework.permissions import IsAuthenticated
from tno.models import LeapSecond
from tno.serializers import LeapSecondSerializer


@extend_schema(exclude=True)
class LeapSecondViewSet(viewsets.ReadOnlyModelViewSet):
    permission_classes = [IsAuthenticated]
    swagger_schema = None
    queryset = LeapSecond.objects.all()
    serializer_class = LeapSecondSerializer
    filterset_fields = (
        "id",
        "name",
    )
