from dao.db_base import DBBase
from sqlalchemy.sql import and_, delete, select


class ObservationDao(DBBase):
    def __init__(self):
        super(ObservationDao, self).__init__()

        self.tbl = self.get_table("des_observation")

    def delete_by_asteroid_name(self, name):

        stm = delete(self.tbl).where(and_(self.tbl.c.name == name))

        engine = self.get_db_engine()
        with engine.connect() as con:
            rows = con.execute(stm)

            return rows

    def get_observations_by_name(self, name):

        stm = select(self.tbl.c).where(and_(self.tbl.c.name == name))

        rows = self.fetch_all_dict(stm)

        return rows
