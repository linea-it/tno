import os
import zipfile

import pandas as pd
from django.conf import settings
from django.contrib.auth import logout
from django.http import HttpResponse
from django.shortcuts import redirect
from rest_framework.decorators import action, api_view, permission_classes
from rest_framework.permissions import AllowAny
from rest_framework.response import Response


@api_view(["GET"])
def teste(request):
    if request.method == "GET":

        from datetime import datetime, timezone

        import pandas as pd
        from tno.models import Occultation
        from tno.occviz import visibility_from_coeff

        lat = -22.90278
        long = -43.2075
        radius = 50

        events = Occultation.objects.filter(
            date_time__date="2023-08-01", have_path_coeff=True
        )

        rows = []
        ids = []
        for e in events:
            is_visible, info = visibility_from_coeff(
                latitude=float(lat),
                longitude=float(long),
                radius=float(radius),
                date_time=e.date_time.isoformat(),
                inputdict=e.occultation_path_coeff,
            )

            # print(f"Occ ID: {e.id} - {e.date_time.isoformat()} - {e.name} IS Visible: [ {is_visible} ] Info: [{info}]")
            if is_visible:
                rows.append(e)
                ids.append(e.id)

        result = {"success": True, "rows": len(rows), "ids": ids}

        return Response(result)


@api_view(["GET"])
def test_background_task(request):
    # from tno.tasks import teste_api_task
    # from tno.tasks import create_prediction_maps
    # from tno.tasks import garbage_collector
    if request.method == "GET":
        # teste_api_task.delay()
        # garbage_collector.delay()
        result = dict(
            {
                "success": True,
            }
        )
        return Response(result)


@api_view(["GET"])
@permission_classes([AllowAny])
def which_environment(request):

    if request.method == "GET":
        env_name = settings.ENVIRONMENT_NAME

        dev_env = ["Development", "development", "dev", "Staging", "Homolog"]
        is_dev = True if env_name in dev_env else False
        result = {"enviroment_name": settings.ENVIRONMENT_NAME, "is_dev": is_dev}
        return Response(result)


@action(detail=False, methods=["GET"])
def logout_view(request):
    logout(request)

    # Redireciona para a home
    home = settings.HOST_URL
    response = redirect(home)

    return response


# @action(detail=False, methods=["GET"])
# def import_skybot(request):
#     """ """
#     if request.method == "GET":

#         from tno.skybot import ImportSkybot

#         sk = ImportSkybot()

#         # Funcao para consumir o servico skybot
#         # sk.import_skybot()
#         # Funcão para registrar o Skybot output
#         sk.register_skybot_output()

#         result = dict(
#             {
#                 "success": True,
#             }
#         )
#     return Response(result)


@action(detail=False, methods=["GET"])
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
            rows = []
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


@action(detail=False, methods=["GET"])
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
        columns = []
        for col in df_temp.columns:
            columns.append(col)

        count = df_temp.shape[0]
        del df_temp

        # Ler o arquivo.
        df = pd.read_csv(
            filepath, names=columns, delimiter=";", skiprows=skiprows, nrows=pageSize
        )

        df = df.fillna(0)

        rows = []
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


@action(detail=False, methods=["GET"])
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
                response["Content-Disposition"] = (
                    "inline; filename=" + os.path.basename(new_file)
                )
                return response
        else:

            with open(filepath, "rb") as fh:
                response = HttpResponse(
                    fh.read(), content_type="application/octet-stream"
                )
                response["Content-Disposition"] = (
                    "inline; filename=" + os.path.basename(filepath)
                )
                return response
