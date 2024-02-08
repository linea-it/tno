from datetime import datetime, timezone

from dao.db_base import DBBase
from sqlalchemy.sql import and_, delete, insert, select, update


class PredictOccultationJobStatusDao(DBBase):
    def __init__(self):
        super(PredictOccultationJobStatusDao, self).__init__()

        self.tbl = self.get_table("tno_predictionjobstatus")

    def update_or_insert(
        self,
        job_id: int,
        step: int,
        task: str = None,
        status: int = None,
        count: int = 0,
        current: int = 0,
        average_time: float = 0,
        time_estimate: float = 0,
        success: int = 0,
        failures: int = 0,
    ):

        prev = self.get_by_step(job_id, step)

        stm = insert(self.tbl).values(
            job_id=job_id,
            step=step,
            task=task,
            status=int(status),
            count=int(count),
            current=int(current),
            average_time=average_time,
            time_estimate=time_estimate,
            success=success,
            failures=failures,
            updated=datetime.now(tz=timezone.utc),
        )

        if prev is not None:
            stm = (
                update(self.tbl)
                .where(and_(self.tbl.c.job_id == job_id, self.tbl.c.step == step))
                .values(
                    task=task,
                    status=int(status),
                    count=int(count),
                    current=int(current),
                    average_time=average_time,
                    time_estimate=time_estimate,
                    success=success,
                    failures=failures,
                    updated=datetime.now(tz=timezone.utc),
                )
            )

        engine = self.get_db_engine()
        with engine.connect() as con:
            return con.execute(stm)

    def get_by_step(self, job_id: int, step: int):
        stm = select(self.tbl.c).where(
            and_(self.tbl.c.job_id == job_id, self.tbl.c.step == step)
        )
        return self.fetch_one_dict(stm)

    def delete_by_job_id(self, job_id):

        stm = delete(self.tbl).where(and_(self.tbl.c.job_id == job_id))

        engine = self.get_db_engine()
        with engine.connect() as con:
            rows = con.execute(stm)

            return rows
