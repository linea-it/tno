import logging

import pandas as pd
from django.conf import settings

from tno.skybotoutput import SkybotOutput as SkybotOutputDB


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

        # Le o arquivo de outputs e gera um pandas dataframe
        df = self.read_output_file(filepath)

        # TODO: Adiciona informação sobre a exposição.
        # Colunas pfw_attempt_id, expnum, ccdnum, band
        # CCDnum sera preenchida depois usando Q3C.

        # TODO: Talvez seja interessante inserir a coluna id já preenchica. 


        # TODO: Exemplo da query COPY que funcionou.
        # COPY tno_skybotoutput (num, name, dynclass, ra, dec, raj2000, decj2000, mv, errpos, d, dracosdec, ddec, dgeo, dhelio, phase, solelong, px, py, pz, vx, vy, vz, jdref) FROM '/data/teste.csv' with (FORMAT CSV, DELIMITER ';', HEADER);

        # Convert o dataframe para csv.
        output_file = "/archive/skybot_output/1/teste.csv"
        df.to_csv(
            output_file,
            sep=";",
            header=True,
            index=False,
            # header=columns
        )

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

    def read_output_file(self, filepath):
        self.logger.debug("Reading Skybot Output: [%s]" % filepath)

        # Headers que estão no arquivo e na ordem correta de leitura.
        headers = ["num", "name", "ra", "dec", "dynclass", "mv", "errpos", "d", "dra", "ddec",
                   "dg", "dh", "phase", "sunelong", "x", "y", "z", "vx", "vy", "vz", "epoch"]

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
        df = df.applymap(lambda x: x.strip() if type(x)==str else x)

        # Mudar a ordem das colunas de arcordo com a ordem  da tabela. 
        # Isso facilita a importacao por csv.
        columns = ['num', 'name', 'dynclass', 'ra', 'dec', 'raj2000', 'decj2000', 'mv', 'errpos', 'd', 'dracosdec',
                   'ddec', 'dgeo', 'dhelio', 'phase', 'solelong', 'px', 'py', 'pz', 'vx', 'vy', 'vz', 'jdref', ]
        # 'externallink','expnum', 'ccdnum', 'band', 'pointing_id'
        df = df.reindex(columns=columns)

        # self.logger.debug(df.head)


        return df

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

        return float(RA)

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

        return float(DEC)


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