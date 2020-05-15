import os
from datetime import datetime
from urllib.parse import urljoin

import requests
from requests.exceptions import HTTPError


# TODO:  Esta classe deve ir para um app separado. 
class SkybotServer():
    """Esta classe tem a função de facilitar consultas ao serviço Skybot. 

    """
    def __init__(self, url):

        self.result_columns = ['expnum', 'band', 'date_obs', 'skybot_downloaded', 'skybot_url', 'download_start', 'download_finish', 'download_time', 'filename',
                        'file_size', 'file_path', 'import_start', 'import_finish', 'import_time', 'count_created', 'count_updated', 'count_rows',
                        'ccd_count', 'ccd_count_rows', 'ccd_start', 'ccd_finish', 'ccd_time', 'error']

        # Url para o serviço do Skybot incluindo o endpoint.
        # exemplo: http://vo.imcce.fr/webservices/skybot/skybotconesearch_query.php
        self.server_url = url


    def __check_date(self, date):
        """Verifica se date é uma datetime, se for converte para string.

        Arguments:
            date {datetime} -- Data de observação.

        Returns:
            str -- Data de observação em no formato ("%Y-%m-%d %H:%M:%S")
        """
        # Converte a data para string se for um objeto do tipo datetime.
        if isinstance(date, datetime):
            date = date.strftime("%Y-%m-%d %H:%M:%S")
        return date

    def __check_ra(self, ra):
        """Valida o valor para RA. que deve ser um float entre 0 e 360.

        Arguments:
            ra {float} -- valor para RA em degrees.

        Raises:
            Exception: lança excessão caso o valor de ra não seja um float ou seu valor não esteja entre 0 e 360.

        Returns:
            float -- RA
        """
        ra = float(ra)
        if 0 <= ra <=360:
            return ra
        else:
            raise Exception("Right ascension or ecliptic longitude of the FOV center limits 0..360 degrees.")

    def __check_dec(self, dec):
        """Valida o valor para Dec. que deve ser um float entre -90 e 90.

        Arguments:
            dec {float} -- valor para Dec em degrees.

        Raises:
            Exception: lança excessão caso o valor de dec não seja um float ou seu valor não esteja entre -90 e 90.

        Returns:
            float -- Dec
        """
        dec = float(dec)
        if -90 <= dec <= 90:
            return dec
        else:
            raise Exception("Declination or ecliptic latitude of the FOV center limits -90..+90 degrees.")

    def __check_radius(self, radius):
        """Valida os valores para Radius, dever ser um float entre 0 e 10.

        Arguments:
            radius {float} -- Cone search radius in degrees.

        Raises:
            Exception: lança excessão caso o radius não seja um float ou seu valor não esteja entre 0 e 10.

        Returns:
            float -- radius
        """
        radius = float(radius)
        if 0 <= radius <=10:
            return radius
        else:
            raise Exception("Radius of the FOV must be float between 0 and 10 degrees.")

    def __get_ticket_from_response(self, data):
        """Read the output file and retrieve the ticket number on the second line. 
            this ticket identifies the request that was made for the Skybot service.

        Arguments:
            data {str} -- response from skybot server

        Returns:
            int -- Ticket number, example: 166515392791779001
        """

        line = data.splitlines()[1]
        ticket = int(line.split(':')[1].strip())
        return ticket        


    def cone_search(self, date, ra, dec, radius, observer_location, position_error, output):
        """Faz uma requisição ao serviço do skybot e grava o resultado em um arquivo.
        Utiliza a função conesearch do Skybot.

        Exemplo de uma url de requisição:
        # http://vo.imcce.fr/webservices/skybot/skybotconesearch_query.php?-ep=2012-11-10%2003:27:03&-ra=37.44875&-dec=-7.7992&-rd=1.1&-mime=text&-output=object&-loc=w84&-filter=0

        a execução desta função sempre retornara o dict de resultado, mesmo que ocorra uma Excessão. 
        neste caso o atributo success é False e error é preenchido com a Exception. 

        para os casos de sucesso, success = True e error é None todos os outros campos serão preenchidos.

        Arguments:
            date {datetime} -- Epoch requested, expressed in Julian day or formatted as any English textual datetime.
            ra {float} -- Right ascension or ecliptic longitude of the FOV center in degrees. limits 0..360 degrees.
            dec {float} -- Declination or ecliptic latitude of the FOV center in degrees. limits -90..+90.
            radius {float} -- Radius of the FOV in degrees limits 0..10 degrees.
            observer_location {str} -- Code of the observer location based in this list of ObsCodes: https://minorplanetcenter.net//iau/lists/ObsCodes.html.
            position_error {float} -- Filter to retrieve only objects with a position error lesser than the given value. optional parameter 0 implies no filter Default: 120 arcsec .
            output {str} -- filepath p

        Returns:
            {dict} -- returns a dict with the request information, execution time, status...
            
            dict({
                'success': False,
                'ticket': None,               # Identificação retornada pelo skybot.
                'positions': 0,               # Quantidade de posições encontradas.
                'start': None,                # Inicio do Download.
                'finish': None,               # Fim do Download
                'execution_time': 0,          # Tempo de execução do download.
                'file_size': 0,               # Tamanho do arquivo criado
                'skybot_url': None,           # Url usada na requisição ao skybot
                'error': None                 # Caso ocorra alguma excessão ela sera colocada neste campo.
            })
        """

        t0 = datetime.now()
        result = dict({
            'success': False,
            'ticket': None,
            'positions': 0,
            'start': None,
            'finish': None,
            'execution_time': 0,
            'output': None,
            'file_size': 0,
            'skybot_url': None,
            'error': None
        })

        try:
            # Monta a url para o serviço do skybot na função de conesearch
            # exemplo: http://vo.imcce.fr/webservices/skybot/skybotconesearch_query.php
            url = urljoin(self.server_url, 'skybotconesearch_query.php')

            # Faz a requisição 
            r = requests.get(url, params={
                '-ep': self.__check_date(date),
                '-ra': self.__check_ra(ra),
                '-dec': self.__check_dec(dec),
                '-rd': self.__check_radius(radius),
                '-loc': str(observer_location),
                '-mime': 'text',
                '-output': 'all',
                '-filter': float(position_error),                
            })

            # Checa o status da requisição
            # If the response was successful, no Exception will be raised
            r.raise_for_status()

            # Cria um arquivo com o resultado 
            with open(output, 'w+') as csv:
                csv.write(r.text)

            # Atualiza o dict de retorno com os dados da execução.
            result.update({
                'success': True,
                'skybot_url': r.url,
                'file_size': os.path.getsize(output),
                'ticket': self.__get_ticket_from_response(r.text),
                'positions': len(r.text.splitlines()) - 3,
            })

        except HTTPError as http_err:
            result.update({
                'success': False,
                'error': "HTTP error occurred: %s" % http_err
            })

        except Exception as e:
            result.update({
                'success': False,
                'error': e
            })

        # tempo de execução
        t1 = datetime.now()
        tdelta = t1 - t0

        result.update({
            'start': t0.strftime("%Y-%m-%d %H:%M:%S"),
            'finish': t1.strftime("%Y-%m-%d %H:%M:%S"),
            'execution_time': tdelta.total_seconds()
        })

        return result
