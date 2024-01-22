from sqlalchemy import func
from sqlalchemy.sql import and_, select, text
from sqlalchemy import delete


import warnings

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

    def insert_update(self):
        """
        Atualiza a tabela de Asteroids
        Com todos os asteroids que possuem pelo menos uma posição no DES.
        """
        # ! Considerando apenas Asteroids com posição no DES.
        stm = text(
            """INSERT into tno_asteroid ("name", "number", base_dynclass, dynclass) SELECT DISTINCT(sp.name), sp."number", sp.base_dynclass, sp.dynclass FROM des_skybotposition ds INNER JOIN skybot_position sp ON (ds.position_id = sp.id) ON CONFLICT("name") DO UPDATE SET "number" = EXCLUDED.number, base_dynclass = EXCLUDED.base_dynclass, dynclass = EXCLUDED.dynclass;"""
        )

        # ! Considerando todos os Asteroids retornados pelo Skybot.
        # stm = text(
        #     """INSERT INTO tno_asteroid ("name", "number", base_dynclass, dynclass) SELECT DISTINCT(sp.name), sp."number", sp.base_dynclass, sp.dynclass from skybot_position sp ON CONFLICT ("name") DO UPDATE SET "number" = EXCLUDED.number, base_dynclass = EXCLUDED.base_dynclass, dynclass = EXCLUDED.dynclass;"""
        # )

        self.debug_query(stm, True)

        result = self.execute(stm)
        return result.rowcount

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
    

    # def delete_all(self):
       
    #     # ! Deleta todos os registros na TNO_Occultations

    #     tbl = self.get_tbl()
    #     stm = delete(tbl)

    #     return self.execute(stm)