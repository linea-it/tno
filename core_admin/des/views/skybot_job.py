import json
import os
from datetime import datetime, timedelta

import pandas as pd
from rest_framework import mixins, viewsets
from rest_framework.decorators import action
from rest_framework.response import Response

from common.dates_interval import get_days_interval
from common.read_csv import csv_to_dataframe
from des.dao import CcdDao, DesSkybotJobResultDao, ExposureDao
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

    def estimate_execution_time(self, to_execute):

        dao = DesSkybotJobResultDao(pool=False)

        se = dao.skybot_estimate()

        try:
            average_time = se['t_exec_time'] / int(se['total'])
            estimated_time = (int(to_execute) * average_time).total_seconds()

        except:
            estimated_time = 0

        return estimated_time

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
        t_nights = ExposureDao(pool=False).count_nights_by_period(start, end)

        t_exposures = DesSkybotJobResultDao(
            pool=False).count_not_exec_by_period(start, end)

        # Recuperar o total de ccds no periodo.
        t_ccds = CcdDao().count_ccds_by_period(start, end)

        estimated_time = self.estimate_execution_time(t_exposures)

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
            # Total de exposures a serem executadas.
            exposures=t_exposures,
            # Tempo de execução estimado
            estimated_execution_time=timedelta(seconds=estimated_time)
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
            "loaddata": loaddata,
        })

    @action(detail=False)
    def calc_execution_time(self, request):
        """
            Calcula o tempo estimado de execução para o skybot baseado na quantidade de exposições a serem executadas.

            Exemplo: http://localhost/api/des/skybot_job/calc_execution_time/?to_execute=500

            Parameters:
                to_execute (int): Quantidade de exposições a serem executadas.
        """
        to_execute = request.query_params.get('to_execute')

        estimated_time = self.estimate_execution_time(to_execute)

        return Response({
            'estimated_time': estimated_time
        })

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

    @action(detail=True)
    def dynclass_counts(self, request, pk=None):
        """Retorna a quantidade de objetos unicos, ccds e posições agrupados por dynamic class.

        Exemplo: http://localhost/api/des/skybot_job/91/dynclass_asteroids/

        Returns:
            [array]: um array de objetos com a dynamic class e a quantidade de objetos, ccds e possições associadas a ela.
                [{"dynclass": "Centaur","asteroids": 1,
                    "ccds": 35,"positions": 35}, {...},]
        """
        job_id = self.get_object().id

        dao = DesSkybotJobResultDao(pool=False)

        try:
            asteroids = dao.dynclass_asteroids_by_job(job_id)
            ccds = dao.dynclass_ccds_by_job(job_id)
            positions = dao.dynclass_positions_by_job(job_id)

            df_asteroids = pd.DataFrame(asteroids)
            df_asteroids.set_index('dynclass')
            df_asteroids = df_asteroids.fillna(0)

            df_ccds = pd.DataFrame(ccds)
            df_ccds.set_index('dynclass')
            df_ccds = df_ccds.fillna(0)

            df_positions = pd.DataFrame(positions)
            df_positions.set_index('dynclass')
            df_positions = df_positions.fillna(0)

            df = pd.concat([df_asteroids, df_ccds, df_positions], axis=1)
            df = df.fillna(0)
            df = df.rename(columns={'index': 'dynclass'})

            df['g'] = 0
            df['r'] = 0
            df['i'] = 0
            df['z'] = 0
            df['Y'] = 0
            df['u'] = 0

            # Remove as colunas duplicadas
            df = df.loc[:, ~df.columns.duplicated()]

            for i in range(len(df)):
                dynclass = str(df.iloc[i, 0])
                bands = dao.dynclass_band_by_job(job_id, dynclass)

                for band in bands:
                    df.at[i, str(band['band'])] = int(band['positions'])

            result = df.to_dict('records')
        except:
            result = list()

        return Response(result)
