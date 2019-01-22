from rest_framework.response import Response
from rest_framework.decorators import api_view


@api_view(['GET'])
def teste(request):
    if request.method == 'GET':

        result = dict({
            'success': True,
            'teste': sk.teste()
        })

    return Response(result)

@api_view(['GET'])
def import_skybot(request):
    if request.method == 'GET':

        from tno.skybot import  ImportSkybot

        sk = ImportSkybot()

        # Funcao para consumir o servico skybot
        sk.import_skybot()
        # Funcão para registrar o Skybot output
        # sk.register_skybot_output()

        result = dict( {
            'success': True,
        })
    return Response(result)