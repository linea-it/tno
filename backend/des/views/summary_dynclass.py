from des.models import SummaryDynclass
from des.serializers import SummaryDynclassSerializer
from drf_spectacular.utils import extend_schema
from rest_framework import viewsets
from rest_framework.permissions import IsAuthenticated


@extend_schema(exclude=True)
class SummaryDynclassViewSet(viewsets.ReadOnlyModelViewSet):
    permission_classes = [IsAuthenticated]
    swagger_schema = None
    queryset = SummaryDynclass.objects.all()
    serializer_class = SummaryDynclassSerializer
    ordering_fields = (
        "id",
        "job",
        "dynclass",
        "asteroids",
        "ccds",
        "positions",
        "u",
        "g",
        "r",
        "i",
        "z",
        "y",
    )
    ordering = ("job",)
    filter_fields = (
        "id",
        "job",
        "dynclass",
    )
    search_fields = ("job",)
