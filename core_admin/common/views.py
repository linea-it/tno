from praia.models import Run 
from django.db.models import Count
from rest_framework.response import Response
from rest_framework.decorators import api_view
import pandas as pd
import humanize
import os
import csv

@api_view(['GET'])
def teste(request):
    if request.method == 'GET':
        
        run_id = request.query_params.get('run_id', None)
        
        astrometry_run = Run.objects.get(pk=run_id)

#coletar o tempo de execucao de cada etapa do pipeline e fazer um endpoint pra retornar os tempos
        result = dict( {
            'success': True,
            'execution_time': {
                'execution_ccd_images': astrometry_run.execution_ccd_images,
                'execution_bsp_jpl': astrometry_run.execution_bsp_jpl,
                'execution_catalog': astrometry_run.execution_catalog,
            }
        })

#       resultset = astrometry_run.asteroids.all().values('status').annotate(total=Count('status')).order_by('total')     
    return Response(result)

@api_view(['GET'])
def import_skybot(request):
    """
        TESTE

        teste documentação
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
        
        # Saber a primeira linha 
        # columns = list()
        # if len(dict_list) > 0:
        #     columns = dict_list[0].keys()
        
        result = dict({
            'success': True,
            'filepath': filepath,
            'page': page,
            'pageSize': pageSize,
            'skiprows': skiprows,
            'columns': columns,
            'rows': rows,
            # 'rows': dict_list,
            # 'columns': columns,           
        })

    return Response(result)
