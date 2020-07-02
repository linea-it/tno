from datetime import datetime
from io import StringIO

from sqlalchemy import Date, cast, desc, func
from sqlalchemy.sql import and_, select

from tno.db import DBBase


class DesSkybotJobResultDao(DBBase):
    def __init__(self, pool=True):
        super(DesSkybotJobResultDao, self).__init__(pool)

        schema = self.get_base_schema()
        self.tablename = 'des_skybotjobresult'
        self.tbl = self.get_table(self.tablename, schema)

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
            sql = "COPY %s (ticket, success, execution_time, positions, inside_ccd, outside_ccd, filename, exposure_id, job_id) FROM STDIN with (FORMAT CSV, DELIMITER '|', HEADER);" % table

            # Executa o metodo que importa o arquivo csv na tabela.
            rowcount = self.import_with_copy_expert(sql, data)

            # Retorna a quantidade de linhas que foram inseridas.
            return rowcount

        except Exception as e:
            raise Exception("Failed to import data. Error: [%s]" % e)

    def count_exec_by_period(self, start, end):
        """
            Esta query retorna o total de exposições executadas dentro do periodo. agrupadas por data.
            Faz um left join com a tabela de exposições para retornar todas as datas que tem exposição,
            mas a contagem e feita na tabela skybot_job_result que são as exposições que já foram executadas.

            select
                distinct date(de.date_obs),
                count(ds.exposure_id) as count
            from
                des_exposure de
            left join des_skybotjobresult ds on
                (de.id = ds.exposure_id )
            where
                de.date_obs between '2019-01-01 00:00:00' and '2019-01-31 23:59:50'
            group by
                date(de.date_obs)
            order by
                date(de.date_obs);
        """
        # des_exposure
        de_tbl = self.get_table('des_exposure', self.get_base_schema())

        # des_skybotjobresult
        ds_tbl = self.tbl

        stm_join = de_tbl.join(ds_tbl, de_tbl.c.id ==
                               ds_tbl.c.exposure_id, isouter=True)

        stm = select([
            cast(de_tbl.c.date_obs, Date).distinct().label('date'),
            func.count(ds_tbl.c.exposure_id).label('count')]).\
            select_from(stm_join).\
            where(and_(de_tbl.c.date_obs.between(str(start), str(end)))).\
            group_by(cast(de_tbl.c.date_obs, Date)).\
            order_by(cast(de_tbl.c.date_obs, Date))

        self.debug_query(stm, True)

        rows = self.fetch_all_dict(stm)

        return rows

    def not_exec_by_period(self, start, end):
        """
            Retorna todas as exposições que não foram executadas pelo skybot
            para um periodo.

            Parameters:
                start (datetime): Periodo inicial que sera usado na seleção.

                end (datetime): Periodo final que sera usado na seleção.

            Returns:
                rows (array) Exposições que ainda não foram executadas pelo skybot.


        select
            de.*
        from
            des_exposure de
        where
            de.date_obs between '2019-01-01 00:00:00' and '2019-01-31 23:59:50'
            and de.id not in (
            select
                ds.exposure_id
            from
                des_skybotjobresult ds)

        """
        # des_exposure
        de_tbl = self.get_table('des_exposure', self.get_base_schema())

        # des_skybotjobresult
        ds_tbl = self.tbl

        stm = select(de_tbl.c).\
            where(
                and_(
                    de_tbl.c.date_obs.between(str(start), str(end)),
                    de_tbl.c.id.notin_(
                        select([ds_tbl.c.exposure_id])
                    )
                )
        ).\
            order_by(de_tbl.c.date_obs)

        self.debug_query(stm, True)

        rows = self.fetch_all_dict(stm)

        return rows
