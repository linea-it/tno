from datetime import datetime

from rest_framework import mixins, viewsets
from rest_framework.decorators import action
from rest_framework.response import Response

from des.dao import CcdDao, DownloadCcdJobResultDao
from des.models import DownloadCcdJob
from des.serializers import DownloadCcdJobSerializer


class DownloadCcdJobViewSet(
    mixins.RetrieveModelMixin, mixins.ListModelMixin, viewsets.GenericViewSet
):
    """
    Este end point esta com os metodos de Create, Update, Delete desabilitados.
    estas operações são responsabilidades do pipeline des/ccd/download.

    o Endpoint submit_job é responsavel por iniciar o pipeline que será executado em background.
    """

    queryset = DownloadCcdJob.objects.all()
    serializer_class = DownloadCcdJobSerializer
    ordering_fields = ("id", "status", "start", "finish")
    ordering = ("-start",)

    @action(detail=False, methods=["post"])
    def submit_job(self, request, pk=None):
        """
        Este endpoint apenas cria um novo registro na tabela Des/Download CCD Job.

        O Job é criado com status idle. uma daemon verifica
        de tempos em tempos os jobs neste status e inicia o processamento.

        Parameters:
            date_initial (datetime): data inicial usada para selecionar os CCDs que serão processadas.

            date_final (datetime): data Final usado para selecionar os CCDs que serão processadas

        Returns:
            job (DownloadCcdJobSerializer): Job que acabou de ser criado.
        """
        params = request.data

        date_initial = params["date_initial"]
        date_final = params["date_final"]
        dynclass = params.get("dynclass")
        name = params.get("name", None)

        # Recuperar o usuario que submeteu o Job.
        owner = self.request.user

        # adicionar a hora inicial e final as datas
        start = datetime.strptime(date_initial, "%Y-%m-%d").strftime(
            "%Y-%m-%d 00:00:00"
        )
        end = datetime.strptime(date_final, "%Y-%m-%d").strftime("%Y-%m-%d 23:59:59")

        # Criar um model Skybot Job
        job = DownloadCcdJob(
            owner=owner,
            date_initial=date_initial,
            date_final=date_final,
            # Job começa com Status Idle.
            status=1,
            dynclass=dynclass,
            name=name,
        )
        job.save()

        result = DownloadCcdJobSerializer(job)

        return Response(result.data)

    @action(detail=True, methods=["get"])
    def heartbeat(self, request, pk=None):
        """Retorna as estatisticas do Job como status e quantidade de ccds baixados.

        Returns:
            (dict): Resumo da situação atual do Job, no seguinte formato:
                {
                    'status': (int) Status atual do job,
                    'ccds': (int) Quantidade total de ccds a serem baixados,
                    't_executed': (float) Quantidade de ccds já baixados,
                    't_size': (float) tamanho total em bytes dos ccds já baixados,
                    't_execution_time': (float) tempo total gasto no download,
                    'average_size': (float) tamanho médio dos ccds em bytes,
                    'average_time': (float) tempo médio de download dos ccds,
                    'estimated_size': (float) tamanho estimado para os ccds que ainda faltam fazer o download,
                    'estimated_time': (float) tempo estimado para os ccds que ainda faltam fazer o download.
                }
        """

        db = DownloadCcdJobResultDao()

        # Recupera o Job
        job = self.get_object()

        result = dict(
            {
                "status": job.status,
                "ccds": job.ccds_to_download,
                "t_executed": 0,
                "t_size": 0,
                "t_execution_time": 0,
                "average_size": 0,
                "average_time": 0,
                "estimated_size": 0,
                "estimated_time": 0,
            }
        )

        try:
            # Total de ccds já baixados.
            t_executed = db.count_by_job(job.id)
            # Tamanho total em bytes dos ccds já baixados.
            t_size = db.file_size_by_job(job.id)
            # Tempo total gasto com download dos ccds.
            t_execution_time = db.execution_time_by_job(job.id).total_seconds()
            # tamanho médio de cada download.
            average_size = float(t_size / t_executed)
            # Tempo médio de cada download
            average_time = float(t_execution_time / t_executed)
            # Estimativa em bytes de quanto falta baixar
            estimated_size = float(average_size * (job.ccds_to_download - t_executed))
            # Estimativa em segundos de quanto tempo ainda vai levar os downloads.
            estimated_time = float(average_time * (job.ccds_to_download - t_executed))

            result.update(
                {
                    "t_executed": t_executed,
                    "t_size": t_size,
                    "t_execution_time": t_execution_time,
                    "average_size": average_size,
                    "average_time": average_time,
                    "estimated_size": estimated_size,
                    "estimated_time": estimated_time,
                }
            )

        except Exception:
            # Pode ocorrer execão durante o periodo que não tem resultado nenhum.
            # ou o job ainda não foi iniciado.
            pass

        return Response(result)
