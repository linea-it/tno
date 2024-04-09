import sys

sys.path.append("/opt/airflow/include")

from datetime import datetime, timedelta
from pathlib import Path

import pendulum
from include.operators.twitter_operator import TwitterOperator

from airflow.decorators import dag, task

DATALAKE = Path("/opt/airflow/datalake")


@dag(dag_id="twitter_dag", start_date=pendulum.datetime(2024, 1, 1, tz="UTC"), catchup=False)
def twitter_dag():

    DATALAKE_BRONZE = DATALAKE.joinpath("twitter_datascience")
    TIMESTAMP_FORMAT = "%Y-%m-%dT%H:%M:%S.00Z"
    end_time = datetime.now().strftime(TIMESTAMP_FORMAT)
    start_time = (datetime.now() + timedelta(-1)).date().strftime(TIMESTAMP_FORMAT)
    query = "datascience"

    to = TwitterOperator(
        file_path=str(
            DATALAKE_BRONZE.joinpath(
                f"extract_date={datetime.now().date()}",
                f"datascience_{datetime.now().date().strftime('%Y%m%d')}.json",
            )
        ),
        query=query,
        start_time=start_time,
        end_time=end_time,
        task_id="test_run",
    )


dag = twitter_dag()
