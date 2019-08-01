from praia.models import Run
from django.db.models import Count
from rest_framework.response import Response
from rest_framework.decorators import api_view
import pandas as pd
import humanize
import os
import csv


from praia.models import Run
import logging
import requests
from tno.condor import check_condor_job

logger = logging.getLogger("astrometry")


# def check_condor_job(cluster_id, proc_id):
#     logger.debug("check_condor_job: ClusterId: [%s]" % cluster_id)

#     try:
#         r = requests.get('http://loginicx.linea.gov.br:5000/jobs', params={
#             'ClusterId': cluster_id,
#             'ProcId': proc_id
#         })

#         if r.status_code == requests.codes.ok:
#             logger.debug(r.json())
#             rows = r.json()
#             if len(rows) == 1:
#                 return rows[0]
#             else:
#                 return None
#         else:
#             # TODO tratar falha na requisicao
#             logger.error("Falha na requisicao")

#     except Exception as e:
#         logger.error(e)
#         raise


@api_view(['GET'])
def teste(request):
    if request.method == 'GET':

        # Saber as Rodadas de Astrometria que estão com status running.
        runs = Run.objects.filter(status='running')

        logger.debug(runs)
        # Para cada running recupera os jobs
        for astrometry_run in runs:

            jobs = astrometry_run.condor_jobs.all()

            # Para cada Job verifica o status no Cluster
            for job in jobs:
                logger.debug(job)
                result = check_condor_job(job.clusterid, job.procid)

                logger.debug(result)
                if result is None:
                    logger.debug("Parece que acabou")
                else:
                    if result['JobStatus'] != job.job_status:
                        logger.debug("Status Diferente fazer alguma coisa")

                    


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
