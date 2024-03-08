from des.models import SkybotByYear
from des.serializers import SkybotByYearSerializer
from drf_spectacular.utils import extend_schema
from rest_framework import viewsets
from rest_framework.permissions import IsAuthenticated


@extend_schema(exclude=True)
class SkybotByYearViewSet(viewsets.ReadOnlyModelViewSet):
    permission_classes = [IsAuthenticated]
    swagger_schema = None
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
