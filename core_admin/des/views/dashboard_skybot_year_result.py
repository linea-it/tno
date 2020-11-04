from rest_framework import viewsets

from des.models import DashboardSkybotYearResult
from des.serializers import DashboardSkybotYearResultSerializer


class DashboardSkybotYearResultViewSet(viewsets.ModelViewSet):

    queryset = DashboardSkybotYearResult.objects.all()
    serializer_class = DashboardSkybotYearResultSerializer
    ordering_fields = ()
    ordering = ('year',)
    filter_fields = ('id', 'year', 'nights', 'exposures', 'ccds',
                     'nights_analyzed', 'exposures_analyzed', 'ccds_analyzed',)
    search_fields = ('year',)
