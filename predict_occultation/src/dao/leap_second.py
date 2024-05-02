from datetime import datetime, timedelta, timezone

from dao.db_base import DBBase
from sqlalchemy.sql import and_, select, update


class LeapSecondDao(DBBase):
    def __init__(self):
        super(LeapSecondDao, self).__init__()

        self.tbl = self.get_table("tno_leapsecond")

    def get_by_id(self, id: int) -> dict:

        stm = select(self.tbl.c).where(and_(self.tbl.c.id == id))
        ls = self.fetch_one_dict(stm)
        ls["filename"] = f"{ls['name']}.tls"
        return ls
