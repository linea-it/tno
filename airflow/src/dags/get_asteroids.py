import sys

sys.path.append("/opt/airflow/include")

import csv
import datetime
import logging
import os
from pathlib import Path

import pendulum
import requests

from airflow.decorators import dag, task
from airflow.providers.postgres.hooks.postgres import PostgresHook
from airflow.providers.postgres.operators.postgres import PostgresOperator

DATALAKE = Path("/opt/airflow/datalake")
ASTEROIDS_PATH = Path("/opt/airflow/datalake/sbdb/asteroids")


@dag(
    dag_id="get_asteroids",
    schedule_interval="0 0 * * *",
    start_date=pendulum.datetime(2024, 1, 1, tz="UTC"),
    catchup=False,
    dagrun_timeout=datetime.timedelta(minutes=60),
)
def GetAsteroids():

    @task
    def get_data():
        # logging.info("INICIOU GET DATA")
        try:

            ASTEROIDS_PATH.mkdir(parents=True, exist_ok=True)

            # logging.info("TESTE")
            postgres_hook = PostgresHook(postgres_conn_id="tno_admin_db")
            conn = postgres_hook.get_conn()
            cur = conn.cursor()
            cur.execute(
                "select id, name, number, principal_designation, alias, base_dynclass , dynclass  from tno_asteroid order by id asc limit 11"
            )

            paths = []
            page = 1
            while True:
                rows = cur.fetchmany(2)
                if len(rows) == 0:
                    break

                filepath = ASTEROIDS_PATH.joinpath(f"asteroids_{page}.csv")
                with open(filepath, "w") as f:
                    csv_writer = csv.writer(f)
                    csv_writer.writerow(i[0] for i in cur.description)
                    csv_writer.writerows(rows)
                    # logging.info(f"Rows: {rows}")
                paths.append(str(filepath))
                page += 1
            cur.close()
            conn.close()

            return paths
        except Exception as e:
            logging.error(f"Error in task: {str(e)}")
            raise

    get_data()


dag = GetAsteroids()
