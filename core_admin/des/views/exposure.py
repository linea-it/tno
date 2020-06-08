from rest_framework import viewsets
from rest_framework.decorators import action

from common.dates_interval import get_days_interval
from des.models import Exposure
from des.serializers import ExposureSerializer


class ExposureViewSet(viewsets.ModelViewSet):

    queryset = Exposure.objects.all()
    serializer_class = ExposureSerializer
    ordering_fields = ('id', 'date_obs',)
    ordering = ('date_obs',)


