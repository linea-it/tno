from rest_framework import viewsets
from rest_framework.decorators import action

from common.dates_interval import get_days_interval
from des.models import SkybotJobResult
from des.serializers import SkybotJobResultSerializer


class SkybotJobResultViewSet(viewsets.ModelViewSet):

    queryset = SkybotJobResult.objects.all()
    serializer_class = SkybotJobResultSerializer
    filter_fields = ('id', 'job', 'exposure',)
    ordering_fields = ('id', 'job', 'exposure', 'positions',
                       'inside_ccd', 'outside_ccd', 'success', 'execution_time')
    ordering = ('exposure',)
