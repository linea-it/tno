from sqlalchemy.sql import and_, select
from sqlalchemy import desc
from tno.db import DBBase


class DesSkybotJobDao(DBBase):
    def __init__(self):
        super(DesSkybotJobDao, self).__init__()

        schema = self.get_base_schema()
        self.tablename = 'des_skybotjob'
        self.tbl = self.get_table(self.tablename, schema)

    def get_tablename(self):
        return self.tablename

    def get_tbl(self):
        return self.tbl

    def get_by_id(self, id):

        stm = select(self.tbl.c).where(and_(self.tbl.c.id == int(id)))

        self.debug_query(stm, True)

        row = self.fetch_one_dict(stm)

        return row

    def get_by_status(self, status):

        stm = select(self.tbl.c).where(and_(self.tbl.c.status == int(status))).order_by(desc(self.tbl.c.status))

        self.debug_query(stm, True)

        rows = self.fetch_all_dict(stm)

        return rows

