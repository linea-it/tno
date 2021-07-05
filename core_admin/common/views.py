from datetime import date, timedelta, datetime
import math
from astropy.coordinates import SkyCoord, EarthLocation, GCRS
import numpy as np
import spiceypy as spice
from astropy.time import Time
from astropy import units as u
import csv
import logging
import os
import shutil
import zipfile
import zlib
from datetime import datetime, timedelta, timezone

import humanize
import pandas as pd
import requests
from django.conf import settings
from django.contrib.auth import authenticate, login, logout
from django.contrib.auth.models import User
from django.db.models import Count
from django.http import HttpResponse
from django.shortcuts import redirect
from rest_framework.decorators import api_view, permission_classes
from rest_framework.permissions import AllowAny
from rest_framework.response import Response

from praia.models import Run
from praia.pipeline.register import (check_astrometry_running,
                                     register_astrometry_outputs)
from tno.auth_shibboleth import ShibbolethBackend


@api_view(['GET'])
def teste(request):
    if request.method == 'GET':

        # Teste de envio de email
        # from common.notify import Notify
        # from django.template.loader import render_to_string

        # from des.dao import DesSkybotJobResultDao

        # asteroids = DesSkybotJobResultDao(
        #     pool=False).dynclass_asteroids_by_job(91)
        # ccds = DesSkybotJobResultDao(pool=False).dynclass_ccds_by_job(91)
        # positions = DesSkybotJobResultDao(
        #     pool=False).dynclass_positions_by_job(91)

        # import pandas as pd

        # df_asteroids = pd.DataFrame(asteroids)
        # df_asteroids.set_index('dynclass')
        # df_asteroids = df_asteroids.fillna(0)

        # df_ccds = pd.DataFrame(ccds)
        # df_ccds.set_index('dynclass')
        # df_ccds = df_ccds.fillna(0)

        # df_positions = pd.DataFrame(positions)
        # df_positions.set_index('dynclass')
        # df_positions = df_positions.fillna(0)

        # df = pd.concat([df_asteroids, df_ccds, df_positions], axis=1)
        # df = df.fillna(0)
        # df = df.rename(columns={'index': 'dynclass'})

        # result = df.to_dict('records')

        #     pool=False).t_exposures_with_objects_by_job(72)
        # d = DesSkybotJobResultDao(
        #     pool=False).t_ccds_with_objects_by_job(72)

        # e = DesSkybotJobResultDao(
        #     pool=False).dynclass_asteroids_by_job(72)

        # a = DesSkybotJobResultDao(pool=False).t_ccds_with_objects_by_id(7643)

        # b = DesSkybotJobResultDao(pool=False).dynclass_asteroids_by_id(7643)

        # #  ----------------------------------------------------------
        # Test Skybot load request
        from des.skybot import DesSkybotPipeline
        import logging
        log = logging.getLogger('skybot')
        log.info("Resetando o Job para Iniciar o teste")

        job_id = 119
        DesSkybotPipeline().reset_job_for_test(job_id)
        DesSkybotPipeline().run_job(job_id)

        # DesSkybotPipeline().run_import_positions(job_id)

        # DesSkybotPipeline().consolidate(job_id)

        # #  ----------------------------------------------------------
        # from des.skybot.pipeline import DESImportSkybotPositions
        # from des.models import DownloadCcdJobResult
        # from des.models import SkybotJob
        # from datetime import datetime, timedelta, timezone
        # import logging
        # log = logging.getLogger('django')
        # log.info("-----------TESTE----------------")

        # from des.ccd import start_pipeline, plot_time_profile
        # from des.dao import DownloadCcdJobDao
        # from des.dao import DownloadCcdJobResultDao

        # # a = DownloadCcdJobResultDao().execution_time_by_job(1)
        # # log.info(a)

        # # plot_time_profile('/ccd_images/download_jobs/job_1/results.csv',
        # #                   '/ccd_images/download_jobs/job_1/')

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


@ api_view(['GET'])
def logout_view(request):
    logout(request)

    # Redireciona para a home
    home = settings.HOST_URL
    response = redirect(home)

    return response


@ api_view(['GET'])
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


@ api_view(['GET'])
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


@ api_view(['GET'])
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


@ api_view(['GET'])
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


@ api_view(['GET'])
@ permission_classes([AllowAny])
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


def findSPKID(bsp):
    '''
    Search the spk id of a small Solar System object from bsp file
    '''
    if isinstance(bsp, str):
        bsp = [bsp]
    spice.furnsh(bsp)
    kind = 'spk'
    fillen = 256
    typlen = 33
    srclen = 256
    keys = ['Target SPK ID   :', 'ASTEROID_SPK_ID =']
    n = len(keys[0])
    codes = dict()
    for i in range(len(bsp)):
        name, kind, source, loc = spice.kdata(i, kind, fillen, typlen, srclen)
        flag = False
        spk = ''
        while not flag:
            try:
                m, header, flag = spice.dafec(loc, 1)
                row = header[0]
                if row[:n] in keys:
                    spk = row[n:].strip()
                    break
            except:
                break
        codes[name] = spk
    spice.kclear()
    return codes


def geoTopoVector(longitude, latitude, elevation, jd):
    '''
    Transformation from [longitude, latitude, elevation] to [x,y,z]
    '''
    loc = EarthLocation(longitude, latitude, elevation)
    time = Time(jd, scale='utc', format='jd')
    itrs = loc.get_itrs(obstime=time)
    gcrs = itrs.transform_to(GCRS(obstime=time))
    r = gcrs.cartesian
    # convert from m to km
    x = r.x.value/1000.0
    y = r.y.value/1000.0
    z = r.z.value/1000.0
    return np.array([x, y, z])


def computePosition(name, datesJD, bsp, dexxx, leapSec, location):
    spkCodes = findSPKID(bsp)
    # print(spkCodes)
    spk = spkCodes[bsp]
    # print(spk)
    #spk = '02136199'
    # Load the asteroid and planetary ephemeris and the leap second (in order)
    spice.furnsh(dexxx)
    spice.furnsh(leapSec)
    spice.furnsh(bsp)
    # Convert dates from JD to et format. "JD" is added due to spice requirement
    dateET = [spice.utc2et(str(jd) + " JD UTC") for jd in datesJD]
    # Compute geocentric positions (x,y,z) in km for each date with light time correction
    rAst, ltAst = spice.spkpos(spk, dateET, 'J2000', 'LT', '399')
    lon, lat, ele = location
    listRA, listDec = [], []
    for dateJD, r_geo in zip(datesJD, rAst):
        # Convert from geocentric to topocentric coordinates
        r_topo = r_geo - geoTopoVector(lon, lat, ele, float(dateJD))
        # Convert rectangular coordinates (x,y,z) to range, right ascension, and declination.
        d, rarad, decrad = spice.recrad(r_topo)
        # Transform RA and Decl. from radians to degrees.
        listRA.append(np.degrees(rarad))
        listDec.append(np.degrees(decrad))
    spice.kclear()
    return listRA, listDec


def date_to_jd(date_obs, leap_second):
    """Aplica uma correção a data de observação e converte para data juliana
    Correção para os CCDs do DES:
        date = date_obs + 0.5 * (exptime + 1.05)
    Args:
        date_obs (datetime): Data de observação do CCD "date_obs"
        exptime (float): Tempo de exposição do CCD "exptime"
        lead_second (str): Path para o arquivo leap second a ser utilizado por exemplo: '/archive/lead_second/naif0012.tls'
    Returns:
        str: Data de observação corrigida e convertida para julian date.
    """
    # Carrega o lead second na lib spicepy
    spice.furnsh(leap_second)
    # Converte a date time para JD
    date_et = spice.utc2et(str(date_obs).split('+')[0] + " UTC")
    date_jdutc = spice.et2utc(date_et, 'J', 14)
    # Remove a string JD retornada pela lib
    jd = date_jdutc.replace('JD ', '')
    # Soma a correção
    spice.kclear()
    return jd


@api_view(['GET'])
@permission_classes([AllowAny])
def jpl_theoretical(request):

    data = request.query_params
    start_date = data['start']
    end_date = data['end']

    start_date = datetime.strptime(start_date, "%Y-%m-%d").date()
    end_date = datetime.strptime(end_date, "%Y-%m-%d").date()

    date_delta = end_date - start_date

    name = "Eris"
    bspObject = '/archive/Eris.bsp'
    bspPlanets = "/archive/de435.bsp"
    leapSec = "/archive/naif0012.tls"
    # Location of observatory: [longitude, latitude, elevation]
    lonLatEle = [+289.193583333, -30.16958333, 2202.7]  # Cerro tololo

    dates = []
    dates_jd = []

    for i in range(date_delta.days + 1):

        dt = start_date + timedelta(days=i)

        if dt.weekday() == 6:
            dt = datetime.combine(dt, datetime.min.time())

            dates.append(dt)

            dt = date_to_jd(dt, leapSec)

            dates_jd.append(dt)

    raJPL, decJPL = computePosition(
        name, dates_jd, bspObject, bspPlanets, leapSec, lonLatEle)

    return Response({
        "ra": raJPL,
        "dec": decJPL,
        "dates": dates
    })
