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

    #  TODO Refazer esse endpoint
    # @action(detail=False)
    # def exposures_years(self, request):
    #     db = PointingDB()
    #     exposures = db.unique_exposures()

    #     years = list()

    #     for exposure in exposures:
    #         years.append(exposure['date_obs'].year)

    #     return Response({
    #         'succes': True,
    #         'years': set(years)
    #     })
