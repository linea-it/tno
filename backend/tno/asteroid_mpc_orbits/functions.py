import calendar
import datetime
from multiprocessing import Pool

import numpy as np
import requests
from sqlalchemy import create_engine, text
from tqdm import tqdm

# # global settings
# EXCLUDE_PREDICTION_JOB_IDS = [34, 35, 36, 37]
# BASE_DYNCLASS = ["Trojan", "Centaur", "Kuiper Belt Object"]
# CHUNK_SIZE = 500


def get_start_datetime(engine):
    """
    Retrieves the start datetime for the prediction job.

    Args:
        engine (Engine): The database engine to connect to.

    Returns:
        datetime: The start datetime for the prediction job.
    """

    with engine.connect() as connection:
        query = f"""
            SELECT submit_time
            FROM tno_predictionjob
            WHERE status = 3
        """
        result = connection.execute(text(query))
        datetimes = result.fetchall()

    # Get the latest date and set it to the start of the day
    datetime_objects = [dt[0] for dt in datetimes]
    latest_datetime = max(datetime_objects)
    latest_date = latest_datetime.date()
    start_datetime = datetime.datetime.combine(
        latest_date, datetime.time.min, tzinfo=latest_datetime.tzinfo
    )
    return start_datetime


def get_mpc_updated_orbits(engine, start_datetime):
    """
    Retrieves the unpacked primary provisional designations from the MPC orbits table
    that have a fitting datetime greater than the specified start datetime.

    Parameters:
    - engine: SQLAlchemy engine object used to connect to the database.
    - start_datetime: The start datetime to filter the orbits.

    Returns:
    - A list of unpacked primary provisional designations.

    """
    with engine.connect() as connection:
        query = f"""
            SELECT unpacked_primary_provisional_designation
            FROM mpc_orbits
            WHERE fitting_datetime > '{start_datetime}'
        """
        result = connection.execute(text(query))
        provids = result.fetchall()
    return provids


def get_join_mpc_portal_asteroids(engine, provids, base_dynclass):
    """
    Retrieves the names of asteroids from the 'tno_asteroid' table that match the provided principal designations.

    Args:
        engine (sqlalchemy.engine.Engine): The SQLAlchemy engine object used to connect to the database.
        provids (list): A list of principal designations of asteroids to search for.
        base_dynclass (list, optional): A list of base dynamic classes to filter the results. Defaults to BASE_DYNCLASS.

    Returns:
        list: A list of asteroid names that match the provided principal designations and base dynamic classes.
    """
    values = ", ".join(f"('{item[0]}')" for item in provids)
    with engine.connect() as connection:
        query = f"""
            SELECT name
            FROM tno_asteroid
            INNER JOIN (
                VALUES {values}
            ) AS temp_table (names)
            ON tno_asteroid.principal_designation = temp_table.names
            WHERE tno_asteroid.base_dynclass IN ({', '.join(f"'{item}'" for item in base_dynclass)})
        """
        result = connection.execute(text(query))
        tno_names = result.fetchall()
    return tno_names


def get_asteroids_by_base_dynclass(engine, base_dynclass):
    """
    Retrieves the names of asteroids from the 'tno_asteroid' table based on the provided base dynamic class.

    Parameters:
    - engine: SQLAlchemy engine object used to connect to the database.
    - base_dynclass: List of base dynamic classes to filter the query. Defaults to BASE_DYNCLASS.

    Returns:
    - tno_names: List of asteroid names matching the provided base dynamic class.

    Example usage:
    engine = create_engine('your_database_connection_string')
    asteroid_names = get_asteroids_by_base_dynclass(engine, ['Class1', 'Class2'])
    """

    with engine.connect() as connection:
        query = f"""
            SELECT name
            FROM tno_asteroid
            WHERE tno_asteroid.base_dynclass IN ({', '.join(f"'{item}'" for item in base_dynclass)})
        """
        result = connection.execute(text(query))
        tno_names = result.fetchall()

        tno_names = np.array([pp[0] for pp in tno_names])

        return tno_names


def get_jpl_sbdb_soln_date(sstr):
    """
    Retrieves the solution date for a given solar system object from the JPL Small-Body Database (SBDB) API.

    Args:
        sstr (str): The name or designation of the solar system object.

    Returns:
        datetime.datetime or int: The solution date as a datetime object if successful, or the HTTP status code if an error occurs.
    """
    url = "https://ssd-api.jpl.nasa.gov/sbdb.api?sstr=" + sstr.strip().replace(" ", "")
    try:
        response = requests.get(url)
        soln_date = response.json()["orbit"]["soln_date"]
        soln_date = datetime.datetime.strptime(
            soln_date + " -0800", "%Y-%m-%d %H:%M:%S %z"
        )
        return soln_date
    except:
        return response.status_code


def crossmatch_with_jpl_soln_date(tno_names):
    """
    Crossmatches the given list of TNO names with JPL solution dates.

    Parameters:
    tno_names (list): A list of TNO names to crossmatch.

    Returns:
    list: A list of JPL solution dates corresponding to the TNO names.
    """
    jpl_solutions = []
    for tno_name in tqdm(tno_names, total=len(tno_names)):
        jpl_solutions.append(get_jpl_sbdb_soln_date(tno_name))

    return jpl_solutions


def get_prediction_date(future_months=15, start=False, start_datetime=None):
    """
    Calculate the prediction date based on the given parameters.

    Args:
        future_months (int): The number of months into the future to predict.
        start (bool): If True, calculate the start date of the prediction period. If False, calculate the end date.
        start_datetime (datetime.datetime): The starting datetime. If None, the current datetime is used.

    Returns:
        datetime.datetime: The prediction date.

    """
    if start_datetime is None:
        start_datetime = datetime.datetime.now()
    # we only update the upper limit every 3 months, so
    # calculate the upper limit
    lower_ref_month = (((start_datetime.month - 1) // 3) * 3) + 1
    lower_ref_year = start_datetime.year
    lower_ref_datetime = datetime.datetime(
        lower_ref_year, lower_ref_month, 1, 0, 0, 0, 0, tzinfo=datetime.timezone.utc
    )
    upper_ref_year = (
        lower_ref_datetime.year + (lower_ref_datetime.month + future_months - 1) // 12
    )
    upper_ref_month = ((lower_ref_datetime.month + future_months) % 12) - 1
    upper_ref_month = 12 if upper_ref_month == 0 else upper_ref_month
    last_day_of_month = calendar.monthrange(upper_ref_year, upper_ref_month)[1]
    if start:
        if ((lower_ref_datetime.month + future_months - 1) % 12) == 0:
            upper_ref_year -= 1
        start_date = datetime.datetime(
            upper_ref_year, upper_ref_month, last_day_of_month
        ) + datetime.timedelta(days=1)
        prediction_datetime = datetime.datetime(
            start_date.year,
            start_date.month,
            start_date.day,
            0,
            0,
            0,
            0,
            tzinfo=datetime.timezone.utc,
        )
        return prediction_datetime
    else:
        prediction_datetime = datetime.datetime(
            upper_ref_year,
            upper_ref_month,
            last_day_of_month,
            23,
            59,
            59,
            999999,
            tzinfo=datetime.timezone.utc,
        )
        return prediction_datetime


def get_asteroids_with_updated_orbits(
    adm_engine, mpc_engine, base_dynclass, limit=5000
):

    start_datetime = get_start_datetime(adm_engine)
    mpc_provids = get_mpc_updated_orbits(mpc_engine, start_datetime)
    portal_provids = get_join_mpc_portal_asteroids(
        adm_engine, mpc_provids, base_dynclass=base_dynclass
    )
    portal_provids = np.array([pp[0] for pp in portal_provids])

    print(f"portal_provids: {len(portal_provids)}")
    # SOFT LIMIT para impedir muitas requisiçoes ao JPL.
    # Caso tenha mais objetos que o limit eles serao atualizados na proxima execucao do programa.
    portal_provids = portal_provids[0:limit]

    # print(portal_provids)
    jpl_solndates = crossmatch_with_jpl_soln_date(portal_provids)
    updated_objects_index = [
        i
        for i, jpls in enumerate(jpl_solndates)
        if isinstance(jpls, datetime.datetime) and jpls >= start_datetime
    ]
    updated_objects = portal_provids[updated_objects_index]

    return updated_objects
