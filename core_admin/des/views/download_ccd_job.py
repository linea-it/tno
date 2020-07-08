from datetime import datetime

from rest_framework import mixins, viewsets
from rest_framework.decorators import action
from rest_framework.response import Response

from des.dao import CcdDao, DownloadCcdJobResultDao
from des.models import DownloadCcdJob
from des.serializers import DownloadCcdJobSerializer


class DownloadCcdJobViewSet(mixins.RetrieveModelMixin,
                            mixins.ListModelMixin,
                            viewsets.GenericViewSet):
    """
        Este end point esta com os metodos de Create, Update, Delete desabilitados.
        estas operações vão ficar na responsabilidades do pipeline des/ccd/download.

        o Endpoint submit_job é responsavel por iniciar o pipeline que será executado em background.
    """
    queryset = DownloadCcdJob.objects.all()
    serializer_class = DownloadCcdJobSerializer
    ordering_fields = ('id', 'status', 'start', 'finish')
    ordering = ('-start',)

    @action(detail=False, methods=['post'])
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

        date_initial = params['date_initial']
        date_final = params['date_final']
        dynclass = params.get('dynclass', None)
        name = params.get('name', None)

        # Recuperar o usuario que submeteu o Job.
        owner = self.request.user

        # adicionar a hora inicial e final as datas
        start = datetime.strptime(
            date_initial, '%Y-%m-%d').strftime("%Y-%m-%d 00:00:00")
        end = datetime.strptime(
            date_final, '%Y-%m-%d').strftime("%Y-%m-%d 23:59:59")

        # # Recuperar o total de ccds no periodo.
        # t_ccds = CcdDao().count_ccds_by_period(
        #     '2019-01-01 00:00:00', '2019-01-31 23:59:59')

        # Criar um model Skybot Job
        job = DownloadCcdJob(
            owner=owner,
            date_initial=date_initial,
            date_final=date_final,
            # Job começa com Status Idle.
            status=1,

            dynclass=dynclass,
            name=name
        )
        job.save()

        result = DownloadCcdJobSerializer(job)

        return Response(result.data)

    @action(detail=True, methods=['get'])
    def heartbeat(self, request, pk=None):

        db = DownloadCcdJobResultDao()

        # Recupera o Job
        job = self.get_object()

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
        estimated_size = float(average_size * (job.ccds - t_executed))
        # Estimativa em segundos de quanto tempo ainda vai levar os downloads.
        estimated_time = float(average_time * (job.ccds - t_executed))

        result = dict({
            'status': job.status,
            'ccds': job.ccds,
            't_executed': t_executed,
            't_size': t_size,
            't_execution_time': t_execution_time,
            'average_size': average_size,
            'average_time': average_time,
            'estimated_size': estimated_size,
            'estimated_time': estimated_time
        })

        return Response(result)
