import pandas as pd
from rest_framework import viewsets
from rest_framework.decorators import action
from rest_framework.response import Response

from common.dates_interval import get_days_interval
from des.dao.exposure import ExposureDao
from des.models import Exposure
from des.serializers import ExposureSerializer


class ExposureViewSet(viewsets.ModelViewSet):

    queryset = Exposure.objects.all()
    serializer_class = ExposureSerializer
    ordering_fields = ('id', 'date_obs',)
    ordering = ('date_obs',)

    @action(detail=False)
    def count_by_period(self, request):
        """Retorna todas as datas dentro do periodo, com o total de exposições.

        Exemplo: http://localhost/api/des/exposure/count_by_period/?start=2019-01-01&end=2019-01-31
        Args:
            start (str): Data Inicial do periodo  like 2019-01-01
            end (str): Data Final do periodo  2019-01-31

        Returns:
            [array]: um array com todas as datas do periodo no formato [{date: '2019-01-01', count: 0}]
        """
        start = request.query_params.get('start')
        end = request.query_params.get('end')

        all_dates = get_days_interval(start, end)
        
        df1 = pd.DataFrame()
        df1['dates'] = all_dates
        df1 = df1.set_index('dates')

        resultset = ExposureDao().count_by_period(start, end)

        if len(resultset) > 0:
            df2 = pd.DataFrame(resultset)
        else:
            df2 = pd.DataFrame()
            df2['dates'] = []
            df2['count'] = 0

        df2 = df2.set_index('dates')

        df = pd.concat([df1, df2], axis=1)
        df = df.fillna(0)
        df = df.reset_index()
        df = df.rename(columns={'index': 'date'})
        
        result = df.to_dict('records')

        return Response(result)
