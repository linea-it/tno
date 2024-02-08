from sqlalchemy import delete
from sqlalchemy.sql import and_, select
from tno.db import DBBase


class DesObservationDao(DBBase):
    def __init__(self, pool=True):
        super(DesObservationDao, self).__init__(pool)

        schema = self.get_base_schema()
        self.tablename = "des_observation"
        self.tbl = self.get_table(self.tablename, schema)

    # TODO: Mover esses metodos get para a DBBase.
    def get_tablename(self):
        return self.tablename

    def delete_by_asteroid_id(self, asteroid_id):

        # des_observations
        do_tbl = self.tbl

        stm = delete(do_tbl).where(do_tbl.c.asteroid_id == int(asteroid_id))

        return self.execute(stm)

    def by_asteroid_id(self, asteroid_id):
        stm = (
            select(self.tbl.c)
            .where(and_(self.tbl.c.asteroid_id == int(id)))
            .order_by(self.tbl.c.date_obs)
        )
        rows = self.fetch_all_dict(stm)
        return rows

    def by_asteroid_name(self, name):
        stm = (
            select(self.tbl.c)
            .where(and_(self.tbl.c.name == name))
            .order_by(self.tbl.c.date_obs)
        )
        rows = self.fetch_all_dict(stm)
        return rows
