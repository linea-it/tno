from datetime import datetime
from io import StringIO

from sqlalchemy import Date, cast, desc, func
from sqlalchemy.sql import and_, select, text

from tno.db import DBBase


class DesSummaryDynclassDao(DBBase):
    def __init__(self, pool=True):
        super(DesSummaryDynclassDao, self).__init__(pool)

        schema = self.get_base_schema()
        self.tablename = "des_summarydynclass"
        self.tbl = self.get_table(self.tablename, schema)

    def import_data(self, dataframe):
        """
        Convert the dataframe to csv, and import it into the database.

        Parameters:
            dataframe (dataframe): Pandas Dataframe with the information to be imported.

        Returns:
            rowcount (int):  the number of rows imported.

        Example SQL Copy:
            COPY des_summarydynclass (dynclass, asteroids, ccds, positions, g, r, i, z, y, u, job_id) FROM '/data/teste.csv' with (FORMAT CSV, DELIMITER ';', HEADER);

        """
        # Converte o Data frame para csv e depois para arquivo em memória.
        # Mantem o header do csv para que seja possivel escolher na query COPY quais colunas
        # serão importadas.
        # Desabilita o index para o pandas não criar uma coluna a mais com id que não corresponde a tabela.
        data = StringIO()
        dataframe.to_csv(
            data,
            sep="|",
            header=True,
            index=False,
        )
        data.seek(0)

        try:
            # Recupera o nome da tabela skybot output
            table = str(self.tbl)

            # Sql Copy com todas as colunas que vão ser importadas e o formato do csv.
            sql = (
                "COPY %s (dynclass, asteroids, ccds, positions, g, r, i, z, y, u, job_id) FROM STDIN with (FORMAT CSV, DELIMITER '|', HEADER);"
                % table
            )

            # Executa o metodo que importa o arquivo csv na tabela.
            rowcount = self.import_with_copy_expert(sql, data)

            # Retorna a quantidade de linhas que foram inseridas.
            return rowcount

        except Exception as e:
            raise Exception("Failed to import data. Error: [%s]" % e)
