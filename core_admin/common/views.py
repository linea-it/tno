from rest_framework.response import Response
from rest_framework.decorators import api_view
@api_view(['GET'])
def teste(request):
    if request.method == 'GET':

        import csv
        from tno.db import CatalogDB


        csv_file = '/archive/proccess/27/objects/Dioretsa/ccd_images.csv'

        with open(csv_file, 'r') as f: 
            reader = csv.DictReader(f, delimiter=';')
            dict_list = []
            for row in reader:
                dict_list.append(row)
            
                coordinates = [row['rac1'], row['decc1'], row['rac2'], row['decc2'], row['rac3'], row['decc3'], row['rac4'], row['decc4']]

                a = CatalogDB().poly_query(
                    "gaia_dr2", "ra", "dec", coordinates, "gaia"
                )


                # where = """q3c_poly_query("%s", "%s", '{%s}')""" % (
                # 'ra', 'dec', ", ".join(coordinates))

                # stm = """SELECT * FROM %s WHERE %s """ % ('gaia.gaia_dr2', where)

                # rows = db.fetch_all_dict(text(stm))


        # select * from gaia.gaia_dr2 where q3c_poly_query("ra", "dec", '{25.447951, -3.36042, 25.447641, -3.510105, 25.747496, -3.510276, 25.747698, -3.36045}');



        result = dict({
            'success': True,
            'rows': a,
            # 'bsp_file': bsp_file
            # 'count': ccds_count
        })

    return Response(result)

@api_view(['GET'])
def import_skybot(request):
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




    
    
        

    return Response(result)     