from datetime import datetime

from sqlalchemy import desc
from sqlalchemy.sql import and_, select
from tno.db import DBBase


class DesSkybotJobDao(DBBase):
    def __init__(self, pool=True):
        super(DesSkybotJobDao, self).__init__(pool)

        schema = self.get_base_schema()
        self.tablename = "des_skybotjob"
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
        """Retorna os jobs pelo status
        ATENÇÃO: Os jobs estão ordenados pela data de criação em ordem ascendente. está ordem é importante para o pipeline.

        Arguments:
            status {int} -- Status do job, como está definido no Model des/SkybotJob

        Returns:
            [array] -- Um Array com os jobs, tem a mesma estrutura do Model des/SkybotJob
        """
        stm = (
            select(self.tbl.c)
            .where(and_(self.tbl.c.status == int(status)))
            .order_by(self.tbl.c.start)
        )

        rows = self.fetch_all_dict(stm)

        return rows

    def update_by_id(self, id, job):
        stm = (
            self.tbl.update()
            .where(self.tbl.c.id == int(id))
            .values(
                status=job["status"],
                start=job["start"],
                exposures=job["exposures"],
                nights=job["nights"],
                ccds=job["ccds"],
                positions=job["positions"],
                asteroids=job["asteroids"],
                exposures_with_asteroid=job["exposures_with_asteroid"],
                ccds_with_asteroid=job["ccds_with_asteroid"],
                path=job["path"],
                results=job["results"],
                estimated_execution_time=job["estimated_execution_time"],
            )
        )

        return self.execute(stm)

    def complete_job(self, id, job):
        stm = (
            self.tbl.update()
            .where(self.tbl.c.id == int(id))
            .values(
                status=job["status"],
                # finish=job['finish'].strftime('%Y-%m-%d %H:%M:%S'),
                finish=job["finish"],
                execution_time=job["execution_time"],
                error=job["error"],
            )
        )

        return self.execute(stm)
