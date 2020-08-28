from datetime import datetime

from sqlalchemy import desc
from sqlalchemy.sql import and_, select

from tno.db import DBBase


class DownloadCcdJobDao(DBBase):
    def __init__(self, pool=True):
        super(DownloadCcdJobDao, self).__init__(pool)

        schema = self.get_base_schema()
        self.tablename = 'des_downloadccdjob'
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
            status {int} -- Status do job, como está definido no Model des/DownloadCCDJob

        Returns:
            [array] -- Um Array com os jobs, tem a mesma estrutura do Model des/DownloadCCDJob
        """
        stm = select(self.tbl.c).where(and_(self.tbl.c.status ==
                                            int(status))).order_by(self.tbl.c.start)

        rows = self.fetch_all_dict(stm)

        return rows

    def update_record(self, record):
        stm = self.tbl.update().\
            where(self.tbl.c.id == int(record['id'])).\
            values(
                status=record['status'],
                ccds_to_download=record['ccds_to_download'],
                ccds_downloaded=record['ccds_downloaded'],
                estimated_execution_time=record['estimated_execution_time'],
                estimated_t_size=record['estimated_t_size'],
                nights=record['nights'],
                asteroids=record['asteroids'],
                path=record['path'],
                t_size_downloaded=record['t_size_downloaded'],
                error=record['error']
        )

        self.execute(stm)

        return self.get_by_id(int(record['id']))

    def complete_job(self, record):
        stm = self.tbl.update().\
            where(self.tbl.c.id == int(record['id'])).\
            values(
                ccds_to_download=record['ccds_to_download'],
                ccds_downloaded=record['ccds_downloaded'],
                status=record['status'],
                finish=record['finish'],
                execution_time=record['execution_time'],
                error=record['error']
        )

        return self.execute(stm)
