from datetime import datetime, timedelta, timezone
from typing import List, Union

from dao.db_base import DBBase
from sqlalchemy.sql import and_, select, update


class PredictOccultationJobDao(DBBase):
    def __init__(self):
        super(PredictOccultationJobDao, self).__init__()

        self.tbl = self.get_table("tno_predictionjob")

    def get_job_by_status(self, status: Union[int, List[int]]):
        # (1, "Idle"),
        # (2, "Running"),
        # (3, "Completed"),
        # (4, "Failed"),
        # (5, "Aborted"),
        # (6, "Warning"),
        # (7, "Aborting"),
        # (8, "Consolidating"),

        if isinstance(status, list):
            condition = self.tbl.c.status.in_(status)
        else:
            condition = self.tbl.c.status == status

        stm = (
            select(self.tbl.c)
            .where(and_(condition))
            .order_by(self.tbl.c.submit_time)
            .limit(1)
        )
        return self.fetch_one_dict(stm)

    def get_job_by_id(self, id: int) -> dict:

        stm = select(self.tbl.c).where(and_(self.tbl.c.id == id))

        return self.fetch_one_dict(stm)

    def get_status_id_from_string(self, status):
        labels = [
            "Idle",
            "Running",
            "Completed",
            "Failed",
            "Aborted",
            "Warning",
            "Aborting",
            "Consolidating",
        ]
        return labels.index(status) + 1

    def update_job(self, job):

        if isinstance(job["status"], str):
            status = self.get_status_id_from_string(job["status"])

        stm = (
            update(self.tbl)
            .where(and_(self.tbl.c.id == int(job["id"])))
            .values(
                status=status,
                path=job["path"],
                start=job.get("start", None),
                end=job.get("end", None),
                exec_time=timedelta(seconds=job.get("exec_time", 0)),
                # h_exec_time=job.get('h_exec_time', None),
                avg_exec_time=job.get("avg_exec_time", 0),
                count_asteroids=job.get("count_asteroids", 0),
                count_asteroids_with_occ=job.get("ast_with_occ", 0),
                count_occ=job.get("occultations", 0),
                count_success=job.get("count_success", 0),
                count_failures=job.get("count_failures", 0),
                error=job.get("error", None),
                traceback=job.get("traceback", None),
            )
        )

        engine = self.get_db_engine()
        with engine.connect() as con:
            return con.execute(stm)

    def development_reset_job(self, job_id):
        job = self.get_job_by_id(job_id)

        stm = (
            update(self.tbl)
            .where(and_(self.tbl.c.id == int(job["id"])))
            .values(
                path="",
                submit_time=datetime.now(tz=timezone.utc),
                status=1,
                start=None,
                end=None,
                exec_time=timedelta(seconds=0),
                error=None,
                traceback=None,
                count_asteroids=0,
                count_asteroids_with_occ=0,
                count_occ=0,
                count_success=0,
                count_failures=0,
                avg_exec_time=0,
            )
        )

        engine = self.get_db_engine()
        with engine.connect() as con:
            return con.execute(stm)
