from datetime import datetime

from sqlalchemy import desc, func
from sqlalchemy.sql import and_, select

from tno.db import DBBase


class DownloadCcdJobResultDao(DBBase):
    def __init__(self, pool=True):
        super(DownloadCcdJobResultDao, self).__init__(pool)

        schema = self.get_base_schema()
        self.tablename = "des_downloadccdjobresult"
        self.tbl = self.get_table(self.tablename, schema)

    def get_tablename(self):
        return self.tablename

    def get_tbl(self):
        return self.tbl

    def create(self, record):
        stm = self.tbl.insert().values(
            job_id=record["job"],
            ccd_id=record["ccd"],
            start=record["start"],
            finish=record["finish"],
            execution_time=record["execution_time"],
            file_size=record["file_size"],
        )

        return self.execute(stm)

    def count_by_job(self, job_id):

        stm = select([func.count(self.tbl.c.id)]).where(
            and_(self.tbl.c.job_id == int(job_id))
        )

        self.debug_query(stm, True)

        row = self.fetch_scalar(stm)

        return row

    def file_size_by_job(self, job_id):

        stm = select([func.sum(self.tbl.c.file_size)]).where(
            and_(self.tbl.c.job_id == int(job_id))
        )

        self.debug_query(stm, True)

        row = self.fetch_scalar(stm)

        return row

    def execution_time_by_job(self, job_id):

        stm = select([func.sum(self.tbl.c.execution_time)]).where(
            and_(self.tbl.c.job_id == int(job_id))
        )

        self.debug_query(stm, True)

        row = self.fetch_scalar(stm)

        return row

    def download_estimate(self):

        stm = select(
            [
                func.sum(self.tbl.c.execution_time).label("t_exec_time"),
                func.sum(self.tbl.c.file_size).label("t_file_size"),
                func.count(self.tbl.c.id).label("total"),
            ]
        )

        self.debug_query(stm, True)

        row = self.fetch_one_dict(stm)

        return row
