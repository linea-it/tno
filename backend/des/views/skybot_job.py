import json
import os
import threading
from datetime import datetime, timedelta

import numpy as np
import pandas as pd
from common.dates_interval import get_days_interval
from common.read_csv import csv_to_dataframe
from des.dao import CcdDao, DesSkybotJobResultDao, ExposureDao
from des.models import SkybotJob
from des.serializers import SkybotJobSerializer
from des.skybot.pipeline import DesSkybotPipeline
from des.summary import SummaryResult
from django.core.paginator import Paginator
from rest_framework import mixins, viewsets
from rest_framework.decorators import action
from rest_framework.response import Response
from des.dao.exposure import ExposureDao


class SkybotJobViewSet(
    mixins.RetrieveModelMixin, mixins.ListModelMixin, viewsets.GenericViewSet
):
    """
    Este end point esta com os metodos de Create, Update, Delete desabilitados.
    estas operações vão ficar na responsabilidades do pipeline des/skybot.

    o Endpoint submit_job é responsavel por iniciar o pipeline que será executado em background.
    """

    queryset = SkybotJob.objects.all()
    serializer_class = SkybotJobSerializer
    ordering_fields = (
        "id",
        "status",
        "start",
        "finish",
        "execution_time",
        "nights",
        "exposures",
        "asteroids",
        "ccds",
        "ccds_with_asteroid",
    )
    ordering = ("-start",)

    def estimate_execution_time(self, to_execute):

        dao = DesSkybotJobResultDao(pool=False)

        se = dao.skybot_estimate()

        try:
            average_time = se["t_exec_time"] / int(se["total"])
            estimated_time = (int(to_execute) * average_time).total_seconds()

        except:
            # Caso não tenha dados para a estimativa utilizar 2.15 segundos para cada exposição.
            estimated_time = int(to_execute) * 2.15

        return estimated_time

    @action(detail=False, methods=["post"])
    def submit_job(self, request, pk=None):
        """
        Este endpoint apenas cria um novo registro na tabela Des/Skybot Jobs.

        O Job é criado com status idle. uma daemon verifica
        de tempos em tempos os jobs neste status e inicia o processamento.

        Parameters:
            date_initial (datetime): data inicial usada para selecionar as exposições que serão processadas.

            date_final (datetime): data Final usado para selecionar as exposições que serão processadas

        Returns:
            job (SkybotJobSerializer): Job que acabou de ser criado.
        """
        params = request.data

        date_initial = params["date_initial"]
        date_final = params["date_final"]
        debug = params["debug"]

        # Recuperar o usuario que submeteu o Job.
        owner = self.request.user

        # adicionar a hora inicial e final as datas
        start = datetime.strptime(date_initial, "%Y-%m-%d").strftime(
            "%Y-%m-%d 00:00:00"
        )
        end = datetime.strptime(date_final, "%Y-%m-%d").strftime("%Y-%m-%d 23:59:59")

        # Total de exposures não executadas no Periodo.
        t_exposures = DesSkybotJobResultDao(pool=False).count_not_exec_by_period(
            start, end
        )

        # Recuperar o total de noites com exposição no periodo
        t_nights = ExposureDao(pool=False).count_not_exec_nights_by_period(start, end)

        # Recuperar o total de ccds no periodo.
        t_ccds = CcdDao(pool=False).count_not_exec_ccds_by_period(start, end)

        # Estimativa de tempo baseada na qtd de exposures a serem executadas.
        estimated_time = self.estimate_execution_time(t_exposures)

        # Criar um model Skybot Job
        job = SkybotJob(
            owner=owner,
            date_initial=date_initial,
            date_final=date_final,
            # Job começa com Status Idle.
            status=1,
            # Total de exposures a serem executadas.
            exposures=t_exposures,
            # Total de noites com exposições.
            nights=t_nights,
            # Total de CCDs no periodo.
            ccds=t_ccds,
            # Tempo de execução estimado
            estimated_execution_time=timedelta(seconds=estimated_time),
            # Debug Mode
            debug=debug,
        )
        job.save()

        result = SkybotJobSerializer(job)

        return Response(result.data)

    def add_new_job(self, date_initial, date_final, owner, debug, summary):

        # Criar um model Skybot Job
        job = SkybotJob(
            owner=owner,
            date_initial=date_initial,
            date_final=date_final,
            # Job começa com Status Idle.
            status=1,
            # Debug Mode
            debug=debug,
            # Execute Summary
            summary=summary,
        )
        job.save()

        return job

    @action(detail=False, methods=["post"])
    def submit_job_balanced_periods(self, request):
        """
        Este endpoint Submete Jobs do Skybot em lotes para todo o periodo de observações do DES.
        criando uma fila balanceada de jobs.
        Os jobs estão divididos em blocos de aproximadamente 5000 exposições com duração estimada de ~3h.
        Para economizar tempo as operações de summary (DES/dashboard) serão executadas a cada 5 jobs e no ultimo job.

        Returns:
            job (int): Id do primeiro job submetido.
            count (int): Quantidade de Jobs Submetidos.
        """
        debug = False
        bin = 5000

        # Recuperar o usuario que submeteu o Job.
        owner = self.request.user

        # Recuperar todas as datas envolvidas no Des Release.
        start = datetime.strptime("2012-11-10", "%Y-%m-%d").strftime(
            "%Y-%m-%d 00:00:00"
        )
        end = datetime.strptime("2019-02-28", "%Y-%m-%d").strftime("%Y-%m-%d 00:00:00")
        all_dates = ExposureDao().count_by_period(start, end)

        job_start = None
        job_end = None
        count = 0
        jobs = []
        last_item = all_dates[-1]
        bins = []

        for date in all_dates:
            if job_start is None:
                job_start = date["date"]

            count += date["count"]

            if count > bin or date == last_item:
                job_end = date["date"]

                bins.append(
                    {"job_start": job_start, "job_end": job_end, "count": count}
                )

                # Para economizar tempo só executa as operações de Summary a cada 5 jobs.
                summary = False
                if len(jobs) % 5 == 0:
                    summary = True

                #  Ultimo item sempre vai executar o summary
                if date == last_item:
                    summary = True

                # Submit Job
                job = self.add_new_job(job_start, job_end, owner, debug, summary)

                jobs.append(job.id)

                count = 0
                job_start = None
                job_end = None

        return Response(
            dict({"success": True, "job": jobs[0], "count": len(jobs), "bins": bins})
        )

    @action(detail=True, methods=["post"])
    def cancel_job(self, request, pk=None):
        """
        Aborta um Skybot job,
        cria um arquivo com o status 'aborted' e as daemons do pipeline checam este status e cancelam a execução.
        """

        job = self.get_object()

        # Se o job estiver idle=1 ou running=2
        if job.status <= 2:

            # Criar um arquivo no diretório do Job para indicar ao pipeline que foi abortado.
            data = dict(
                {"status": "aborted", "reason": "The job was aborted by the user."}
            )

            filepath = os.path.join(job.path, "status.json")
            with open(filepath, "w") as f:
                json.dump(data, f)

        result = SkybotJobSerializer(job)
        return Response(result.data)

    @action(detail=True)
    def heartbeat(self, request, pk=None):
        """
        Este endpoint monitora o progresso de um job.

        O Job cria dois arquivos: request_heartbeat.json e loaddata_heartbeat.json e vai salvando o progresso.

        Parameters:
            pk (int): id do job.

        Returns:
            result (json): json com dois objetos "request" e "loaddata" que remetem ao conteúdo dos arquivos de progresso.
        """

        # Instãncia do model SkybotJob pela chave primária:
        job = self.get_object()

        # Instância do DesSkybotPipeline
        pipeline = DesSkybotPipeline()

        # Ler arquivo request_heartbeat.json
        request = pipeline.read_request_heartbeat(job.path)

        # Ler arquivo loaddata_heartbeat.json
        loaddata = pipeline.read_loaddata_heartbeat(job.path)

        return Response(
            {
                "request": request,
                "loaddata": loaddata,
            }
        )

    @action(detail=False)
    def calc_execution_time(self, request):
        """
        Calcula o tempo estimado de execução para o skybot baseado na quantidade de exposições a serem executadas.

        Exemplo: http://localhost/api/des/skybot_job/calc_execution_time/?to_execute=500

        Parameters:
            to_execute (int): Quantidade de exposições a serem executadas.
        """
        to_execute = request.query_params.get("to_execute")

        estimated_time = self.estimate_execution_time(to_execute)

        return Response({"estimated_time": estimated_time})

    @action(detail=True)
    def time_profile(self, request, pk=None):
        """Retorna o Time Profile para um job que já foi concluido.
        le os arquivos requests e loaddata que estão no diretório do job,
        e retonra um array para cada um deles. no seguinte formato

        request: [['exposure', 'start', 'finish',
            'positions', 'execution_time'],...]
        loaddata: [['exposure', 'start', 'finish',
            'positions', 'execution_time'],...]

        """
        job = self.get_object()

        if job.status != 3:
            return Response(
                dict(
                    {
                        "success": False,
                        "message": "Time profile is only available for jobs with status completed.",
                    }
                )
            )

        # Instância do DesSkybotPipeline
        pipeline = DesSkybotPipeline()

        # Ler o arquivo de requests
        df_request = pipeline.read_request_dataframe(job.path)
        d_request = df_request.filter(
            ["exposure", "start", "finish", "positions", "execution_time"], axis=1
        ).values
        a_request = d_request.tolist()

        # Ler o arquivo de loaddata
        l_filepath = pipeline.get_loaddata_dataframe_filepath(job.path)
        df_loaddata = pipeline.read_loaddata_dataframe(l_filepath)
        d_loaddata = df_loaddata.filter(
            ["exposure", "start", "finish", "positions", "execution_time"], axis=1
        ).values
        a_loaddata = d_loaddata.tolist()

        return Response(
            dict(
                {
                    "success": True,
                    "columns": [
                        "exposure",
                        "start",
                        "finish",
                        "positions",
                        "execution_time",
                    ],
                    "requests": a_request,
                    "loaddata": a_loaddata,
                }
            )
        )

    def run_summary_result(self):
        summary_result = SummaryResult()

        summary_result.run_by_year()
        summary_result.run_by_dynclass()

    @action(detail=False)
    def test_update_dashboard(self, request, pk=None):

        t = threading.Thread(target=self.run_summary_result)
        t.setDaemon(True)
        t.start()

        return Response(
            {
                "success": True,
            }
        )

    @action(detail=True)
    def nites_success_or_fail(self, request, pk=None):
        """Retorna todas as datas que executaram com sucesso por completo e as que retornaram com no mínimo uma falha, dentro do periodo, que foram executadas pelo skybot.

        Exemplo: http://localhost/api/des/skybot_job/11/nites_success_or_fails/
        Returns:
            [array]: um array com todas as datas do periodo no formato [{date: '2019-01-01', count: 0, status: 0}]
                O atributo status pode ter 4 valores:
                    0 - para datas que não tem exposição;
                    1 - para datas que tem exposição mas não foram executadas;
                    2 - para datas que tem exposição, foram executadas e finalizaram com sucesso;
                    3 - para datas que tem exposição, foram executadas e finalizaram com erro.
        """

        job = self.get_object()

        file_path = os.path.join(job.path, "results.csv")

        if not os.path.exists(file_path):
            result = dict(
                {"results": [], "count": 0, "message": "No such file results.csv"}
            )
            return Response(result)

        job_result = pd.read_csv(
            file_path,
            delimiter=";",
            usecols=["date_obs", "success"],
            dtype={"success": bool, "date_obs": str},
        )

        job_result["date_obs"] = job_result["date_obs"].apply(lambda x: x.split()[0])

        job_result["count"] = 1

        # Group by "date_obs" so we know if that day failed or not
        df1 = job_result.groupby(by="date_obs", as_index=False).agg(
            {"count": "sum", "success": "sum"}
        )

        start = str(job.date_initial)
        end = str(job.date_final)

        all_dates = get_days_interval(start, end)

        # Verificar a quantidade de dias entre o start e end.
        if len(all_dates) < 7:
            dt_start = datetime.strptime(start, "%Y-%m-%d")
            dt_end = dt_start + timedelta(days=6)

            all_dates = get_days_interval(
                dt_start.strftime("%Y-%m-%d"), dt_end.strftime("%Y-%m-%d")
            )

        df1["date_obs"] = df1["date_obs"].astype(str)
        df1["success"] = df1["success"].astype(int)
        df1["count"] = df1["count"].astype(int)
        df1["failure"] = 0
        df1["status"] = 0

        df = pd.DataFrame(
            {
                "date_obs": pd.Series(dtype=str),
                "success": pd.Series(dtype=int),
                "count": pd.Series(dtype=int),
                "failure": pd.Series(dtype=int),
                "status": pd.Series(dtype=int),
            }
        )
        df["date_obs"] = all_dates

        df.update(df1)
        df = df.fillna(0)
        df = df.astype(
            dtype={
                "date_obs": str,
                "count": int,
                "success": int,
                "failure": int,
                "status": int,
            }
        )
        df["failure"] = df["count"] - df["success"]

        # Function that applies the value of the executed based on the comparison of 'success' and 'error' properties
        def apply_executed_value(row):
            if row["count"] > 0 and row["success"] == row["count"]:
                # para datas que tem exposição, foram executadas e finalizaram com sucesso;
                return 2
            elif row["count"] > 0 and row["failure"] != 0:
                # para datas que tem exposição, foram executadas e finalizaram com erro.
                return 3
            else:
                return 1

        df["status"] = df.apply(apply_executed_value, axis=1)
        df = df.rename(columns={"date_obs": "date"})

        result = df.to_dict("records")
        return Response(result)

    @action(detail=True)
    def exposures_that_fail(self, request, pk=None):

        page = request.query_params.get("page")
        page_size = request.query_params.get("pageSize")

        job = self.get_object()

        file_path = os.path.join(job.path, "results.csv")

        if not os.path.exists(file_path):
            result = dict(
                {"results": [], "count": 0, "message": "No such file results.csv"}
            )
            return Response(result)

        df_results = pd.read_csv(
            file_path,
            delimiter=";",
            usecols=["id", "date_obs", "success", "loaddata_error"],
            dtype={
                "id": str,
                "date_obs": str,
                "success": bool,
                "loaddata_error": str,
            },
        )
        # Filtra as exposições que falharam
        df_results = df_results[df_results["success"] == False]
        df_results = df_results.rename(
            columns={"id": "exposure_id", "loaddata_error": "error"}
        )

        # Paginação
        records = df_results.to_dict("records")
        paginator = Paginator(records, page_size)
        records = paginator.get_page(page)
        result = dict({"results": list(records), "count": df_results.shape[0]})
        return Response(result)
