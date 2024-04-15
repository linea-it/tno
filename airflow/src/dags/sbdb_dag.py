import sys

sys.path.append("/opt/airflow/include")

from datetime import datetime, timedelta
from pathlib import Path

import pendulum
from include.operators.sbdb_operator import SbdbOperator

from airflow.decorators import dag, task, task_group
from airflow.providers.http.sensors.http import HttpSensor

DATALAKE = Path("/opt/airflow/datalake")


@dag(
    dag_id="sbdb_dag",
    start_date=pendulum.datetime(2024, 1, 1, tz="UTC"),
    catchup=False,
    # render Jinja template as native Python object
    render_template_as_native_obj=True,
)
def sbdb_dag():

    # DATALAKE_BRONZE = DATALAKE.joinpath("sbdb")
    # TIMESTAMP_FORMAT = "%Y-%m-%dT%H:%M:%S.00Z"
    # end_time = datetime.now().strftime(TIMESTAMP_FORMAT)
    # start_time = (datetime.now() + timedelta(-1)).date().strftime(TIMESTAMP_FORMAT)
    # query = "Chiron"

    # task_http_sensor_check = HttpSensor(
    #     task_id="http_sensor_check",
    #     http_conn_id="sbdb_default",
    #     endpoint="",
    #     request_params={},
    #     response_check=lambda response: "httpbin" in response.text,
    #     poke_interval=5,
    # )

    @task()
    def get_asteroids() -> list:
        asteroids = [
            "2002 DH5",
            "2015 BQ311",
            "2005 VD",
            "2013 EK73",
            "2005 RO43",
        ]
        # "2012 UT68",
        # "2013 XZ8",
        # "2014 AT28",
        # "2014 ON6",
        # "2000 GQ148",
        return asteroids

    @task_group(group_id="http_handling")
    def sbdb_extract(asteroid: str):
        SbdbOperator(
            query=asteroid,
            output_path=DATALAKE.joinpath(
                "sbdb",
                "extract",
            ),
            task_id="sbdb_extract_run",
            max_active_tis_per_dag=2,
            retries=3,
        )

    sbdb_extract.expand(asteroid=get_asteroids())

    # http_handling = SbdbOperator.partial(task_id="sbdb_extract", max_active_tis_per_dag=2, retries=0).expand(
    #     query=get_asteroids(),
    #     output_path=str(
    #         DATALAKE.joinpath(
    #             "sbdb",
    #             "extract",
    #         )
    #     ),
    # )

    # @task()
    # def get_asteroids() -> str:
    #     asteroids = [
    #         "2002 DH5",
    #         "2015 BQ311",
    #         "2005 VD",
    #         "2013 EK73",
    #         "2005 RO43",
    #     ]
    #     return asteroids

    # asteroids = get_asteroids()

    # http_handling = SbdbOperator.partial(task_id="sbdb_extract", max_active_tis_per_dag=2).expand(
    #     query=asteroids,
    #     # extract_path=str(
    #     #     DATALAKE.joinpath(
    #     #         "sbdb",
    #     #         "extract",
    #     #     )
    #     # ),
    #     # task_id="sbdb_extract_run",
    #     # ,
    # )


dag = sbdb_dag()
