from datetime import datetime

from sqlalchemy import desc

from tno.db import DBBase


class DownloadCcdJobResultDao(DBBase):
    def __init__(self, pool=True):
        super(DownloadCcdJobResultDao, self).__init__(pool)

        schema = self.get_base_schema()
        self.tablename = 'des_downloadccdjobresult'
        self.tbl = self.get_table(self.tablename, schema)

    def get_tablename(self):
        return self.tablename

    def get_tbl(self):
        return self.tbl

    def create(self, record):
        stm = self.tbl.insert().\
            values(
                job_id=record['job'],
                ccd_id=record['ccd'],
                start=record['start'],
                finish=record['finish'],
                execution_time=record['execution_time'],
                file_size=record['file_size']
        )

        return self.execute(stm)
