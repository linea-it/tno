import yfinance
from airflow.decorators import dag, task
from airflow.macros import ds_add
from pathlib import Path
import pendulum

DATALAKE = Path("/opt/airflow/datalake")
DATALAKE_BRONZE = DATALAKE.joinpath("crypto")

TICKERS = ["BTC", "ETH", "DOGE", "AVAX"]


@task()
def get_history(ticker, ds=None, ds_nodash=None):
    output = DATALAKE_BRONZE.joinpath(ticker, f"{ticker}_{ds_nodash}.csv")
    output.parent.mkdir(parents=True, exist_ok=True)
    yfinance.Ticker(ticker).history(
        period="1d",
        interval="1h",
        start=ds_add(ds, -1),
        end=ds,
    ).to_csv(output)


@dag(dag_id="get_crypto_dag", schedule="0 0 * * *", start_date=pendulum.datetime(2024, 1, 1, tz="UTC"), catchup=True)
def get_crypto_dag():
    """Executando de terca a sabado."""

    for ticker in TICKERS:
        get_history.override(task_id=ticker, pool="small_pool")(ticker)


dag = get_crypto_dag()
