import warnings
from datetime import datetime, timezone

from sqlalchemy import func
from sqlalchemy.dialects.postgresql import insert
from sqlalchemy.sql import and_, select, text

with warnings.catch_warnings():
    warnings.simplefilter("ignore")
    from tno.db import DBBase


def dynclass_cache_upsert(table, conn, keys, data_iter):

    data = [dict(zip(keys, row)) for row in data_iter]

    insert_statement = insert(table.table).values(data)
    upsert_statement = insert_statement.on_conflict_do_update(
        constraint=f"unique_dynclass",
        set_={c.key: c for c in insert_statement.excluded},
    )
    # print(upsert_statement.compile(dialect=postgresql.dialect()))
    result = conn.execute(upsert_statement)
    return result.rowcount


class DynclassCacheDao(DBBase):
    def __init__(self, pool=True):
        super(DynclassCacheDao, self).__init__(pool)

        schema = self.get_base_schema()
        self.tablename = "tno_dynclasscache"
        self.tbl = self.get_table(self.tablename, schema)

    def get_tablename(self):
        return self.tablename

    def get_tbl(self):
        return self.tbl

    def count(self):
        return self.get_count(self.get_tbl())

    def upinsert(self, df):

        with self.engine.connect() as conn:
            rowcount = df.to_sql(
                self.tablename,
                con=conn,
                if_exists="append",
                method=dynclass_cache_upsert,
                index=False,
            )

            return rowcount
