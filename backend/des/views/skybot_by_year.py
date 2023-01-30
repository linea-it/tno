from rest_framework import viewsets

from des.models import SkybotByYear
from des.serializers import SkybotByYearSerializer


class SkybotByYearViewSet(viewsets.ReadOnlyModelViewSet):

    queryset = SkybotByYear.objects.all()
    serializer_class = SkybotByYearSerializer
    ordering_fields = ()
    ordering = ("year",)
    filter_fields = (
        "id",
        "year",
        "nights",
        "exposures",
        "ccds",
        "nights_analyzed",
        "exposures_analyzed",
        "ccds_analyzed",
    )
    search_fields = ("year",)
