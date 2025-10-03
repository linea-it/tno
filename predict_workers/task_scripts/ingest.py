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

        events_count = 0
        if not df.empty:
            events_count = self.occultation_dao.upinsert_occultations(df)
            self.log.info(f"{events_count} occultation records upserted.")

        # Also read the star catalog to report how many stars were used.
        star_catalog = workdir.joinpath("star_catalog.csv")
        df_stars = pd.read_csv(
            star_catalog,
            delimiter=";",
        )
        stars_count = df_stars.shape[0]
        # self.log.info(f"{stars_count} star records read from catalog.")


        output_manifest = {
            "occultations": events_count, # Number of predicted occultation events identified for this asteroid.
            "stars": stars_count, # Number of stars used for predictions.
        }


        # Cleanup the working directory
        if task.debug is False:
            self.log.info(f"Cleaning up workdir: {workdir}")
            self.cleanup_workdir(workdir)

        # Change task status to DONE
        self.update_task_status(db_session, task, PredictionState.DONE, output_manifest=output_manifest)

        self.log.info(f"Task {task.id} DONE successfully.")
