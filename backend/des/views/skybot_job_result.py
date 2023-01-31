from datetime import datetime, timedelta

import pandas as pd
from rest_framework import viewsets
from rest_framework.decorators import action
from rest_framework.response import Response

from common.dates_interval import get_days_interval
from des.dao import DesSkybotJobResultDao
from des.dao.exposure import ExposureDao
from des.models import SkybotJobResult
from des.serializers import SkybotJobResultSerializer


class SkybotJobResultViewSet(viewsets.ReadOnlyModelViewSet):

    queryset = SkybotJobResult.objects.select_related().all()
    serializer_class = SkybotJobResultSerializer
    filter_fields = (
        "id",
        "job",
        "exposure",
    )
    ordering_fields = (
        "id",
        "job",
        "exposure",
        "positions",
        "inside_ccd",
        "outside_ccd",
        "success",
        "execution_time",
        "exposure__date_obs",
    )
    # ordering = ("exposure",)

    def exposures_by_date(self, start, end):
        resultset = ExposureDao().count_by_period(start, end)

        if len(resultset) > 0:
            df = pd.DataFrame(resultset)
        else:
            df = pd.DataFrame()
            df["date"] = []
            df["count"] = 0

        df = df.set_index("date")
        df = df.fillna(0)
        # df = df.reset_index()
        # df = df.rename(columns={"index": "date"})

        return df

    def exposures_executaded_by_date(self, start, end):

        resultset = DesSkybotJobResultDao().count_exec_by_period(start, end)

        if len(resultset) > 0:
            df = pd.DataFrame(resultset)
            # #  Se a data tiver sido executada recebe o valor 2 se não recebe 1
            # df["status"] = df2["count"].apply(lambda x: 2 if int(x) > 0 else 1)
            # df["status"] = 0
        else:
            df = pd.DataFrame()
            df["date"] = []
            df["count"] = 0
            # df["status"] = 0

        df = df.set_index("date")
        df = df.fillna(0)
        df = df.rename(columns={"count": "executed"})

        return df

    def nite_status(self, row):
        """
        Returns:
            0 - para datas que não tem exposição
            1 - para datas que tem exposição mas nenhuma foi executadas
            2 - para datas que tem exposição e todas foram executadas.
            3 - para datas que tem exposição e algumas delas nao foram executadas.
        """
        if row["count"] == 0:
            return 0

        if row["count"] > 0 and row["executed"] == 0:
            return 1

        if row["count"] > 0 and row["executed"] == row["count"]:
            return 2

        if row["count"] > 0 and row["executed"] < row["count"]:
            return 3

    @action(detail=False)
    def nites_executed_by_period(self, request):
        """Retorna todas as datas dentro do periodo, que foram executadas pelo skybot.

        Exemplo: http://localhost/api/des/skybot_job_result/nites_executed_by_period/?start=2019-01-01&end=2019-01-31
        Args:
            start (str): Data Inicial do periodo  like 2019-01-01
            end (str): Data Final do periodo  2019-01-31

        Returns:
            [array]: um array com todas as datas do periodo no formato [{date: '2019-01-01', count: 0, executed: 0, status: 0}]
                Cout: Total de exposições para cada data.
                Executed: Total de exposições que foram executadas.
                Status pode ter 4 valores:
                    0 - para datas que não tem exposição
                    1 - para datas que tem exposição mas nenhuma foi executadas
                    2 - para datas que tem exposição e todas foram executadas.
                    3 - para datas que tem exposição e algumas delas nao foram executadas.
                    # ! Talvez precise de mais um status indicando que foi executado mais nao teve resultado.
        """

        start = request.query_params.get("start")
        end = request.query_params.get("end")

        all_dates = get_days_interval(start, end)

        # Verificar a quantidade de dias entre o start e end.
        if len(all_dates) < 7:
            dt_start = datetime.strptime(start, "%Y-%m-%d")
            dt_end = dt_start + timedelta(days=6)

            all_dates = get_days_interval(
                dt_start.strftime("%Y-%m-%d"), dt_end.strftime("%Y-%m-%d")
            )

        df_all_dates = pd.DataFrame()
        df_all_dates["date"] = all_dates
        df_all_dates = df_all_dates.set_index("date")

        # adicionar a hora inicial e final as datas
        start = datetime.strptime(start, "%Y-%m-%d").strftime("%Y-%m-%d 00:00:00")
        end = datetime.strptime(end, "%Y-%m-%d").strftime("%Y-%m-%d 23:59:59")

        # Todas as Noites que foram executadas.
        df_executed = self.exposures_executaded_by_date(start, end)

        # Pode não ter resultado para todas as noites no periodo por isso completa o periodo.
        df_executed = pd.concat([df_all_dates, df_executed], axis=1)

        # Total de exposições por data
        df_count = self.exposures_by_date(start, end)

        # Concatena os dataframes de total de exposições com total de executadas
        result_df = pd.concat([df_executed, df_count], axis=1)
        result_df = result_df.fillna(0)
        result_df = result_df.reset_index()
        result_df = result_df.rename(columns={"index": "date"})
        result_df["status"] = result_df.apply(self.nite_status, axis=1)

        result_df = result_df.astype({"count": int, "executed": int, "status": int})

        result = result_df.to_dict("records")

        return Response(result)

    @action(detail=True)
    def ccds_with_asteroids(self, request, pk=None):
        """Retorna o total de CCDs que tem pelo menos 1 asteroid.

        Args:
            request ([type]): [description]
        """

        exposure_result = self.get_object()

        total = DesSkybotJobResultDao(pool=False).t_ccds_with_objects_by_id(
            exposure_result.id
        )

        return Response(dict({"ccds_with_asteroid": total}))

    @action(detail=True)
    def dynclass_asteroids(self, request, pk=None):
        """Total de Objetos por classe para uma exposição.

        Args:
            request ([type]): [description]
        """

        exposure_result = self.get_object()

        result = DesSkybotJobResultDao(pool=False).dynclass_asteroids_by_id(
            exposure_result.id
        )

        return Response(result)
