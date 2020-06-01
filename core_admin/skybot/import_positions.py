import linecache
import logging
from datetime import datetime, timedelta, timezone
from io import StringIO

import humanize
import pandas as pd
from django.conf import settings

from tno.db import DBBase

class ImportSkybotPositions():

    def __init__(self):
        self.logger = logging.getLogger("skybot_load_data")

    def import_output_file(self, filepath):
        """Importa os resultados na tabela skybot

        Arguments:
            filepath {str} -- Filepath do arquio de outputs do skybot.

        Returns:
            pandas.Dataframe -- Dataframe com o conteudo do arquivo.
        """
        self.logger.debug("Importing Skybot Output: [%s]" % filepath)

        try:

            t0 = datetime.now(timezone.utc)

            flag = self.read_flag_from_output(filepath)

            # só executa a função de importação se tiver dados. 
            if flag > 0: 

                # Le o arquivo de outputs e gera um pandas dataframe
                df = self.read_output_file(filepath)
                rowcount = self.import_data(df)


            else:
                self.logger.debug("Skybot returned 0 Positions. means that no body has been found")                
                df = self.create_empty_dataframe()
                rowcount = 0

            t1 = datetime.now(timezone.utc)
            tdelta = t1 - t0

            self.logger.debug("Imported Skybot [%s] Positions in %s" % (
                rowcount, humanize.naturaldelta(tdelta, minimum_unit="milliseconds")))

            return df

        except Exception as e:
            self.logger.error(e)
            raise (e)

    def read_output_file(self, filepath):

        # self.logger.debug("Reading Skybot Output: [%s]" % filepath)

        # Headers que estão no arquivo e na ordem correta de leitura.
        headers = ["number", "name", "ra", "dec", "dynclass", "mv", "errpos", "d", "dracosdec",
                   "ddec", "dgeo", "dhelio", "phase", "solelong", "px", "py", "pz", "vx", "vy", "vz", "jdref"]

        df = pd.read_csv(filepath, skiprows=3, delimiter='|', names=headers)

        # Tratar o campo num para retirar os caracteres -
        df['number'] = df['number'].apply(
            lambda x: x if str(x).strip() is not '-' else '')

        # Adiciona colunas para RA e Dec em graus.
        df['raj2000'] = 0
        df['decj2000'] = 0

        # Converter as coordenadas de HMS para Degrees
        df['raj2000'] = df['ra'].apply(lambda x: self.convert_ra_hms_deg(x))
        df['decj2000'] = df['dec'].apply(lambda x: self.convert_dec_hms_deg(x))

        # Retirar os espaços entre os valores
        df = df.applymap(lambda x: x.strip() if type(x) == str else x)

        # Adicionar uma coluna com o Ticket do Skybot
        df['ticket'] = self.read_ticket_from_output(filepath)

        # Mudar a ordem das colunas de arcordo com a ordem  da tabela.
        # Isso facilita a importacao por csv.
        columns = self.get_columns()

        df = df.reindex(columns=columns)


        # self.logger.debug(df.head)

        return df

    def get_columns(self):
        columns = ['name', 'number', 'dynclass', 'ra', 'dec', 'raj2000', 'decj2000', 'mv', 'errpos', 'd', 'dracosdec',
            'ddec', 'dgeo', 'dhelio', 'phase', 'solelong', 'px', 'py', 'pz', 'vx', 'vy', 'vz', 'jdref', 'ticket']

        return columns

    def create_empty_dataframe(self):
        df = pd.DataFrame(columns=self.get_columns())        

        return df

    def import_data(self, dataframe):
        """
            Convert the dataframe to csv, and import it into the database.

            Parameters:
                dataframe (dataframe): Pandas Dataframe with the information to be imported.

            Returns:
                rowcount (int):  the number of rows imported. 

            Example SQL Copy:
                COPY tno_skybotoutput (num, name, dynclass, ra, dec, raj2000, decj2000, mv, errpos, d, dracosdec, ddec, dgeo, dhelio, phase, solelong, px, py, pz, vx, vy, vz, jdref) FROM '/data/teste.csv' with (FORMAT CSV, DELIMITER ';', HEADER);

        """
        # Converte o Data frame para csv e depois para arquivo em memória.
        # Mantem o header do csv para que seja possivel escolher na query COPY quais colunas
        # serão importadas.
        # Desabilita o index para o pandas não criar uma coluna a mais com id que não corresponde a tabela.
        self.logger.debug("Converting the pandas dataframe to csv")
        data = StringIO()
        dataframe.to_csv(
            data,
            sep="|",
            header=True,
            index=False,
        )
        data.seek(0)

        try:
            self.logger.debug("Executing the import function on the database.")

            # Abre conexão com o banco usando sqlAlchemy
            dbbase = DBBase()
            # Recupera o nome da tabela skybot output
            table = str(dbbase.get_table_skybot())
            # Sql Copy com todas as colunas que vão ser importadas e o formato do csv.
            sql = "COPY %s (name, number, dynclass, ra, dec, raj2000, decj2000, mv, errpos, d, dracosdec, ddec, dgeo, dhelio, phase, solelong, px, py, pz, vx, vy, vz, jdref, ticket) FROM STDIN with (FORMAT CSV, DELIMITER '|', HEADER);" % table

            # Executa o metodo que importa o arquivo csv na tabela.
            rowcount = dbbase.import_with_copy_expert(sql, data)

            self.logger.debug("Successfully imported")

            # Retorna a quantidade de linhas que foram inseridas.
            return rowcount

        except Exception as e:
            raise Exception("Failed to import data. Error: [%s]" % e)

    def read_ticket_from_output(self, filepath):
        """
            Read the output file and retrieve the ticket number on the second line. 
            this ticket identifies the request that was made for the Skybot service.

            Parameters:
                filepath (str): Output file returned by the skybot service.

            Returns:
                ticket (int): Ticket number, example: 166515392791779001
        """

        # Le o arquivo de outputs e recupera o ticket.
        # ticket é um id que identifica a requisição feita no skybot.
        # serve para agrupar todos os resultados a mesma requisição.
        line = linecache.getline(str(filepath), 2)
        ticket = int(line.split(':')[1].strip())
        self.logger.debug("Skybot Ticket: [%s]" % ticket)

        return ticket

    def read_flag_from_output(self, filepath):
        """ Le o arquivo de outputs e recupera o flag.

        Arguments:
            filepath {[type]} -- [description]

        Returns:
            int -- the status of the response: 
                flag=1 means that a body has been found; 
                flag=0 means that no body has been found; 
                flag=-1 means that an error occured 'ticket'            
        """
        line = linecache.getline(str(filepath), 1)
        flag = int(line.split(':')[1].strip())
        self.logger.debug("Skybot Flag: [%s]" % flag)

        return flag



    def convert_ra_hms_deg(self, ra=''):
        """
            Converte RA em HMS para Degrees.
            Parameters:
                ra (str): RA em horas. exemplo '23 56 47.2833'.

            Returns:
                ra (float): RA em degrees. exemplo 359.19701375.
        """
        H, M, S = [float(i) for i in ra.split()]
        RA = (H + M/60. + S/3600.)*15.

        return float("{0:.4f}".format(RA))

    def convert_dec_hms_deg(self, dec=''):
        """
            Converte Dec em HMS para Degrees.
            Parameters:
                de (str): Dec em horas. exemplo '-00 53 27.975'.

            Returns:
                dec (float): Dec em degrees. exemplo -0.8911041666666666.
        """
        DEC, ds = 0, 1

        D, M, S = [float(i) for i in dec.split()]
        if str(D)[0] == '-':
            ds, D = -1, abs(D)
        DEC = ds*(D + M/60. + S/3600.)

        return float("{0:.4f}".format(DEC))
