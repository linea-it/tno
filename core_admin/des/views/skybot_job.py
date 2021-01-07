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

import numpy as np

from des.summary import SummaryResult

import threading


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

        date_initial = params['date_initial']
        date_final = params['date_final']

        # Recuperar o usuario que submeteu o Job.
        owner = self.request.user

        # adicionar a hora inicial e final as datas
        start = datetime.strptime(
            date_initial, '%Y-%m-%d').strftime("%Y-%m-%d 00:00:00")
        end = datetime.strptime(
            date_final, '%Y-%m-%d').strftime("%Y-%m-%d 23:59:59")

        # Total de exposures não executadas no Periodo.
        t_exposures = DesSkybotJobResultDao(
            pool=False).count_not_exec_by_period(start, end)

        # TODO: Esses totais deveriam ser de Noites com exposições não executadas.
        # Recuperar o total de noites com exposição no periodo
        t_nights = ExposureDao(
            pool=False).count_not_exec_nights_by_period(start, end)

        # Recuperar o total de ccds no periodo.
        # TODO: Esses totais deveriam ser de CCDs com exposições não executadas.
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
    def nites_success_or_fail(self, request, pk=None):
        """Retorna todas as datas que executaram com sucesso por completo e as que retornaram com no mínimo uma falha, dentro do periodo, que foram executadas pelo skybot.

        Exemplo: http://localhost/api/des/skybot_job/11/nites_success_or_fails/
        Returns:
            [array]: um array com todas as datas do periodo no formato [{date: '2019-01-01', count: 0, executed: 0}]
                O atributo executed pode ter 4 valores:
                    0 - para datas que não tem exposição;
                    1 - para datas que tem exposição mas não foram executadas;
                    2 - para datas que tem exposição, foram executadas e finalizaram com sucesso;
                    3 - para datas que tem exposição, foram executadas e finalizaram com erro.
        """

        job = self.get_object()

        file_path = os.path.join(job.path, 'results.csv')

        job_result = pd.read_csv(file_path, delimiter=';', usecols=[
                                 'date_obs', 'success', 'request_error', 'loaddata_error'])

        job_result['date_obs'] = job_result['date_obs'].apply(
            lambda x: x.split()[0])

        job_result['count'] = 1

        # Sometimes the error property comes as a '0.0', even though it doesn't have an error,
        # So in here we replace it with np.nan to treat it later
        job_result['request_error'] = job_result['request_error'].apply(
            lambda x: np.nan if x == 0.0 else x)
        job_result['loaddata_error'] = job_result['loaddata_error'].apply(
            lambda x: np.nan if x == 0.0 else x)

        # Verify if either or both request or loadata failed, fill the property is_success with False, otherwise with True
        job_result['is_success'] = job_result[['request_error', 'loaddata_error']].apply(
            lambda row: True if np.isnan(row['request_error']) and np.isnan(row['loaddata_error']) else False, axis=1)

        job_result.drop(columns=['request_error', 'loaddata_error'])

        job_result['error'] = job_result['is_success'].apply(
            lambda x: 0 if x else 1)

        # Group by "date_obs" so we know if that day failed or not
        df1 = job_result.groupby(by='date_obs', as_index=False).agg(
            {'count': 'sum', 'error': 'sum', 'success': 'all', 'is_success': 'all'})

        # Function that applies the value of the attributes based on the comparison of 'success' and 'error' properties
        def apply_success_value(row):
            if row['success'] == True and row['is_success'] == True:
                return 2
            elif row['success'] == False and row['is_success'] == False:
                return 3
            else:
                return 1

        df1['success'] = df1.apply(apply_success_value, axis=1)

        df1.drop(columns=['is_success'])

        start = str(job.date_initial)
        end = str(job.date_final)

        all_dates = get_days_interval(start, end)

        # Verificar a quantidade de dias entre o start e end.
        if len(all_dates) < 7:
            dt_start = datetime.strptime(start, '%Y-%m-%d')
            dt_end = dt_start + timedelta(days=6)

            all_dates = get_days_interval(dt_start.strftime(
                "%Y-%m-%d"), dt_end.strftime("%Y-%m-%d"))

        df2 = pd.DataFrame()
        df2['date_obs'] = all_dates
        df2['success'] = 0
        df2['count'] = 0
        df2['error'] = 0

        df1['date_obs'] = df1['date_obs'].astype(str)
        df2['date_obs'] = df2['date_obs'].astype(str)

        df1['success'] = df1['success'].astype(int)
        df2['success'] = df2['success'].astype(int)

        df1['count'] = df1['count'].astype(int)
        df2['count'] = df2['count'].astype(int)

        df1['error'] = df1['error'].astype(int)
        df2['error'] = df2['error'].astype(int)

        for i, row in df1.iterrows():
            df2.loc[
                df2['date_obs'] == row['date_obs'],
                ['success', 'count']
            ] = row['success'], row['count']

        df = df2.rename(columns={'date_obs': 'date', 'success': 'executed'})

        result = df.to_dict('records')

        return Response(result)

    def run_summary_result(self):
        summary_result = SummaryResult()

        summary_result.run_by_year()
        summary_result.run_by_dynclass()

    @action(detail=False)
    def test_update_dashboard(self, request, pk=None):

        t = threading.Thread(target=self.run_summary_result)
        t.setDaemon(True)
        t.start()

        return Response({
            'success': True,
        })
