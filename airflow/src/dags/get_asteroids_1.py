import sys

sys.path.append("/opt/airflow/include")

import csv
import datetime
import json
import logging
import os
from pathlib import Path

import pandas as pd
import pendulum
import requests
from include.hooks.sbdb_hook import SbdbHook

from airflow.decorators import dag, task
from airflow.operators.python import PythonOperator
from airflow.providers.postgres.hooks.postgres import PostgresHook
from airflow.providers.postgres.operators.postgres import PostgresOperator

DATALAKE = Path("/opt/airflow/datalake")
SBDB_PATH = DATALAKE.joinpath("sbdb")
ASTEROIDS_PATH = SBDB_PATH.joinpath("asteroids")


def get_data():
    # logging.info("INICIOU GET DATA")
    try:

        ASTEROIDS_PATH.mkdir(parents=True, exist_ok=True)

        # logging.info("TESTE")
        postgres_hook = PostgresHook(postgres_conn_id="tno_admin_db")
        conn = postgres_hook.get_conn()
        cur = conn.cursor()
        cur.execute(
            "select id, name, number, principal_designation, alias, base_dynclass , dynclass  from tno_asteroid order by id asc limit 5"
        )

        paths = []
        page = 1
        while True:
            rows = cur.fetchmany(3)
            if len(rows) == 0:
                break

            name = f"asteroids_{page}"
            filepath = ASTEROIDS_PATH.joinpath(f"{name}.csv")
            with open(filepath, "w") as f:
                csv_writer = csv.writer(f)
                csv_writer.writerow(i[0] for i in cur.description)
                csv_writer.writerows(rows)
                # logging.info(f"Rows: {rows}")
            paths.append({"name": name, "filepath": str(filepath), "output_path": str(SBDB_PATH.joinpath(name))})
            page += 1
        cur.close()
        conn.close()

        return paths
    except Exception as e:
        logging.error(f"Error in task: {str(e)}")
        raise


def create_parent_folder(file_path):
    (Path(file_path).parent).mkdir(parents=True, exist_ok=True)


def read_block_csv(filepath):
    try:
        df = pd.read_csv(filepath, delimiter=",")
        return df
    except Exception as e:
        logging.error(f"Error in task: {str(e)}")
        raise


def get_sbdb(name, input, output):
    logging.info("GET SBDB")
    logging.info(name)
    logging.info(input)
    logging.info(output)

    df = read_block_csv(input)
    rows = df.to_dict("records")
    for row in rows:
        data = SbdbHook(row["principal_designation"]).run()
        logging.info(data)

        file_path = Path(output).joinpath(f"{row['alias']}.json")
        create_parent_folder(file_path)
        with open(file_path, "w") as fp:
            json.dump(data, fp, ensure_ascii=False)
            fp.write("\n")

        logging.info(f"File Path: {file_path}")


@task
def run_blocks(blocks, **kwargs):
    logging.info("Running Block")

    # logging.info("Type %s Len: %s" % (type(blocks), len(blocks)))
    # logging.info(kwargs)

    for block in blocks:
        logging.info(block)
        get_sbdb(block["name"], block["filepath"], block["output_path"])


@dag(
    dag_id="get_asteroids_1",
    schedule_interval="0 0 * * *",
    start_date=pendulum.datetime(2024, 1, 1, tz="UTC"),
    catchup=False,
    dagrun_timeout=datetime.timedelta(minutes=60),
    render_template_as_native_obj=True,
)
def GetAsteroids():

    task_1 = PythonOperator(
        task_id="get_asteroids",
        python_callable=get_data,
        provide_context=True,
    )

    run_blocks(blocks=task_1.output)


dag = GetAsteroids()
