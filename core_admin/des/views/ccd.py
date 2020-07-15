from datetime import datetime, timedelta

import pandas as pd
from rest_framework import viewsets
from rest_framework.decorators import action
from rest_framework.response import Response

from common.dates_interval import get_days_interval
from des.dao import CcdDao
from des.models import Ccd
from des.serializers import CcdSerializer


class CcdViewSet(viewsets.ModelViewSet):

    queryset = Ccd.objects.all()
    serializer_class = CcdSerializer
    filter_fields = ('id', 'exposure', 'filename')
    ordering_fields = ('id', 'exposure', 'ccdnum')
    ordering = ('ccdnum',)
    search_fields = ('filename', )

    @action(detail=False)
    def count_by_period(self, request):
        """Retorna todas as datas dentro do periodo, com o total de CCDs e quantos já foram downloaded.

        exemplo: http://localhost/api/des/ccd/count_by_period/?date_initial=2019-01-01&date_final=2019-01-31&dynclass=kbo

        Args:
            date_initial (str): Data inicial do periodo no formato YYYY-MM-DD
            date_final (str): Data Final do periodo no formato YYYY-MM-DD
            dynclass (str): Classe dinamica atributo dynclass da tabela Skybot Position
            name (str): Nome de um objeto, como está na tabela Skybot Position

        Returns:
            [array]: Um array neste formato: [{"date": "2019-01-01","count": 0,"downloaded": 0.0},...]

        """

        start = request.query_params['date_initial']
        end = request.query_params['date_final']
        dynclass = request.query_params.get('dynclass', None)
        name = request.query_params.get('name', None)

        all_dates = get_days_interval(start, end)

        # Verificar a quantidade de dias entre o start e end.
        if len(all_dates) < 7:
            dt_start = datetime.strptime(start, '%Y-%m-%d')
            dt_end = dt_start.replace(day=dt_start.day + 7)

            all_dates = get_days_interval(dt_start.strftime(
                "%Y-%m-%d"), dt_end.strftime("%Y-%m-%d"))

        df1 = pd.DataFrame()
        df1['date'] = all_dates
        df1 = df1.set_index('date')

       # adicionar a hora inicial e final as datas
        start = datetime.strptime(
            start, '%Y-%m-%d').strftime("%Y-%m-%d 00:00:00")
        end = datetime.strptime(end, '%Y-%m-%d').strftime("%Y-%m-%d 23:59:59")

        resultset = CcdDao(pool=False).count_by_period(
            start=start, end=end, dynclass=dynclass, name=name)

        if len(resultset) > 0:
            df2 = pd.DataFrame(resultset)
        else:
            df2 = pd.DataFrame()
            df2['date'] = []
            df2['count'] = 0

        df2 = df2.set_index('date')

        df = pd.concat([df1, df2], axis=1)
        df = df.fillna(0)
        df = df.astype({"count": int})
        df = df.reset_index()
        df = df.rename(columns={'index': 'date'})

        result = df.to_dict('records')

        return Response(result)
