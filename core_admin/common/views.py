
from rest_framework.response import Response
from rest_framework.decorators import api_view


@api_view(['GET'])
def teste(request):
    if request.method == 'GET':

        # # TODO esta parte do input deve ser separado, na submissao da rodada.
        # # TODO o path deve ser do processo
        # archive = settings.ARCHIVE_DIR
        # output_path = os.path.join(archive, 'teste')
        # input_file = os.path.join(output_path, 'objects.csv')
        #
        # # Id da Custom List
        # id = request.GET.get("custom_list", None)
        # if id is None:
        #     raise Exception("is necessary the custom_list parameter")
        #
        # # print("Custom List ID: %s" % id)
        #
        # # Retrieve Custom List
        # customlist = CustomList.objects.get(pk=id, status='success')
        #
        # # Recupera os objetos da tabela.
        # rows, count = FilterObjects().list_distinct_objects_by_table(
        #     customlist.tablename, customlist.schema, pageSize=5)
        #
        # if count > 0:
        #     # Escrever o arquivo de input no diretorio de destino
        #     with open(input_file, 'w') as csvfile:
        #         fieldnames = ['name', 'num']
        #         writer = csv.DictWriter(csvfile, fieldnames=fieldnames, delimiter=';', extrasaction='ignore')
        #
        #         writer.writeheader()
        #         writer.writerows(rows)
        #
        # BSPJPL().run(input_file, output_path)
<<<<<<< HEAD
      
        result = dict({
            'status': "success",
            'lines': list(),
        })


        with open('/archive/proccess/2/objects/1999_RB216/nima.log', 'r') as fp:
            lines = fp.readlines()
            for line in lines:
                result["lines"].append(line.strip())
                
    return Response(result)
=======

        return Response(dict({'status': "success"}))
>>>>>>> 414bbd0e5e97aa621ff37761e1b72ce62127e56b
