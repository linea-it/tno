from rest_framework import viewsets

from des.models import SkybotByDynclass
from des.serializers import SkybotByDynclassSerializer


class SkybotByDynclassViewSet(viewsets.ModelViewSet):

    queryset = SkybotByDynclass.objects.all()
    serializer_class = SkybotByDynclassSerializer
    ordering_fields = ()
    ordering = ('dynclass',)
    filter_fields = ('id', 'dynclass', 'nights', 'ccds',
                     'asteroids', 'positions', 'u', 'g', 'r', 'i', 'z', 'y',)
    search_fields = ('dynclass',)
