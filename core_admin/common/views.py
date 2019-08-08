from praia.models import Run 
from django.db.models import Count
from rest_framework.response import Response
from rest_framework.decorators import api_view
import pandas as pd
import humanize
import os
import csv
import requests
import logging
from django.conf import settings
import zlib
import zipfile
from django.conf import settings
from django.http import HttpResponse


@api_view(['GET'])
def teste(request):
    
        result = dict( {
            'success': True,
        })
    return Response(result)


@api_view(['GET'])
def import_skybot(request):
    """
    """
    if request.method == 'GET':

        from tno.skybot import  ImportSkybot

        sk = ImportSkybot()

        # Funcao para consumir o servico skybot
        # sk.import_skybot()
        # Funcão para registrar o Skybot output
        sk.register_skybot_output()

        result = dict( {
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
                    rows.append(line.replace('\n','').strip())

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
    if request.method == 'GET':
        logger = logging.getLogger('django')

        # Funcao para fazer download de um arquivo 
        logger.info("------------------------ TESTE ----------------------------")


        import os

        # Recuperar o filepath do arquivo a ser lido dos parametros da url. 
        filepath = request.query_params.get('filepath', None)

        if not os.path.exists(filepath):
            raise Exception("Arquivo não existe")

        # Checar o tamanho do arquivo
        size = os.path.getsize(filepath) # zipsize = os.stat(filename).st_size
        logger.info("size: %s" % size)

        maxSize = 1000000

        # Se o arquivo for maior que x
        if size > maxSize:
            logger.info("Arquivo maior que o maximo")

            # criar uma nova variavel com o path para o arquivo zip 
            filename = os.path.basename(filepath)
            filename = filename + '.zip'
            logger.info("Filename: %s" % filename)
            new_file = os.path.join(settings.MEDIA_TMP_DIR, filename)

            # Comprime o arquivo e retorna o arquivo comprimido
            with zipfile.ZipFile(new_file,'w') as myzip:
                myzip.write(filepath, compress_type=zipfile.ZIP_DEFLATED)
                logger.info("Arquivo zipado")

            #Retornar o arquivo zipado 
            with open(new_file, 'rb') as fh:
                response = HttpResponse(fh.read(), content_type="application/octet-stream")
                response['Content-Disposition'] = 'inline; filename=' + os.path.basename(new_file) 
                return response
        else:
            logger.info("Arquivo MENOR que o maximo")

            with open(filepath, 'rb') as fh:
                response = HttpResponse(fh.read(), content_type="application/octet-stream")
                response['Content-Disposition'] = 'inline; filename=' + os.path.basename(filepath)
                return response

