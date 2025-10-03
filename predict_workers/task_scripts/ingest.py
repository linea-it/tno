import pathlib

import pandas as pd

from base_worker import BaseWorker
from dao.models import OccultationDAO, PredictionState


class IngestWorker(BaseWorker):
    def __init__(self, worker_name, database_url):
        super().__init__(worker_name, database_url)
        self.state_to_process = "WAITING_RESULTS"
        self.occultation_dao = OccultationDAO(self.engine, self.log)

    def perform_task(self, task, db_session):
        self.log.info(f"Performing ingest step for task id: {task.id}")

        # # Change task status to INGESTING
        self.update_task_status(db_session, task, PredictionState.INGESTING)

        workdir = pathlib.Path(task.workdir)

        occultation_file = workdir.joinpath("occultation_table.csv")

        if not occultation_file.exists():
            msg = f"Occultation file not found at [{occultation_file}]"
            self.log.error(msg)
            raise FileNotFoundError(msg)

        # Read the occultation table file and create a dataframe
        self.log.info(f"Reading occultation file.")

        df = pd.read_csv(
            occultation_file,
            delimiter=";",
        )

        self.log.info(f"Upserting occultation records into database.")

        rowcount = self.occultation_dao.upinsert_occultations(df)
        self.log.info(f"{rowcount} occultation records upserted.")

        # TODO: if debug, keep the directory.
        # Cleanup the working directory
        self.cleanup_workdir(workdir)

        # Change task status to DONE
        self.update_task_status(db_session, task, PredictionState.DONE)

        self.log.info(f"Task {task.id} DONE successfully.")
