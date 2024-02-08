from des.models import SummaryDynclass
from des.serializers import SummaryDynclassSerializer
from rest_framework import viewsets


class SummaryDynclassViewSet(viewsets.ReadOnlyModelViewSet):

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
