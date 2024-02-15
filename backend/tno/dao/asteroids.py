import warnings

from sqlalchemy import delete, func
from sqlalchemy.sql import and_, select, text

with warnings.catch_warnings():
    warnings.simplefilter("ignore")
    from tno.db import DBBase


class AsteroidDao(DBBase):
    def __init__(self, pool=True):
        super(AsteroidDao, self).__init__(pool)

        schema = self.get_base_schema()
        self.tablename = "tno_asteroid"
        self.tbl = self.get_table(self.tablename, schema)

    def get_tablename(self):
        return self.tablename

    def get_tbl(self):
        return self.tbl

    def count(self):
        return self.get_count(self.get_tbl())

    # def insert_update(self):
    #     """
    #     Atualiza a tabela de Asteroids
    #     Com todos os asteroids que possuem pelo menos uma posição no DES.
    #     """
    #     # ! Considerando apenas Asteroids com posição no DES.
    #     stm = text(
    #         """INSERT into tno_asteroid ("name", "number", base_dynclass, dynclass) SELECT DISTINCT(sp.name), sp."number", sp.base_dynclass, sp.dynclass FROM des_skybotposition ds INNER JOIN skybot_position sp ON (ds.position_id = sp.id) ON CONFLICT("name") DO UPDATE SET "number" = EXCLUDED.number, base_dynclass = EXCLUDED.base_dynclass, dynclass = EXCLUDED.dynclass;"""
    #     )

    #     # ! Considerando todos os Asteroids retornados pelo Skybot.
    #     # stm = text(
    #     #     """INSERT INTO tno_asteroid ("name", "number", base_dynclass, dynclass) SELECT DISTINCT(sp.name), sp."number", sp.base_dynclass, sp.dynclass from skybot_position sp ON CONFLICT ("name") DO UPDATE SET "number" = EXCLUDED.number, base_dynclass = EXCLUDED.base_dynclass, dynclass = EXCLUDED.dynclass;"""
    #     # )

    #     self.debug_query(stm, True)

    #     result = self.execute(stm)
    #     return result.rowcount

    def asteroids_by_base_dynclass(self, dynclass):

        tbl = self.get_tbl()

        stm = (
            select(tbl.c)
            .where(and_(tbl.c.base_dynclass == dynclass))
            .order_by(tbl.c.name)
        )

        self.debug_query(stm, True)

        rows = self.fetch_all_dict(stm)

        return rows

    def count_asteroids_by_base_dynclass(self, dynclass):

        tbl = self.get_tbl()

        stm = select([func.count(tbl.c.name)]).where(
            and_(tbl.c.base_dynclass == dynclass)
        )

        self.debug_query(stm, True)

        rows = self.fetch_scalar(stm)

        return rows

    def asteroids_by_name(self, name):

        tbl = self.get_tbl()

        stm = select(tbl.c).where(and_(tbl.c.name == name))

        self.debug_query(stm, True)

        row = self.fetch_one_dict(stm)

        return row

    def distinct_base_dynclass(self):
        tbl = self.get_tbl()

        stm = select([func.distinct(tbl.c.base_dynclass)])

        self.debug_query(stm, True)

        rows = self.fetch_scalars(stm)

        return rows

    def distinct_dynclass(self):
        tbl = self.get_tbl()

        stm = select([func.distinct(tbl.c.dynclass)])

        self.debug_query(stm, True)

        rows = self.fetch_scalars(stm)

        return rows

    def delete_all(self):
        # ! Deleta todos os registros na TNO_Occultations

        tbl = self.get_tbl()
        stm = delete(tbl)

        return self.execute(stm)

    def reset_table(self):
        # Apaga todo conteudo da tabela, e reinicia o campo auto increment.

        self.delete_all()

        # tbl = self.get_tbl()

        stm = text("ALTER SEQUENCE tno_asteroid_id_seq RESTART WITH 1;")

        self.debug_query(stm, True)

        result = self.execute(stm)
        return result.rowcount

    def import_asteroids(self, data, delimiter=","):

        # Sql Copy com todas as colunas que vão ser importadas e o formato do csv.
        sql = f"COPY {self.tbl} (name, number, base_dynclass, dynclass, albedo, albedo_err_max, albedo_err_min, alias, aphelion, arg_perihelion, astorb_dynbaseclass, astorb_dynsubclass, density, density_err_max, density_err_min, diameter, diameter_err_max, diameter_err_min, epoch, g, h, inclination, last_obs_included, long_asc_node, mass, mass_err_max, mass_err_min, mean_anomaly, mean_daily_motion, mpc_critical_list, perihelion, pha_flag, principal_designation, rms, semimajor_axis, eccentricity ) FROM STDIN with (FORMAT CSV, DELIMITER '{delimiter}', HEADER);"

        rowcount = self.import_with_copy_expert(sql, data)

        return rowcount
