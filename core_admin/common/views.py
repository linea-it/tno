from django.shortcuts import render
from rest_framework.response import Response
from rest_framework.decorators import api_view
from orbit.orbitalparameters import GetOrbitalParameters
from tno.models import CustomList
from tno.skybotoutput import FilterObjects
from django.conf import settings
import os
import csv
from datetime import datetime
import humanize


@api_view(['GET'])
def teste(request):
    if request.method == 'GET':

        total_time0 = datetime.now()
        # TODO o path deve ser do processo
        archive = settings.ARCHIVE_DIR
        output_path = os.path.join(archive, 'teste')
        input_file = os.path.join(output_path, 'objects.csv')

        # Id da Custom List
        id = request.GET.get("custom_list", None)
        if id is None:
            raise Exception("is necessary the custom_list parameter")

        # print("Custom List ID: %s" % id)

        # Retrieve Custom List
        customlist = CustomList.objects.get(pk=id, status='success')

        # Recupera os objetos da tabela.
        rows, count = FilterObjects().list_distinct_objects_by_table(
            customlist.tablename, customlist.schema)

        if count > 0:
            # Escrever o arquivo de input no diretorio de destino
            with open(input_file, 'w') as csvfile:
                fieldnames = ['name', 'num']
                writer = csv.DictWriter(csvfile, fieldnames=fieldnames, delimiter=';', extrasaction='ignore')

                writer.writeheader()
                writer.writerows(rows)

        # TODO ainda nao esta rodando fora do django.

        obp_download_time0 = datetime.now()
        GetOrbitalParameters().runOrbitalParameters(input_file=input_file, output_path=output_path)
        obp_download_time1 = datetime.now()

        obs_download_time0 = datetime.now()
        GetOrbitalParameters().runObservations(input_file=input_file, output_path=output_path)
        obs_download_time1 = datetime.now()

        # Tempo Total de download Obital Parameters
        obp_download_time = obp_download_time1 - obp_download_time0
        obp_download_time_seconds = obp_download_time.total_seconds()
        print("ORBITAL PARAMETERS DOWNLOADED IN %s" % humanize.naturaldelta(obp_download_time_seconds))

        # Tempo Total de download Observations
        obs_download_time = obs_download_time1 - obs_download_time0
        obs_download_time_seconds = obs_download_time.total_seconds()
        print("OBSERVATIONS DOWNLOADED IN: %s" % humanize.naturaldelta(obs_download_time_seconds))

        # Tempo total da task de Orbital Parameters
        total_time1 = datetime.now()
        total_time = total_time1 - total_time0
        total_time_seconds = total_time.total_seconds()
        print("TOTAL TIME: %s" % humanize.naturaldelta(total_time_seconds))

        return Response(dict({'status': "success"}))
