import json
import os
from datetime import datetime

from rest_framework import mixins, viewsets
from rest_framework.decorators import action
from rest_framework.response import Response

from common.dates_interval import get_days_interval
from common.read_csv import csv_to_dataframe
from des.dao import CcdDao, ExposureDao
from des.models import SkybotJob
from des.serializers import SkybotJobSerializer
from des.skybot.pipeline import DesSkybotPipeline


class SkybotJobViewSet(mixins.RetrieveModelMixin,
                       mixins.ListModelMixin,
                       viewsets.GenericViewSet):
    """
        Este end point esta com os metodos de Create, Update, Delete desabilitados.
        estas operações vão ficar na responsabilidades do pipeline des/skybot.

        o Endpoint submit_job é responsavel por iniciar o pipeline que será executado em background.
    """
    queryset = SkybotJob.objects.all()
    serializer_class = SkybotJobSerializer
    ordering_fields = ('id', 'status', 'start', 'finish')
    ordering = ('-start',)

    @action(detail=False, methods=['post'])
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

        # TODO: Criar metodo para validar os perios.
        # e checar se o periodo ainda não foi executado.
        date_initial = params['date_initial']
        date_final = params['date_final']

        # Recuperar o usuario que submeteu o Job.
        owner = self.request.user

        # adicionar a hora inicial e final as datas
        start = datetime.strptime(
            date_initial, '%Y-%m-%d').strftime("%Y-%m-%d 00:00:00")
        end = datetime.strptime(
            date_final, '%Y-%m-%d').strftime("%Y-%m-%d 23:59:59")

        # Recuperar o total de noites com exposição no periodo
        t_nights = ExposureDao().count_nights_by_period(start, end)

        # Recuperar o total de ccds no periodo.
        t_ccds = CcdDao().count_ccds_by_period(
            '2019-01-01 00:00:00', '2019-01-31 23:59:59')

        # Criar um model Skybot Job
        job = SkybotJob(
            owner=owner,
            date_initial=date_initial,
            date_final=date_final,
            # Job começa com Status Idle.
            status=1,
            # Total de noites com exposições.
            nights=t_nights,
            # Total de CCDs no periodo
            ccds=t_ccds,
        )
        job.save()

        result = SkybotJobSerializer(job)

        return Response(result.data)

    @action(detail=True, methods=['post'])
    def cancel_job(self, request, pk=None):
        """
            Aborta um Skybot job,
            cria um arquivo com o status 'aborted' e as daemons do pipeline checam este status e cancelam a execução.
        """

        job = self.get_object()

        # Se o job estiver idle=1 ou running=2
        if job.status <= 2:

            # Criar um arquivo no diretório do Job para indicar ao pipeline que foi abortado.
            data = dict({
                'status': 'aborted',
            })

            filepath = os.path.join(job.path, 'status.json')
            with open(filepath, 'w') as f:
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

        return Response({
            "request": request,
            "loaddata": loaddata
        })

    @action(detail=True)
    def time_profile(self, request, pk=None):
        """Retorna o Time Profile para um job que já foi concluido.
        le os arquivos requests e loaddata que estão no diretório do job,
        e retonra um array para cada um deles. no seguinte formato

        request: [['exposure', 'start', 'finish', 'positions', 'execution_time'],...]
        loaddata: [['exposure', 'start', 'finish', 'positions', 'execution_time'],...]

        """
        job = self.get_object()

        if job.status != 3:
            return Response(dict({
                'success': False,
                'message': "Time profile is only available for jobs with status completed."
            }))

        # Instância do DesSkybotPipeline
        pipeline = DesSkybotPipeline()

        # Ler o arquivo de requests
        df_request = pipeline.read_request_dataframe(job.path)
        d_request = df_request.filter(
            ['exposure', 'start', 'finish', 'positions', 'execution_time'], axis=1).values
        a_request = d_request.tolist()

        # Ler o arquivo de loaddata
        l_filepath = pipeline.get_loaddata_dataframe_filepath(job.path)
        df_loaddata = pipeline.read_loaddata_dataframe(l_filepath)
        d_loaddata = df_loaddata.filter(
            ['exposure', 'start', 'finish', 'positions', 'execution_time'], axis=1).values
        a_loaddata = d_loaddata.tolist()

        return Response(dict({
            'success': True,
            'columns': ['exposure', 'start', 'finish', 'positions', 'execution_time'],
            'requests': a_request,
            'loaddata': a_loaddata
        }))
