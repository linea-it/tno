import logging
from io import StringIO 
import pandas as pd
from django.conf import settings
from tno.db import DBBase

from tno.skybotoutput import SkybotOutput as SkybotOutputDB

import humanize
from datetime import datetime,timedelta, timezone

class DesImportSkybotOutput():

    def __init__(self):
        self.logger = logging.getLogger("skybot_load_data")

        # try:
        #     self.dbsk = SkybotOutputDB()
        # except Exception as e:
        #     self.logger.error(e)

    def import_output_file(self, filepath):
        self.logger.info("----------------------------------------------")
        self.logger.info("Importing Skybot Output: [%s]" % filepath)

        try:
            # Le o arquivo de outputs e gera um pandas dataframe
            df = self.read_output_file(filepath)

            # TODO: Adiciona informação sobre a exposição.
            # Colunas pfw_attempt_id, expnum, ccdnum, band
            # CCDnum sera preenchida depois usando Q3C.

            # TODO: Talvez seja interessante inserir a coluna id já preenchica.

            # TODO: Exemplo da query COPY que funcionou.

            try:
                t0 = datetime.now(timezone.utc)

                rowcount = self.import_data(df)

                t1 = datetime.now(timezone.utc)
                tdelta = t1 - t0

                self.logger.info("Imported %s records in %s" % (rowcount, humanize.naturaldelta(tdelta, minimum_unit="milliseconds")))
            except Exception as e:
                raise(e)


            # Apenas para debug
            # i = 0
            # for row in df.itertuples():
            #     self.logger.debug("Row: [%s] Name: [%s] Num: [%s]" % (i, getattr(row, "name"), getattr(row, "num")))
            #     # self.logger.debug("Row: [%s] RA: [%s -> %s] Dec: [%s -> %s]" % (i, getattr(row, "ra"), getattr(row, "raj2000"), getattr(row, "dec"), getattr(row, "decj2000")))
            #     i += 1
            # self.logger.debug("Total: [%s]" % i)
            # self.logger.debug("Total2: [%s]" % df.shape[0])

            return dict({
                "filepath": filepath
            })

        except Exception as e:
            self.logger.error(e)
            raise e

    def read_output_file(self, filepath):
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

        # Mudar a ordem das colunas de arcordo com a ordem  da tabela.
        # Isso facilita a importacao por csv.
        columns = ['num', 'name', 'dynclass', 'ra', 'dec', 'raj2000', 'decj2000', 'mv', 'errpos', 'd', 'dracosdec',
                   'ddec', 'dgeo', 'dhelio', 'phase', 'solelong', 'px', 'py', 'pz', 'vx', 'vy', 'vz', 'jdref', ]
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
            sql = "COPY %s (num, name, dynclass, ra, dec, raj2000, decj2000, mv, errpos, d, dracosdec, ddec, dgeo, dhelio, phase, solelong, px, py, pz, vx, vy, vz, jdref) FROM STDIN with (FORMAT CSV, DELIMITER '|', HEADER);" % table

            # Executa o metodo que importa o arquivo csv na tabela. 
            rowcount = dbbase.import_with_copy_expert(sql, data)

            self.logger.debug("Successfully imported")

            # Retorna a quantidade de linhas que foram inseridas.
            return rowcount

        except Exception as e:
            raise("Failed to import data. Error: [%s]" % e)

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



# https://stackoverflow.com/questions/13125236/sqlalchemy-psycopg2-and-postgresql-copy
# def to_sql(engine, df, table, if_exists='fail', sep='\t', encoding='utf8'):
#     # Create Table
#     df[:0].to_sql(table, engine, if_exists=if_exists)

#     # Prepare data
#     output = cStringIO.StringIO()
#     df.to_csv(output, sep=sep, header=False, encoding=encoding)
#     output.seek(0)

#     # Insert data
#     connection = engine.raw_connection()
#     cursor = connection.cursor()
#     cursor.copy_from(output, table, sep=sep, null='')
#     connection.commit()
#     cursor.close()


# ----------------------
# Outra solução Usando copy expert
# https://stackoverflow.com/questions/30050097/copy-data-from-csv-to-postgresql-using-python
# csv_file_name = '/home/user/some_file.csv'
# sql = "COPY table_name FROM STDIN DELIMITER '|' CSV HEADER"
# cursor.copy_expert(sql, open(csv_file_name, "r"))

# Lista de boas soluções
# https://www.codementor.io/@bruce3557/graceful-data-ingestion-with-sqlalchemy-and-pandas-pft7ddcy6

# Exemplo usando SQLAlchemy Core
# https://docs.sqlalchemy.org/en/13/faq/performance.html#i-m-inserting-400-000-rows-with-the-orm-and-it-s-really-slow
