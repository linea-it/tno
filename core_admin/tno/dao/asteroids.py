from sqlalchemy import func
from sqlalchemy.sql import and_, select, text

from tno.db import DBBase


class AsteroidDao(DBBase):
    def __init__(self, pool=True):
        super(AsteroidDao, self).__init__(pool)

        schema = self.get_base_schema()
        self.tablename = 'tno_asteroid'
        self.tbl = self.get_table(self.tablename, schema)

    def get_tablename(self):
        return self.tablename

    def get_tbl(self):
        return self.tbl

    def count(self):
        return self.get_count(self.get_tbl())

    def insert_update(self):

        stm = text("""INSERT INTO tno_asteroid ("name", "number", base_dynclass, dynclass) SELECT DISTINCT(sp.name), sp."number", sp.base_dynclass, sp.dynclass from skybot_position sp ON CONFLICT ("name") DO UPDATE SET "number" = EXCLUDED.number, base_dynclass = EXCLUDED.base_dynclass, dynclass = EXCLUDED.dynclass;""")

        self.debug_query(stm, True)

        result = self.execute(stm)
        return result.rowcount

    def asteroids_by_base_dynclass(self, dynclass):

        tbl = self.get_tbl()

        stm = select(tbl.c).where(
            and_(tbl.c.base_dynclass == dynclass)).order_by(tbl.c.name)

        self.debug_query(stm, True)

        rows = self.fetch_all_dict(stm)

        return rows

    def count_asteroids_by_base_dynclass(self, dynclass):

        tbl = self.get_tbl()

        stm = select([func.count(tbl.c.name)]).where(
            and_(tbl.c.base_dynclass == dynclass))

        self.debug_query(stm, True)

        rows = self.fetch_scalar(stm)

        return rows

    def asteroids_by_name(self, name):

        tbl = self.get_tbl()

        stm = select(tbl.c).where(and_(tbl.c.name == name))

        self.debug_query(stm, True)

        row = self.fetch_one_dict(stm)

        return row
