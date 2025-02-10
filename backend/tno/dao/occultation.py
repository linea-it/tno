import warnings
from datetime import datetime, timezone

from sqlalchemy import delete, func, insert, update
from sqlalchemy.sql import and_, select, text

with warnings.catch_warnings():
    warnings.simplefilter("ignore")
    from tno.db import DBBase


class OccultationDao(DBBase):
    def __init__(self, pool=True):
        super(OccultationDao, self).__init__(pool)

        schema = self.get_base_schema()
        self.tablename = "tno_occultation"
        self.tbl = self.get_table(self.tablename, schema)

    def get_tablename(self):
        return self.tablename

    def get_tbl(self):
        return self.tbl

    def count(self):
        return self.get_count(self.get_tbl())

    def count_distict_asteroid_name(self):
        tbl = self.get_tbl()

        stm = select([func.count(func.distinct(tbl.c.name))])

        self.debug_query(stm, True)
        return self.fetch_scalar(stm)

    def distinct_asteroid_name(self, limit=None, offset=None):
        """Distinct asteroid name in occultation table."""
        tbl = self.get_tbl()

        stm = select(
            [
                func.distinct(tbl.c.name),
                tbl.c.number,
                tbl.c.principal_designation,
                tbl.c.alias,
            ]
        )

        if limit:
            stm = stm.limit(limit)
            if offset:
                stm = stm.offset(offset)

        self.debug_query(stm, True)
        rows = self.fetch_all_dict(stm)

        return rows

    def distinct_dynclass(self, limit=None, offset=None):
        """Distinct dynclass and basedynclass in occultation table."""
        tbl = self.get_tbl()

        stm = select(
            [
                func.distinct(tbl.c.dynclass),
                tbl.c.base_dynclass,
            ]
        )

        self.debug_query(stm, True)
        rows = self.fetch_all_dict(stm)

        return rows
