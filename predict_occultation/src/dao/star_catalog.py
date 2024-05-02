from datetime import datetime, timedelta, timezone

from dao.db_base import DBBase
from sqlalchemy.sql import and_, select, update


class StarCatalogDao(DBBase):
    def __init__(self):
        super(StarCatalogDao, self).__init__()

        self.tbl = self.get_table("tno_catalog")

    def get_by_id(self, id: int) -> dict:

        stm = select(self.tbl.c).where(and_(self.tbl.c.id == id))

        catalog = self.fetch_one_dict(stm)

        catalog["registration_date"] = catalog["registration_date"].isoformat()
        return catalog
