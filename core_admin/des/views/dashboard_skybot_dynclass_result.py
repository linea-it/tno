from rest_framework import viewsets

from des.models import DashboardSkybotDynclassResult
from des.serializers import DashboardSkybotDynclassResultSerializer


class DashboardSkybotDynclassResultViewSet(viewsets.ModelViewSet):

    queryset = DashboardSkybotDynclassResult.objects.all()
    serializer_class = DashboardSkybotDynclassResultSerializer
    ordering_fields = ()
    ordering = ('dynclass',)
    filter_fields = ('id', 'dynclass', 'nights', 'ccds',
                     'asteroids', 'positions', 'u', 'g', 'r', 'i', 'z', 'y',)
    search_fields = ('dynclass',)
