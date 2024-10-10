import datetime
from typing import Optional

import humanize
from django.conf import settings
from django.contrib.auth import get_user_model
from tno.asteroid_mpc_orbits.functions import (
    get_asteroids_by_base_dynclass,
    get_asteroids_by_dynclass,
    get_asteroids_with_updated_orbits,
    get_prediction_date,
)
from tno.db import DBBase
from tno.models import BspPlanetary, Catalog, LeapSecond
from tno.models.prediction_job import PredictionJob


def submit_predict_job(
    filter_type: str,
    filter_value: str,
    predict_start_date: datetime.datetime,
    predict_end_date: datetime.datetime,
    predict_step: int = 60,
    catalog: Optional[str] = None,
    planetary_ephemeris: Optional[str] = None,
    leap_second: Optional[str] = None,
    debug: bool = False,
    count_asteroids: int = 0,
):

    owner, created = get_user_model().objects.get_or_create(
        username=settings.PORTAL_INTERNAL_USER
    )

    if catalog is None:
        catalog = Catalog.objects.latest("id")
    else:
        catalog = Catalog.objects.get(name=catalog)

    if planetary_ephemeris is None:
        planetary_ephemeris = BspPlanetary.objects.latest("id")
    else:
        planetary_ephemeris = BspPlanetary.objects.get(name=planetary_ephemeris)

    if leap_second is None:
        leap_second = LeapSecond.objects.latest("id")
    else:
        leap_second = LeapSecond.objects.get(name=leap_second)

    interval = predict_end_date.date() - predict_start_date.date()
    predict_interval = humanize.naturaldelta(interval)

    job = PredictionJob.objects.create(
        owner=owner,
        status=1,
        catalog=catalog,
        planetary_ephemeris=planetary_ephemeris,
        leap_second=leap_second,
        filter_type=filter_type,
        filter_value=filter_value,
        predict_start_date=predict_start_date,
        predict_end_date=predict_end_date,
        predict_interval=predict_interval,
        predict_step=predict_step,
        count_asteroids=count_asteroids,
        debug=debug,
    )

    return job


def run_prediction_for_updated_asteroids(
    base_dynclass: str = None, debug: bool = False
):
    """
    Runs prediction for MPC updated asteroids.
    Creates prediction jobs for asteroids that have had their current orbit updated in the MPC.
    Args:
        base_dynclass (str, optional): The base dynamical class of asteroids to filter by. Defaults to None.
        debug (bool, optional): Flag indicating whether to run in debug mode. Defaults to False.
    """
    print("Running prediction for mpc updated asteroids")
    admin_db_engine = DBBase(db_name="default").get_engine()
    mpc_db_engine = DBBase(db_name="mpc").get_engine()

    if base_dynclass:
        input_list = [item.strip() for item in base_dynclass.split(",")]
    else:
        input_list = settings.PREDICTION_JOB_BASE_DYNCLASS

    updated_objects = get_asteroids_with_updated_orbits(
        admin_db_engine, mpc_db_engine, input_list
    )
    print(f"Updated asteroids: {len(updated_objects)}")

    if len(updated_objects) == 0:
        print("No updated asteroids found.")
        return

    start_prediction_date = datetime.datetime.now()
    end_prediction_date = get_prediction_date(future_months=15)

    for i in range(0, len(updated_objects), settings.PREDICTION_JOB_CHUNK_SIZE):
        chunk = updated_objects[i : i + settings.PREDICTION_JOB_CHUNK_SIZE]

        job = submit_predict_job(
            filter_type="name",
            filter_value=",".join(map(str, chunk)),
            predict_start_date=start_prediction_date,
            predict_end_date=end_prediction_date,
            count_asteroids=len(chunk),
            debug=debug,
        )

        print(f"Prediction job created: {job.id} with {len(chunk)} asteroids")


def run_predicition_for_upper_end_update(debug: bool = False):

    print("Running prediction for upper end update")

    admin_db_engine = DBBase(db_name="default").get_engine()

    start_prediction_date = datetime.datetime.now()
    end_prediction_date = get_prediction_date(future_months=15)

    # aqui o serviço verifica se é necessario adicionar prediçoes no
    # futuro e adiciona que não há predições para pelo menos 1,25 anos
    year_range = (
        end_prediction_date.date() - start_prediction_date.date()
    ).days / 365.25
    if year_range < 1.25:
        portal_provids = get_asteroids_by_base_dynclass(
            admin_db_engine, base_dynclass=settings.PREDICTION_JOB_BASE_DYNCLASS
        )
        print(f"Asteroids to run: {len(portal_provids)}")

        start_prediction_date = get_prediction_date(future_months=15, start=True)
        end_prediction_date = get_prediction_date(future_months=18)

        for i in range(0, len(portal_provids), settings.PREDICTION_JOB_CHUNK_SIZE):
            chunk = portal_provids[i : i + settings.PREDICTION_JOB_CHUNK_SIZE]

            job = submit_predict_job(
                filter_type="name",
                filter_value=",".join(map(str, chunk)),
                predict_start_date=start_prediction_date,
                predict_end_date=end_prediction_date,
                count_asteroids=len(chunk),
                debug=debug,
            )

            print(f"Prediction job created: {job.id} with {len(chunk)} asteroids")


def run_prediction_by_class(
    base_dynclass: str = None,
    sub_class: str = None,
    start_date: str = None,
    end_date: str = None,
    chunk_size: int = 2000,
    debug: bool = False,
):
    """
    Runs a prediction job for asteroids updated in the MPC database based on a specific dynamical class.

    This function retrieves asteroidsthat belong to a specified dynamical class (`base_dynclass`).
    It then divides these asteroids into chunks, submits prediction jobs for each chunk, and optionally prints debug information.

    Args:
        base_dynclass (str, optional): The base dynamical class of asteroids to filter by. Defaults to None.
        start_date (str, optional): The start date for the prediction range (YYYY-MM-DD). Defaults to None.
        end_date (str, optional): The end date for the prediction range (YYYY-MM-DD). Defaults to None.
        chunk_size (int, optional): Number of asteroids to include in each prediction job chunk. Defaults to 2000.
        debug (bool, optional): If True, runs the function in debug mode with additional output. Defaults to False.

    Returns:
        None
    """
    if base_dynclass or sub_class is None:
        print("Please provide a base or sub dynamical class")
        return

    if start_date is None and end_date is None:
        print("Please provide proper start and end dates")
        return

    # check if the dates are valid
    try:
        start_date = datetime.datetime.strptime(start_date, "%Y-%m-%d")
        end_date = datetime.datetime.strptime(end_date, "%Y-%m-%d")
    except ValueError:
        print("Please provide valid dates in the format YYYY-MM-DD")
        return

    admin_db_engine = DBBase(db_name="default").get_engine()

    if sub_class is not None:
        input_list = [item.strip() for item in sub_class.split(",")]
        objects = get_asteroids_by_dynclass(admin_db_engine, dynclass=input_list)
    else:
        input_list = [item.strip() for item in base_dynclass.split(",")]
        objects = get_asteroids_by_base_dynclass(
            admin_db_engine, base_dynclass=input_list
        )

    print(f"Total number of asteroids: {len(objects)}")

    if len(objects) == 0:
        print("No updated asteroids found.")
        print(
            "You might want to check if the (sub) dynamical class is correct. It must match the ones in the database."
        )
        return

    for i in range(0, len(objects), chunk_size):
        chunk = objects[
            i : i + chunk_size
        ]  # Fixed variable name from 'updated_objects' to 'objects'

        job = submit_predict_job(
            filter_type="name",
            filter_value=",".join(map(str, chunk)),
            predict_start_date=start_date,
            predict_end_date=end_date,
            count_asteroids=len(chunk),
            debug=debug,
        )

        print(f"Prediction job created: {job.id} with {len(chunk)} asteroids")
