from praia.models import Run
from django.db.models import Count
from rest_framework.response import Response
from rest_framework.decorators import api_view, permission_classes
from rest_framework.permissions import AllowAny
import pandas as pd
import humanize
import os
import csv


from praia.models import Run
import logging
import requests
from tno.condor import check_condor_job, check_job_history
from datetime import datetime
from praia.pipeline.register import register_astrometry_outputs, finish_astrometry_run
logger = logging.getLogger("astrometry")


def update_status(job, condor_job):
    """
        Condor status
        0 - 'Unexpanded'
        1 - 'Idle'
        2 - 'Running'
        3 - 'Removed' 
        4 - 'Completed' 
        5 - 'Held' 
        6 - 'Submission'

    """
    logger.debug("Condor Job Status: %s " % condor_job['JobStatus'])

    job.global_job_id = condor_job['GlobalJobId']
    job.job_status = int(condor_job['JobStatus'])

    if 'ClusterName' in condor_job:
        job.cluster_name = condor_job['ClusterName']

    if 'RemoteHost' in condor_job:
        job.remote_host = condor_job['RemoteHost']

    if 'Args' in condor_job:
        job.args = condor_job['Args']

    if 'JobStartDate' in condor_job:
        job.start_time = datetime.fromtimestamp(int(condor_job['JobStartDate'])) 

    if condor_job['JobStatus'] == '1':
        logger.debug("Job in Idle")

        job.asteroid.status = 'idle'
        job.asteroid.save()

    elif condor_job['JobStatus'] == '2':
        logger.debug("Job Running")
        job.asteroid.status = 'running'
        job.asteroid.save()

    elif condor_job['JobStatus'] == '4':
        logger.debug("Job Completed")

        finish_time = datetime.fromtimestamp(int(condor_job['CompletionDate'])) 
        job.finish_time = finish_time
        job.execution_time = finish_time - job.start_time

        job.save()

        register_astrometry_outputs(job.astrometry_run.pk, job.asteroid.name)

    elif condor_job['JobStatus'] == '5':
        logger.debug("Job Hold")
        job.asteroid.status = 'failure'
        job.asteroid.error_msg = "Condor job has a Hold status and has not been executed. Check the condor log for more details."
        job.asteroid.save()

        # TODO Remover do Condor jobs em Hold

    else:
        logger.debug("Job with untreated status. JobStatus [%s] " % condor_job['JobStatus'])
        job.asteroid.status = 'failure'
        job.asteroid.error_msg = "job in the condor returned a status not handled by the application. Check the condor log for more details."


    job.save()



@api_view(['GET'])
@permission_classes([AllowAny])
def teste_register(request):
    if request.method == 'GET':

        # register_astrometry_outputs(80, 'Eris')

        # finish_astrometry_run(80)

        result = dict({
            'success': True,
        })

    return Response(result)


@api_view(['GET'])
def teste(request):
    if request.method == 'GET':
        logger.debug("------------------------------------")
        # Saber as Rodadas de Astrometria que estão com status running e que estejam no Step Astrometry.
        runs = Run.objects.filter(status='running', step=3)

        logger.debug(runs)

        # Para cada running recupera os jobs
        for astrometry_run in runs:

            jobs = astrometry_run.condor_jobs.all().exclude(job_status__gt=2)

            if jobs.count() > 0:
                # Para cada Job verifica o status no Cluster
                for job in jobs:
                    logger.debug(job)
                    result = check_condor_job(job.clusterid, job.procid)

                    if result is None:
                        # Busca informacao do job no history do condor
                        jobHistory = check_job_history(job.clusterid, job.procid)
                        
                        update_status(job, jobHistory)
                    else:
                        if int(result['JobStatus']) != int(job.job_status):
                            update_status(job, result)
            else:
                # Registra o Final da execucao.
                # TODO condicao para o final da execucao esta errado
                # Cai no else antes dos jobs iniciarem
                # finish_astrometry_run(astrometry_run.pk)
                pass

        logger.debug("------------------------------------")

        result = dict({
            'success': True,
        })

    return Response(result)


@api_view(['GET'])
def import_skybot(request):
    """
    """
    if request.method == 'GET':

        from tno.skybot import ImportSkybot

        sk = ImportSkybot()

        # Funcao para consumir o servico skybot
        # sk.import_skybot()
        # Funcão para registrar o Skybot output
        sk.register_skybot_output()

        result = dict({
            'success': True,
        })
    return Response(result)


@api_view(['GET'])
def read_file(request):
    """ 
    Function to read .log file 
    A filepath parameter is obrigatory to display the file. 
    """
    if request.method == 'GET':

        # Recuperar o filepath do arquivo a ser lido dos parametros da url.
        filepath = request.query_params.get('filepath', None)

        # Verificar se o parametro nao esta vazio, se estiver retorna mensagem avisando.
        if filepath == None or filepath == '':
            return Response(dict({
                'success': False,
                'message': 'filepath parameter obrigatory'
            }))

        # Verificar se o arquivo existe, se nao existir retorna mensagem avisando.
        if not os.path.exists(filepath):
            return Response(dict({
                'success': False,
                'message': 'filepath do not exist. (%s)' % filepath
            }))

        # Ler o arquivo.
        try:
            rows = list()
            with open(filepath) as fp:
                lines = fp.readlines()
                for line in lines:
                    rows.append(line.replace('\n', '').strip())

            return Response(dict({
                'success': True,
                'rows': rows,
                'filepath': filepath,
            }))
        except IOError as e:
            return Response(dict({
                'success': False,
                'message': "I/O error({0}): {1}".format(e.errno, e.strerror)
            }))


@api_view(['GET'])
def read_csv(request):
    """ 
    Function to read .csv file 
    A filepath parameter is obrigatory to display the file. 
    this view can be paginated, with page and pageSize parameters. 

    eg: http://localhost/api/read_csv?filepath=/proccess/78/objects/Eris/gaia_dr2.csv&page=2&pageSize=5&format=json

    for this exemple will be returned 5 rows for page 2.

    """
    if request.method == 'GET':

        # Recuperar o filepath do arquivo a ser lido dos parametros da url.
        filepath = request.query_params.get('filepath', None)
        page = int(request.query_params.get('page', 1))
        pageSize = int(request.query_params.get(
            'pageSize', 100))

        # Verificar se o parametro nao esta vazio, se estiver retorna mensagem avisando.
        if filepath == None or filepath == '':
            return Response(dict({
                'success': False,
                'message': 'filepath parameter obrigatory'
            }))

        # Verificar se o arquivo existe, se nao existir retorna mensagem avisando.
        if not os.path.exists(filepath):
            return Response(dict({
                'success': False,
                'message': 'filepath do not exist. (%s)' % filepath
            }))
            #    implementar paginacao na funcao csv
        if page == 1:
            skiprows = 1
        else:
            skiprows = (page * pageSize) - pageSize

        df_temp = pd.read_csv(filepath, delimiter=';')
        columns = list()
        for col in df_temp.columns:
            columns.append(col)

        count = df_temp.shape[0]
        del df_temp

        # Ler o arquivo.
        df = pd.read_csv(
            filepath,
            names=columns,
            delimiter=';',
            skiprows=skiprows,
            nrows=pageSize)

        df = df.fillna(0)

        rows = list()
        for record in df.itertuples():
            row = dict({})

            for header in columns:
                row[header] = getattr(record, header)

            rows.append(row)

        result = dict({
            'success': True,
            'filepath': filepath,
            'columns': columns,
            'rows': rows,
            'count': count
        })

    return Response(result)
