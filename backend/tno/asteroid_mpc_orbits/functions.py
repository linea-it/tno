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


def get_asteroids_by_dynclass(engine, dynclass):
    """
    Retrieves the names of asteroids from the 'tno_asteroid' table based on the provided sub dynamic class.

    Parameters:
    - engine: SQLAlchemy engine object used to connect to the database.
    - dynclass: List of sub dynamic classes to filter the query.

    Returns:
    - tno_names: List of asteroid names matching the provided sub dynamic class.

    Example usage:
    engine = create_engine('your_database_connection_string')
    asteroid_names = get_asteroids_by_dynclass(engine, ['Class1', 'Class2'])
    """

    with engine.connect() as connection:
        query = f"""
            SELECT name
            FROM tno_asteroid
            WHERE tno_asteroid.dynclass IN ({', '.join(f"'{item}'" for item in dynclass)})
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
    # Step 1: Get today's date (current datetime)
    today = datetime.datetime.today()

    # Step 2: Function to compute the start of the current quarter (quarter starts in January, April, July, or October)
    def get_quarter_start(date):
        # Calculate the first month of the current quarter
        quarter_month_start = (date.month - 1) // 3 * 3 + 1
        # Return the date set to the 1st day of that month
        return datetime.datetime(date.year, quarter_month_start, 1)

    current_quarter_start = get_quarter_start(today)

    # Step 3: Calculate the future date by adding a fraction of a year
    # Approximate 'future_months' in terms of years, where 1 year is 12 months
    ref = future_months / 12
    future_date = current_quarter_start + datetime.timedelta(days=365 * ref)

    # Adjust date oscillations caused by fractions of years
    # We adjust to ensure the future date falls on the correct end of the month
    days_in_month = {
        1: 31,
        2: 29 if calendar.isleap(future_date.year) else 28,
        3: 31,
        4: 30,
        5: 31,
        6: 30,
        7: 31,
        8: 31,
        9: 30,
        10: 31,
        11: 30,
        12: 31,
    }
    # Calculate the difference between the computed future date and the actual end of the month
    above = abs(
        future_date
        - datetime.datetime(
            future_date.year, future_date.month, days_in_month[future_date.month]
        )
    )
    # Set the future date to the last day of the computed month
    new_future_date = datetime.datetime(
        future_date.year, future_date.month, days_in_month[future_date.month]
    )

    # Handle special case where the month change is required
    # If future date's month is January, adjust year and month values for the previous year-end (December)
    ft_year = future_date.year - 1 if (future_date.month - 1) < 1 else future_date.year
    ft_month = 12 if (future_date.month - 1) < 1 else future_date.month - 1

    # Get the number of days in the previous month of the adjusted year
    days_in_month = {
        1: 31,
        2: 29 if calendar.isleap(ft_year) else 28,
        3: 31,
        4: 30,
        5: 31,
        6: 30,
        7: 31,
        8: 31,
        9: 30,
        10: 31,
        11: 30,
        12: 31,
    }
    # Calculate the difference between the future date and the last day of the previous month
    below = abs(
        future_date - datetime.datetime(ft_year, ft_month, days_in_month[ft_month])
    )
    # If the difference is smaller, adjust the future date to the previous month's end
    if below < above:
        new_future_date = datetime.datetime(ft_year, ft_month, days_in_month[ft_month])

    # If 'start' is True, compute the start date of the next year from the current quarter's start
    if start:
        start_date = current_quarter_start + datetime.timedelta(days=365)  # Add 1 year
        prediction_datetime = datetime.datetime(
            start_date.year,
            start_date.month,
            start_date.day,
            0,
            0,
            0,
            0,  # Set time to midnight (start of the day)
            tzinfo=datetime.timezone.utc,  # Ensure the time is in UTC
        )
        return prediction_datetime

    # Step 4: Determine the quarter of the adjusted future date
    def get_quarter(date):
        return (date.month - 1) // 3 + 1  # Return the quarter as a number (1-4)

    future_quarter = get_quarter(new_future_date)

    # Step 5: Find the last day of the future quarter
    def last_day_of_quarter(year, quarter):
        quarter_month_end = (
            quarter * 3
        )  # Last month of the quarter is the quarter number * 3 (March, June, September, December)
        last_day = calendar.monthrange(year, quarter_month_end)[
            1
        ]  # Get the number of days in that month
        return datetime.datetime(
            year, quarter_month_end, last_day
        )  # Return the date of the last day of the quarter

    # Ensure the leap year is considered for the future date
    future_year = new_future_date.year
    end_date = last_day_of_quarter(future_year, future_quarter)

    # Set the final prediction datetime to the last moment of the quarter (23:59:59.999999 in UTC)
    prediction_datetime = datetime.datetime(
        end_date.year,
        end_date.month,
        end_date.day,
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
