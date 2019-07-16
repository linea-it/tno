from rest_framework.response import Response
from rest_framework.decorators import api_view
import os
import csv

@api_view(['GET'])
def teste(request):
    if request.method == 'GET':

        result = dict( {
            'success': True,
        })

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
       
        with open(filepath, 'r') as csv_file: 
            reader = csv.DictReader(csv_file, delimiter=';')
            dict_list = []
            for row in reader:
                dict_list.append(row)

        # Saber a primeira linha 
        columns = list()
        if len(dict_list) > 0:
            columns = dict_list[0].keys()
        
        result = dict({
            'success': True,
            'rows': dict_list,
            'columns': columns,           
        })

    return Response(result)