from datetime import datetime
from pathlib import Path

import pandas as pd
from airflow.models import BaseOperator


class ExposureOperator(BaseOperator):

    def __init__(self, base_path: Path, database_path: Path, *args, **kwargs):
        self.base_path = base_path
        self.database_path = database_path
        super().__init__(*args, **kwargs)

    def execute(self, context) -> list:
        self.log.info("Executing Exposure Operator")

        # Create Job path
        job_path = self.base_path.joinpath(str(datetime.now().date()))
        job_path.mkdir(parents=True, exist_ok=True)

        self.log.info(f"JOB_PAHT: {job_path}")

        # https://pythonspeed.com/articles/pandas-read-csv-fast/
        # https://saturncloud.io/blog/how-to-efficiently-read-large-csv-files-in-python-pandas/#:~:text=Use%20Chunking,into%20memory%20at%20a%20time.
        exposures_csv = self.database_path.joinpath("exposures.csv")
        # # exposures_pq = database_path.joinpath("exposures.parquet")

        df = pd.read_csv(
            exposures_csv, nrows=2, delimiter="|", usecols=["id", "date_obs", "radeg", "decdeg", "exptime"]
        )

        # # TODO: Aplicar correção na date_obs
        df["date_with_correction"] = df["date_obs"]

        exposures = df.to_dict(orient="records")

        self.log.info(f"Exposures: {len(exposures)}")
        self.log.debug(list(exposures))

        return list(exposures)


if __name__ == "__main__":
    base_path = Path(f"/opt/airflow/data/skybot")
    database_path = Path("/opt/airflow/data/skybot/des_database")
    to = ExposureOperator(task_id="Prepare-Exposures", base_path=base_path, database_path=database_path)
    exposures = to.execute()
    print(exposures)
