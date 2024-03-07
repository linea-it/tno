from datetime import datetime, timedelta

import pandas as pd
from common.dates_interval import get_days_interval
from des.dao import CcdDao, DesSkybotPositionDao
from des.models import Ccd
from des.serializers import CcdSerializer
from drf_spectacular.utils import extend_schema
from rest_framework import viewsets
from rest_framework.decorators import action
from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response


@extend_schema(exclude=True)
class CcdViewSet(viewsets.ReadOnlyModelViewSet):
    permission_classes = [IsAuthenticated]
    swagger_schema = None
    queryset = Ccd.objects.all()
    serializer_class = CcdSerializer
    filter_fields = ("id", "exposure", "filename")
    ordering_fields = ("id", "exposure", "ccdnum")
    # ordering = ("ccdnum",)
    search_fields = ("filename",)

    @action(detail=False)
    def count_by_period(self, request):
        """Retorna todas as datas dentro do periodo, com o total de CCDs e quantos já foram downloaded.

        exemplo: http://localhost/api/des/ccd/count_by_period/?start=2019-01-01&end=2019-01-31&dynclass=kbo

        Args:
            start (str): Data inicial do periodo no formato YYYY-MM-DD
            end (str): Data Final do periodo no formato YYYY-MM-DD
            dynclass (str): Classe dinamica atributo dynclass da tabela Skybot Position
            name (str): Nome de um objeto, como está na tabela Skybot Position

        Returns:
            [array]: Um array neste formato: [{"date": "2019-01-01","count": 0,"downloaded": 0.0},...]

        """

        start = request.query_params["start"]
        end = request.query_params["end"]
        dynclass = request.query_params.get("dynclass", None)
        name = request.query_params.get("name", None)

        all_dates = get_days_interval(start, end)

        # Verificar a quantidade de dias entre o start e end.
        if len(all_dates) < 7:
            dt_start = datetime.strptime(start, "%Y-%m-%d")
            dt_end = dt_start.replace(day=dt_start.day + 7)

            all_dates = get_days_interval(
                dt_start.strftime("%Y-%m-%d"), dt_end.strftime("%Y-%m-%d")
            )

        df1 = pd.DataFrame()
        df1["date"] = all_dates
        df1 = df1.set_index("date")

        # adicionar a hora inicial e final as datas
        start = datetime.strptime(start, "%Y-%m-%d").strftime("%Y-%m-%d 00:00:00")
        end = datetime.strptime(end, "%Y-%m-%d").strftime("%Y-%m-%d 23:59:59")

        resultset = CcdDao(pool=False).count_by_period(
            start=start, end=end, dynclass=dynclass, name=name
        )

        if len(resultset) > 0:
            df2 = pd.DataFrame(resultset)
        else:
            df2 = pd.DataFrame()
            df2["date"] = []
            df2["count"] = 0

        df2 = df2.set_index("date")

        df = pd.concat([df1, df2], axis=1)
        df = df.fillna(0)
        df = df.astype({"count": int})
        df = df.reset_index()
        df = df.rename(columns={"index": "date"})

        result = df.to_dict("records")

        return Response(result)

    # @action(detail=False)
    # def summary_by_period(self, request):
    #     """Retona as estimativas de download, para um periodo especifico.

    #     exemplo: http://localhost/api/des/ccd/summary_by_period/?start=2012-11-01&end=2012-11-30&dynclass=Centaur

    #     Args:
    #         request ([type]): [description]

    #     Returns:
    #     dict: {
    #         "dynclass": "Centaur",    # Dynclass usada no filtro
    #         "start": "2012-11-01",    # Periodo Inicial
    #         "end": "2012-11-30",      # Periodo Final
    #         "asteroids": 48,          # Quantidade de Asteroids unicos
    #         "ccds": 48,               # Quantidade de CCDs no periodo
    #         "ccds_downloaded": 5,     # Quantidade de CCDs baixados
    #         "estimated_time": "2398.919432", # Tempo estimado de download para os CCDs que faltam
    #         "estimated_size": 639782208.0,   # Tamanho estimado para o download
    #         "ccds_to_download": 43           # Quantidade de CCDs a serem baixados.
    #     }
    #     """
    #     start = request.query_params["start"]
    #     end = request.query_params["end"]
    #     dynclass = request.query_params.get("dynclass", None)
    #     name = request.query_params.get("name", None)

    #     result = dict(
    #         {
    #             "dynclass": dynclass,
    #             "start": start,
    #             "end": end,
    #             "asteroids": 0,
    #             "ccds": 0,
    #             "ccds_downloaded": 0,
    #             "estimated_time": 0,
    #             "estimated_size": 0,
    #             "ccds_to_download": 0,
    #         }
    #     )

    #     # adicionar a hora inicial e final as datas
    #     start = datetime.strptime(start, "%Y-%m-%d").strftime("%Y-%m-%d 00:00:00")
    #     end = datetime.strptime(end, "%Y-%m-%d").strftime("%Y-%m-%d 23:59:59")

    #     dsp_dao = DesSkybotPositionDao(pool=False)
    #     dcjr_dao = DownloadCcdJobResultDao(pool=False)

    #     count_asteroids = dsp_dao.count_asteroids_by_dynclass(
    #         start=start, end=end, dynclass=dynclass
    #     )

    #     result.update({"asteroids": count_asteroids})

    #     count_ccds = dsp_dao.count_ccds_by_dynclass(
    #         start=start, end=end, dynclass=dynclass
    #     )

    #     result.update({"ccds": count_ccds})

    #     count_ccds_downloaded = dsp_dao.count_ccds_downloaded_by_dynclass(
    #         start=start, end=end, dynclass=dynclass
    #     )

    #     result.update({"ccds_downloaded": count_ccds_downloaded})

    #     # Estimativas de download
    #     de = dcjr_dao.download_estimate()

    #     to_download = int(count_ccds) - int(count_ccds_downloaded)

    #     try:
    #         average_time = de["t_exec_time"] / int(de["total"])
    #         estimated_time = (to_download * average_time).total_seconds()

    #         # Dividir por 10 por que os downloads são paralelizados em um fator 10
    #         estimated_time = estimated_time / 10

    #     except:
    #         estimated_time = 0

    #     try:
    #         average_size = float(de["t_file_size"]) / int(de["total"])
    #     except:
    #         average_size = 0

    #     result.update(
    #         {
    #             "estimated_time": float(estimated_time),
    #             "estimated_size": float(to_download * average_size),
    #             "ccds_to_download": float(to_download),
    #         }
    #     )

    #     return Response(result)
