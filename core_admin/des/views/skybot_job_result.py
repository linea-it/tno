from datetime import datetime, timedelta

import pandas as pd
from rest_framework import viewsets
from rest_framework.decorators import action
from rest_framework.response import Response

from common.dates_interval import get_days_interval
from des.dao import DesSkybotJobResultDao
from des.models import SkybotJobResult
from des.serializers import SkybotJobResultSerializer


class SkybotJobResultViewSet(viewsets.ModelViewSet):

    queryset = SkybotJobResult.objects.all()
    serializer_class = SkybotJobResultSerializer
    filter_fields = ('id', 'job', 'exposure',)
    ordering_fields = ('id', 'job', 'exposure', 'positions',
                       'inside_ccd', 'outside_ccd', 'success', 'execution_time')
    ordering = ('exposure',)

    @action(detail=False)
    def nites_executed_by_period(self, request):
        """Retorna todas as datas dentro do periodo, que foram executadas pelo skybot.

        Exemplo: http://localhost/api/des/skybot_job_result/nites_executed_by_period/?start=2019-01-01&end=2019-01-31
        Args:
            start (str): Data Inicial do periodo  like 2019-01-01
            end (str): Data Final do periodo  2019-01-31

        Returns:
            [array]: um array com todas as datas do periodo no formato [{date: '2019-01-01', count: 0, executed: 0}]
                O atributo executed pode ter 3 valores: 
                    0 - para datas que não tem exposição
                    1 - para datas que tem exposição mas não foram executadas
                    2 - para datas que tem exposição e foram executadas.
        """

        start = request.query_params.get('start')
        end = request.query_params.get('end')

        all_dates = get_days_interval(start, end)

        # Verificar a quantidade de dias entre o start e end.
        if len(all_dates) < 7:
            dt_start = datetime.strptime(start, '%Y-%m-%d')
            dt_end = dt_start.replace(day=dt_start.day + 7)

            all_dates = get_days_interval(dt_start.strftime(
                "%Y-%m-%d"), dt_end.strftime("%Y-%m-%d"))

        df1 = pd.DataFrame()
        df1['dates'] = all_dates
        df1 = df1.set_index('dates')

        # adicionar a hora inicial e final as datas
        start = datetime.strptime(
            start, '%Y-%m-%d').strftime("%Y-%m-%d 00:00:00")
        end = datetime.strptime(end, '%Y-%m-%d').strftime("%Y-%m-%d 23:59:59")

        resultset = DesSkybotJobResultDao().count_exec_by_period(start, end)

        if len(resultset) > 0:
            df2 = pd.DataFrame(resultset)
            #  Se a data tiver sido executada recebe o valor 2 se não recebe 1
            df2['executed'] = df2['count'].apply(
                lambda x: 2 if int(x) > 0 else 1)
        else:
            df2 = pd.DataFrame()
            df2['dates'] = []
            df2['count'] = 0
            df2['executed'] = 1

        df2 = df2.set_index('dates')

        df = pd.concat([df1, df2], axis=1)

        # Completa com 0 as datas que não tem nenhuma exposição.
        df = df.fillna(0)
        df = df.reset_index()
        df = df.rename(columns={'index': 'date'})

        result = df.to_dict('records')

        return Response(result)
