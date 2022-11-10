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

from tno.auth_shibboleth import ShibbolethBackend


@api_view(["GET"])
def teste(request):
    if request.method == "GET":
        # debug = request.query_params.get('debug', False)

        # from des.astrometry_pipeline import DesAstrometryPipeline

        # DesAstrometryPipeline(debug=bool(debug)).run(1)

        from des.astrometry_daemon import check_jobs_to_run

        check_jobs_to_run()

        result = dict(
            {
                "success": True,
            }
        )

        return Response(result)


@api_view(["GET"])
def teste2(request):
    if request.method == "GET":

        from des.astrometry_daemon import check_jobs_running

        check_jobs_running()

        # import gzip
        # import json
        # with gzip.open('/archive/des_astrometry/des_astrometry_1/Eris/Eris.json.gz', 'rt', encoding='UTF-8') as zipfile:
        #     result = json.load(zipfile)

        result = dict(
            {
                "success": True,
            }
        )

        return Response(result)


@api_view(["GET"])
def teste3(request):
    if request.method == "GET":

        from des.astrometry_pipeline import DesAstrometryPipeline

        DesAstrometryPipeline().update_asteroid_table()

        result = dict(
            {
                "success": True,
            }
        )

        return Response(result)


@api_view(["GET"])
def logout_view(request):
    logout(request)

    # Redireciona para a home
    home = settings.HOST_URL
    response = redirect(home)

    return response


@api_view(["GET"])
def import_skybot(request):
    """ """
    if request.method == "GET":

        from tno.skybot import ImportSkybot

        sk = ImportSkybot()

        # Funcao para consumir o servico skybot
        # sk.import_skybot()
        # Funcão para registrar o Skybot output
        sk.register_skybot_output()

        result = dict(
            {
                "success": True,
            }
        )
    return Response(result)


@api_view(["GET"])
def read_file(request):
    """
    Function to read .log file
    A filepath parameter is obrigatory to display the file.
    """
    if request.method == "GET":

        # Recuperar o filepath do arquivo a ser lido dos parametros da url.
        filepath = request.query_params.get("filepath", None)

        # Verificar se o parametro nao esta vazio, se estiver retorna mensagem avisando.
        if filepath == None or filepath == "":
            return Response(
                dict({"success": False, "message": "filepath parameter obrigatory"})
            )

        # Verificar se o arquivo existe, se nao existir retorna mensagem avisando.
        if not os.path.exists(filepath):
            return Response(
                dict(
                    {
                        "success": False,
                        "message": "filepath do not exist. (%s)" % filepath,
                    }
                )
            )

        # Ler o arquivo.
        try:
            rows = list()
            with open(filepath) as fp:
                lines = fp.readlines()
                for line in lines:
                    rows.append(line.replace("\n", "").strip())

            return Response(
                dict(
                    {
                        "success": True,
                        "rows": rows,
                        "filepath": filepath,
                    }
                )
            )
        except IOError as e:
            return Response(
                dict(
                    {
                        "success": False,
                        "message": "I/O error({0}): {1}".format(e.errno, e.strerror),
                    }
                )
            )


@api_view(["GET"])
def read_csv(request):
    """
    Function to read .csv file
    A filepath parameter is obrigatory to display the file.
    this view can be paginated, with page and pageSize parameters.

    eg: http://localhost/api/read_csv?filepath=/proccess/78/objects/Eris/gaia_dr2.csv&page=2&pageSize=5&format=json

    for this exemple will be returned 5 rows for page 2.

    """
    if request.method == "GET":

        # Recuperar o filepath do arquivo a ser lido dos parametros da url.
        filepath = request.query_params.get("filepath", None)
        page = int(request.query_params.get("page", 1))
        pageSize = int(request.query_params.get("pageSize", 100))

        # Verificar se o parametro nao esta vazio, se estiver retorna mensagem avisando.
        if filepath == None or filepath == "":
            return Response(
                dict({"success": False, "message": "filepath parameter obrigatory"})
            )

        # Verificar se o arquivo existe, se nao existir retorna mensagem avisando.
        if not os.path.exists(filepath):
            return Response(
                dict(
                    {
                        "success": False,
                        "message": "filepath do not exist. (%s)" % filepath,
                    }
                )
            )
            #    implementar paginacao na funcao csv
        if page == 1:
            skiprows = 1
        else:
            skiprows = (page * pageSize) - pageSize

        df_temp = pd.read_csv(filepath, delimiter=";")
        columns = list()
        for col in df_temp.columns:
            columns.append(col)

        count = df_temp.shape[0]
        del df_temp

        # Ler o arquivo.
        df = pd.read_csv(
            filepath, names=columns, delimiter=";", skiprows=skiprows, nrows=pageSize
        )

        df = df.fillna(0)

        rows = list()
        for record in df.itertuples():
            row = dict({})

            for header in columns:
                row[header] = getattr(record, header)

            rows.append(row)

        result = dict(
            {
                "success": True,
                "filepath": filepath,
                "columns": columns,
                "rows": rows,
                "count": count,
            }
        )

    return Response(result)


@api_view(["GET"])
def download_file(request):
    """
    Function to download a file and zip.

    http://localhost:7001/api/teste/?filepath=/archive/tmp/teste.csv

    When the file is bigger than 1Mb, the file is zipped.
    """
    if request.method == "GET":
        # Funcao para fazer download de um arquivo

        # Recuperar o filepath do arquivo a ser lido dos parametros da url.
        filepath = request.query_params.get("filepath", None)

        if not os.path.exists(filepath):
            raise Exception("File do not exist")

        # Checar o tamanho do arquivo
        size = os.path.getsize(filepath)

        maxSize = 1000000

        # Se o arquivo for maior que x
        if size > maxSize:
            # criar uma nova variavel com o path para o arquivo zip
            filename = os.path.basename(filepath)
            filename = filename + ".zip"
            new_file = os.path.join(settings.MEDIA_TMP_DIR, filename)

            # Comprime o arquivo e retorna o arquivo comprimido
            with zipfile.ZipFile(new_file, "w") as myzip:
                myzip.write(filepath, compress_type=zipfile.ZIP_DEFLATED)

            # Retornar o arquivo zipado
            with open(new_file, "rb") as fh:
                response = HttpResponse(
                    fh.read(), content_type="application/octet-stream"
                )
                response[
                    "Content-Disposition"
                ] = "inline; filename=" + os.path.basename(new_file)
                return response
        else:

            with open(filepath, "rb") as fh:
                response = HttpResponse(
                    fh.read(), content_type="application/octet-stream"
                )
                response[
                    "Content-Disposition"
                ] = "inline; filename=" + os.path.basename(filepath)
                return response


@api_view(["GET"])
@permission_classes([AllowAny])
def auth_shibboleth(request):

    logger = logging.getLogger("auth_shibboleth")
    logger.info("---------------------------------------------------------")
    logger.info("Shibboleth Authentication Endpoint")

    if request.method == "GET":
        logger.debug(request.query_params)

        logger.debug("Is Authenticated: %s" % request.user.is_authenticated)

        if not request.user.is_authenticated:
            try:
                data = request.query_params
                sid = data["sid"]
                logger.debug("Session ID: %s" % sid)

            except KeyError:
                logger.error('Parameter "sid"  session id  is unknown.')

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
                    request, session_data, username=None, password=None
                )

                # Setar o tempo de expiracao da sessao, necessario ser feito antes do login
                # baseado nesta resposta https://stackoverflow.com/a/27062144/9063237
                # a data de expiração está em Unix epoch time. conversor de epoch online util para testes: https://www.epochconverter.com/
                request.session.expire_date = session_data.get("Shib-Session-Expires")

                # Efetua o Login
                login(request, user, backend="tno.auth_shibboleth.ShibbolethBackend")

            except Exception as e:
                logger.error(e)
                logger.error("User not found, authentication failed.")

        else:
            # TODO: Revisar esta parte pode haver inconsistencias.
            logger.info("User is already logged in does nothing.")

        # Just Checking if is authenticated
        logger.info("Is Authenticated: %s" % request.user.is_authenticated)

    # Redireciona para a home
    home = settings.HOST_URL
    logger.info("Redirect to Home: [ %s:%s ]" % (request.scheme, home))
    response = redirect(home)

    return response
