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


# @task()
def get_data():
    # logging.info("INICIOU GET DATA")
    try:

        ASTEROIDS_PATH.mkdir(parents=True, exist_ok=True)

        # logging.info("TESTE")
        postgres_hook = PostgresHook(postgres_conn_id="tno_admin_db")
        conn = postgres_hook.get_conn()
        cur = conn.cursor()
        cur.execute(
            "select id, name, number, principal_designation, alias, base_dynclass , dynclass  from tno_asteroid order by id asc"
        )

        paths = []
        page = 1
        while True:
            rows = cur.fetchmany(10000)
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
    logging.info(f"GET SBDB name:{name} input: {input} output: {output}")

    df = read_block_csv(input)
    rows = df.to_dict("records")
    for row in rows:
        file_path = Path(output).joinpath(f"{row['alias']}.json")

        if not file_path.exists():
            data = SbdbHook(row["principal_designation"]).run()
            # logging.info(data)

            create_parent_folder(file_path)
            with open(file_path, "w") as fp:
                json.dump(data, fp, ensure_ascii=False)
                fp.write("\n")

            logging.info(f"File Path: {file_path}")
        else:
            logging.info(f"Already Exist File Path: {file_path}")


@task(max_active_tis_per_dag=3, retries=10)
def run_block(block, **kwargs):
    logging.info(f"Running Block: {block}")
    get_sbdb(block["name"], block["filepath"], block["output_path"])


# @task
# def run_blocks(blocks, **kwargs):
#     logging.info("Running Block")

#     # logging.info("Type %s Len: %s" % (type(blocks), len(blocks)))
#     # logging.info(kwargs)

#     for block in blocks:
#         logging.info(block)
#         get_sbdb(block["name"], block["filepath"], block["output_path"])


default_args = {
    "owner": "airflow",
    "provide_context": True,  # This is needed
}


@dag(
    dag_id="get_asteroids_2",
    # schedule_interval="0 0 * * *",
    start_date=pendulum.datetime(2024, 1, 1, tz="UTC"),
    catchup=False,
    dagrun_timeout=datetime.timedelta(hours=12),
    render_template_as_native_obj=True,
    default_args=default_args,
    max_active_tasks=4,
)
def GetAsteroids():

    # blocks = get_data()

    # for block in blocks:
    #     get_sbdb.override(task_id=block["name"])(
    #         name=block["name"], input=block["filepath"], output=block["output_path"]
    #     )

    run_block.expand(block=get_data())


dag = GetAsteroids()
