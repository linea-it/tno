import csv
import logging
import os
import zipfile
import zlib
from datetime import datetime

import humanize
import pandas as pd
import requests
from django.conf import settings
from django.db.models import Count
from django.http import HttpResponse
from rest_framework.decorators import api_view, permission_classes
from rest_framework.permissions import AllowAny
from rest_framework.response import Response
from django.shortcuts import redirect
from praia.models import Run
from praia.pipeline.register import check_astrometry_running, register_astrometry_outputs
from django.contrib.auth import authenticate, login
from tno.auth_shibboleth import ShibbolethBackend
from django.contrib.auth.models import User
from django.contrib.auth import logout


@api_view(['GET'])
def teste(request):
    if request.method == 'GET':

        # Test Skybot load data daemon
        # from tno.skybot.new_load_data import DesImportSkybotOutput

        # result = DesImportSkybotOutput().import_output_file("/archive/skybot_output/1/808801_Y.csv")

        from des.skybot.pipeline import DESImportSkybotPositions
        from des.models import DownloadCcdJobResult
        from des.models import SkybotJob
        from datetime import datetime, timedelta, timezone
        import logging
        log = logging.getLogger('django')
        log.info("-----------TESTE----------------")

        from des.ccd import start_pipeline, plot_time_profile
        from des.dao import DownloadCcdJobDao
        from des.dao import DownloadCcdJobResultDao

        # a = DownloadCcdJobResultDao().execution_time_by_job(1)
        # log.info(a)

        plot_time_profile('/ccd_images/download_jobs/job_1/results.csv',
                          '/ccd_images/download_jobs/job_1/')

        # #  ----------------------------------------------------------
        # #  Resetando o Job antes do teste
        # db = DownloadCcdJobDao(pool=False)
        # job = db.get_by_id(1)
        # job['status'] = 1
        # job['start'] = datetime.now(timezone.utc)
        # job['path'] = None
        # db = db.update_record(job)

        # # Limpando o diretório antes do teste
        # folder = '/archive/ccd_images'
        # for filename in os.listdir(folder):
        #     file_path = os.path.join(folder, filename)
        #     try:
        #         if os.path.isfile(file_path) or os.path.islink(file_path):
        #             os.unlink(file_path)
        #         elif os.path.isdir(file_path):
        #             shutil.rmtree(file_path)
        #     except Exception as e:
        #         print('Failed to delete %s. Reason: %s' % (file_path, e))

        # # Limpa a tabela de resultados antes do teste.
        # DownloadCcdJobResult.objects.all().delete()

        # #  Iniciando o Pipeline
        # start_pipeline()
        # #  ----------------------------------------------------------

        # from des.dao import DesSkybotPositionDao

        # rows = DesSkybotPositionDao().ccds_for_position(
        #     '2019-01-01 00:00:00', '2019-01-31 23:59:59', 'KBO')

        # log.info(len(rows))
        # log.info(rows[0:5])

        # from des.dao import ExposureDao, CcdDao
        # from des.models import DownloadCcdJobResult
        # import os
        # import shutil

        # # Limpara o diretório antes do teste

        # folder = '/archive/ccd_images'
        # for filename in os.listdir(folder):
        #     file_path = os.path.join(folder, filename)
        #     try:
        #         if os.path.isfile(file_path) or os.path.islink(file_path):
        #             os.unlink(file_path)
        #         elif os.path.isdir(file_path):
        #             shutil.rmtree(file_path)
        #     except Exception as e:
        #         print('Failed to delete %s. Reason: %s' % (file_path, e))

        # from des.ccd import download_des_ccds

        # ccds = CcdDao().ccds_by_period('2019-01-01 00:00:00', '2019-01-31 23:59:59')
        # log.debug(len(ccds))

        # # Limpa a tabela de resultados antes do teste.
        # DownloadCcdJobResult.objects.all().delete()

        # download_des_ccds(1, ccds[0:10])

        result = dict({
            'success': True,
        })

        return Response(result)


@api_view(['GET'])
def logout_view(request):
    logout(request)

    # Redireciona para a home
    home = settings.HOST_URL
    response = redirect(home)

    return response


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


@api_view(['GET'])
def download_file(request):
    """
    Function to download a file and zip.

    http://localhost:7001/api/teste/?filepath=/archive/tmp/teste.csv

    When the file is bigger than 1Mb, the file is zipped.
    """
    if request.method == 'GET':
        # Funcao para fazer download de um arquivo

        # Recuperar o filepath do arquivo a ser lido dos parametros da url.
        filepath = request.query_params.get('filepath', None)

        if not os.path.exists(filepath):
            raise Exception("File do not exist")

        # Checar o tamanho do arquivo
        size = os.path.getsize(filepath)

        maxSize = 1000000

        # Se o arquivo for maior que x
        if size > maxSize:
            # criar uma nova variavel com o path para o arquivo zip
            filename = os.path.basename(filepath)
            filename = filename + '.zip'
            new_file = os.path.join(settings.MEDIA_TMP_DIR, filename)

            # Comprime o arquivo e retorna o arquivo comprimido
            with zipfile.ZipFile(new_file, 'w') as myzip:
                myzip.write(filepath, compress_type=zipfile.ZIP_DEFLATED)

            # Retornar o arquivo zipado
            with open(new_file, 'rb') as fh:
                response = HttpResponse(
                    fh.read(), content_type="application/octet-stream")
                response['Content-Disposition'] = 'inline; filename=' + \
                    os.path.basename(new_file)
                return response
        else:

            with open(filepath, 'rb') as fh:
                response = HttpResponse(
                    fh.read(), content_type="application/octet-stream")
                response['Content-Disposition'] = 'inline; filename=' + \
                    os.path.basename(filepath)
                return response


@api_view(['GET'])
@permission_classes([AllowAny])
def auth_shibboleth(request):

    logger = logging.getLogger('auth_shibboleth')
    logger.info("---------------------------------------------------------")
    logger.info("Shibboleth Authentication Endpoint")

    if request.method == 'GET':
        logger.debug(request.query_params)

        logger.debug("Is Authenticated: %s" % request.user.is_authenticated)

        if not request.user.is_authenticated:
            try:
                data = request.query_params
                sid = data['sid']
                logger.debug("Session ID: %s" % sid)

            except KeyError:
                logger.error("Parameter \"sid\"  session id  is unknown.")

            # Fazer o parse do arquivo de sessao antes de chamar o authenticate
            try:
                session_data = ShibbolethBackend().read_session_file(sid)
            except Exception as e:
                logger.error(e)
            finally:
                # Deletar o aquivo de sessao
                ShibbolethBackend().destroy_session_file(sid)

            try:
                # TODO: melhorar a checagem de authenticacao. verificar mais atributos como a origem por exemplo.
                # Tenta autenticar o usuario com os dados da sessao
                user = ShibbolethBackend().authenticate(
                    request, session_data, username=None, password=None)

                # Setar o tempo de expiracao da sessao, necessario ser feito antes do login
                # baseado nesta resposta https://stackoverflow.com/a/27062144/9063237
                # a data de expiração está em Unix epoch time. conversor de epoch online util para testes: https://www.epochconverter.com/
                request.session.expire_date = session_data.get(
                    'Shib-Session-Expires')

                # Efetua o Login
                login(request, user, backend='tno.auth_shibboleth.ShibbolethBackend')

            except Exception as e:
                logger.error(e)
                logger.error("User not found, authentication failed.")

        else:
            # TODO: Revisar esta parte pode haver inconsistencias.
            logger.info("User is already logged in does nothing.")

        # Just Checking if is authenticated
        logger.info("Is Authenticated: %s" %
                    request.user.is_authenticated)

    # Redireciona para a home
    home = settings.HOST_URL
    logger.info("Redirect to Home: [ %s:%s ]" % (request.scheme, home))
    response = redirect(home)

    return response
