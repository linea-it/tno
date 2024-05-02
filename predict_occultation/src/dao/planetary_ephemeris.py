from datetime import datetime, timedelta, timezone

from dao.db_base import DBBase
from sqlalchemy.sql import and_, select, update


class PlanetaryEphemerisDao(DBBase):
    def __init__(self):
        super(PlanetaryEphemerisDao, self).__init__()

        self.tbl = self.get_table("tno_bspplanetary")

    def get_by_id(self, id: int) -> dict:

        stm = select(self.tbl.c).where(and_(self.tbl.c.id == id))
        pe = self.fetch_one_dict(stm)
        pe["filename"] = f"{pe['name']}.bsp"
        return pe
