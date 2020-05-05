import logging
from datetime import datetime, timedelta, timezone
from io import StringIO

import humanize
import pandas as pd
from django.conf import settings

from tno.db import DBBase
from tno.skybotoutput import SkybotOutput as SkybotOutputDB
from tno.skybotoutput import Pointing as PointingDB
import linecache

class DesImportSkybotOutput():

    def __init__(self):
        self.logger = logging.getLogger("skybot_load_data")

    def import_output_file(self, filepath):
        self.logger.info("----------------------------------------------")
        self.logger.info("Importing Skybot Output: [%s]" % filepath)

        try:

            # TODO: Recuperar o pfw_attempt_id do nome do arquivo. 
            pfw_attempt_id = 2450858

            # Le o arquivo de outputs e gera um pandas dataframe
            df = self.read_output_file(filepath)

            # Importa os resultados na tabela skybot
            try:
                t0 = datetime.now(timezone.utc)

                # rowcount = self.import_data(df)
                rowcount = 0
                t1 = datetime.now(timezone.utc)
                tdelta = t1 - t0

                self.logger.info("Imported %s records in %s" % (
                    rowcount, humanize.naturaldelta(tdelta, minimum_unit="milliseconds")))
            except Exception as e:
                raise(e)

            # # Recuperar as linhas inseridas
            # ticket = self.read_ticket_from_output(filepath)

            # self.positions_by_ticket(ticket)

            # Recupera os CCDs da exposição 
            ccds = self.ccds_by_pfw_attempt_id(pfw_attempt_id)

            # TODO: Para cada CCD associa as posições do skybot com os apontamentos do DES.
            
            # Exemplo da query para associar os CCDs. 
            # select id, 2450858 as pfw_attempt_id, 808801 as expnum, 'Y' as band, 21 as ccdnum  from tno_skybotoutput ts where q3c_poly_query("raj2000", "decj2000", '{359.694601, 0.32033, 359.694368, 0.170513, 359.994289, 0.1702, 359.994431, 0.32008}')


            # Exemplo da query que faz a associação com CCD inserindo na tabela de Posições do DES.
            # insert
            #     into
            #     des_skybotposition (exposure, ccd_id , position_id ) 
            # select
            #     2450858 as exposure,
            #     1415975826 as ccd_id,
            #     id as "position_id"
            # from
            #     tno_skybotoutput ts
            # where
            #     q3c_poly_query("raj2000","decj2000",'{359.694601, 0.32033, 359.694368, 0.170513, 359.994289, 0.1702, 359.994431, 0.32008}');        


            return dict({
                "filepath": filepath
            })

        except Exception as e:
            self.logger.error(e)
            raise (e)

    def read_output_file(self, filepath):
        """

        """
        self.logger.debug("Reading Skybot Output: [%s]" % filepath)

        # Headers que estão no arquivo e na ordem correta de leitura.
        headers = ["num", "name", "ra", "dec", "dynclass", "mv", "errpos", "d", "dracosdec",
                   "ddec", "dgeo", "dhelio", "phase", "solelong", "px", "py", "pz", "vx", "vy", "vz", "jdref"]

        df = pd.read_csv(filepath, skiprows=3, delimiter='|', names=headers)

        # Tratar o campo num para retirar os caracteres -
        df['num'] = df['num'].apply(
            lambda x: x if x.strip() is not '-' else '')

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
        columns = ['num', 'name', 'dynclass', 'ra', 'dec', 'raj2000', 'decj2000', 'mv', 'errpos', 'd', 'dracosdec',
                   'ddec', 'dgeo', 'dhelio', 'phase', 'solelong', 'px', 'py', 'pz', 'vx', 'vy', 'vz', 'jdref', 'ticket']
        # 'externallink','expnum', 'ccdnum', 'band', 'pointing_id'
        df = df.reindex(columns=columns)

        # self.logger.debug(df.head)

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
            sql = "COPY %s (num, name, dynclass, ra, dec, raj2000, decj2000, mv, errpos, d, dracosdec, ddec, dgeo, dhelio, phase, solelong, px, py, pz, vx, vy, vz, jdref, ticket) FROM STDIN with (FORMAT CSV, DELIMITER '|', HEADER);" % table

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

            Converte Dec em HMS para Degrees.
            Parameters:
                filepath (str): Output file returned by the skybot service.

            Returns:
                ticket (int): Ticket number, example: 166515392791779001
        """

        # Le o arquivo de outputs e recupera o ticket.
        # ticket é um id que identifica a requisição feita no skybot. 
        # serve para agrupar todos os resultados a mesma requisição.
        line = linecache.getline(filepath, 2)
        ticket = int(line.split(':')[1].strip())
        self.logger.debug("Skybot Ticket: [%s]" % ticket)

        return ticket

    # def positions_by_ticket(self, ticket):

    #     # Abre conexão com o banco usando sqlAlchemy
    #     db = SkybotOutputDB()
    #     # Recupera o nome da tabela skybot output
    #     rows = db.positions_by_ticket(ticket)

    #     # Converte o resultado para um pandas df.
    #     df = pd.DataFrame(rows)
    #     df = df.set_index('id')

    #     self.logger.debug(df.head())

    def ccds_by_pfw_attempt_id(self, pfw_attempt_id):
        """
            Retorna todos os ccds de uma exposição. 
            uma exposição igual N ccds normalmente 61. 
        """
        self.logger.debug("Retrieving the CCDs. pfw_attempt_id[%s]" % pfw_attempt_id)


        try:
            # Abre conexão com o banco de dados usando a Classe Pointing
            db = PointingDB()
            # Faz a query de todos os CCDs por pfw_attempt_id
            rows = db.exposure_by_pfw_attempt_id(pfw_attempt_id)

            self.logger.debug("CCDs [%s]" % len(rows))

            return rows

        except Exception as e:
            raise Exception("Failed to retrieve CCDs for exposure with pfw_attempt_id=%s. Error: [%s]" % (pfw_attempt_id, e))

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
