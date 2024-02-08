import warnings
from datetime import datetime, timezone

from sqlalchemy import delete, func, insert, update
from sqlalchemy.sql import and_, select, text

with warnings.catch_warnings():
    warnings.simplefilter("ignore")
    from tno.db import DBBase


class AsteroidJobDao(DBBase):
    def __init__(self, pool=True):
        super(AsteroidJobDao, self).__init__(pool)

        schema = self.get_base_schema()
        self.tablename = "tno_asteroidjob"
        self.tbl = self.get_table(self.tablename, schema)

    def get_tablename(self):
        return self.tablename

    def get_tbl(self):
        return self.tbl

    def count(self):
        return self.get_count(self.get_tbl())

    def insert(
        self,
        asteroids_before,
        path,
    ):

        insert_stm = insert(self.tbl).values(
            status=2,
            start=datetime.now(tz=timezone.utc),
            asteroids_before=asteroids_before,
            asteroids_after=None,
            path=path,
        )

        result = self.execute(insert_stm)
        row = result.inserted_primary_key
        return row.id

    def update(self, id, **kwargs):

        update_stm = update(self.tbl).where(self.tbl.c.id == id).values(**kwargs)

        self.execute(update_stm)

    def delete_all(self):
        # ! Deleta todos os registros na TNO_Occultations

        tbl = self.get_tbl()
        stm = delete(tbl)

        return self.execute(stm)
