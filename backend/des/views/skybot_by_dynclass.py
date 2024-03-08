from des.models import SkybotByDynclass
from des.serializers import SkybotByDynclassSerializer
from drf_spectacular.utils import extend_schema
from rest_framework import viewsets
from rest_framework.permissions import IsAuthenticated


@extend_schema(exclude=True)
class SkybotByDynclassViewSet(viewsets.ReadOnlyModelViewSet):
    permission_classes = [IsAuthenticated]
    swagger_schema = None
    queryset = SkybotByDynclass.objects.all()
    serializer_class = SkybotByDynclassSerializer
    ordering_fields = ()
    ordering = ("dynclass",)
    filter_fields = (
        "id",
        "dynclass",
        "nights",
        "ccds",
        "asteroids",
        "positions",
        "u",
        "g",
        "r",
        "i",
        "z",
        "y",
    )
    search_fields = ("dynclass",)
