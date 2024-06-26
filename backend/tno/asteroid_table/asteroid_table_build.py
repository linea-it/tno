"""
This Python module is designed to automate the process of building an asteroid data table by
downloading, processing, and cross-matching information from two primary sources: the Minor
Planet Center's mpcorb_extended database and the ssoBFT database from IMCCE.

Key Functionalities:
1. Automated Downloading: The module checks if the required files are present locally. If not,
   or if there's an update on the remote server, it downloads the latest files.
2. Data Processing: After downloading, it processes the data by filtering, cleaning, and
   transforming columns as per the requirements. This includes operations like converting
   columns to absolute values, removing parentheses, and ensuring data types are consistent.
3. Cross-Matching Data: The module cross-matches data from both sources based on asteroid
   numbers, names, and principal designations. This helps in compiling a more comprehensive
   dataset.
4. Classification of Dynamical Classes: It computes and classifies the dynamical classes of
   asteroids using criteria from both Skybot and ASTORB databases (Lowell Observatory).
   This includes separating base classes from subclasses and computing classes based on
   various orbital parameters.
5. Logging: The process is logged, providing insights into the steps completed, warnings,
   and errors. This is crucial for debugging and tracking the progress of the table-building process.
6. Saving Processed Data: Finally, the processed and compiled table is saved as a CSV file.

The module ensures that the latest data is used, and through its cross-matching and classification
capabilities, it enables a more detailed and accurate representation of asteroid data.

Usage:
To use this module, import the asteroid_table_build function or simply run it as a main program.
It will automatically handle the data retrieval, processing, and saving procedures. Ensure that
the necessary Python packages (requests, pandas, numpy) are installed and import the module if necessary.

Note:
The actual data URLs and specific processing steps might need updates based on the data source
changes or additional requirements in the future.
"""

import functools
import logging
import os
import shutil
import time
import traceback
from datetime import datetime, timezone
from io import StringIO
from pathlib import Path

import humanize
import numpy as np
import pandas as pd
import requests
import tqdm
from tno.asteroid_table.asteroid_dynamical_classification import (
    astorbClassification,
    skybotClassification,
)
from tno.dao import AsteroidDao, AsteroidJobDao


# Function to download the file if it doesn't exist or if it has changed
def download_file_if_not_exists_or_changed(url, directory_path, filename, log):
    """
    Download a file from a URL if it does not exist in the given directory or if the remote file has changed.

    Parameters:
    - url (str): The URL of the file to download.
    - directory_path (str): The directory path where the file should be stored.
    - filename (str): The name of the file to store.
    """
    log.info(f"Fetching {url} ...")

    if not os.path.exists(directory_path):
        os.makedirs(directory_path)

    local_filename = os.path.join(directory_path, filename)

    if not os.path.exists(local_filename):
        # File does not exist, so download it
        download_file(url, local_filename)
        log.info(f"Download completed: {local_filename}")
    else:
        # File exists, check if it has changed
        remote_size = get_remote_file_size(url, log)
        local_size = os.path.getsize(local_filename)
        if remote_size != local_size:
            if remote_size is None:
                # Get current date and time in a specific format
                datetime_str = datetime.now().strftime("%Y%m%d_%H%M%S")
                backup_filename = f"{local_filename}_{datetime_str}.bkp"
                os.rename(local_filename, backup_filename)
                log.warning(
                    f"Failed to check the remote filesize. Creating a backup as {backup_filename}"
                )
                log.warning(f"Downloading file again...")
            # File has changed, so download and overwrite
            download_file(url, local_filename)

            # Remove oldest backups if needed
            directory_path, filename = os.path.split(local_filename)
            garbage_collector("ssoBFT-", "bkp", directory_path, 2, log)

            log.info(
                f"Download completed: {local_filename}"
                if remote_size is None
                else f"File updated: {local_filename}"
            )
        else:
            log.info(f"File is up to date: {local_filename}")


# Function garbage collector of ssoBFT downlaods
def garbage_collector(
    filename_partial, extension, directory_path, num_files_to_keep, log
):
    """
    Removes oldest files from a specified directory, retaining only a certain number of the most recent files.

    Parameters:
    - filename_partial (str): Partial filename to identify relevant files.
    - extension (str): File extension to filter files.
    - directory_path (str): Path of the directory from which to remove files.
    - num_files_to_keep (int): Number of most recent files to keep.
    """
    # Get a list of all files with the specified extension in the directory
    files = [
        f
        for f in os.listdir(directory_path)
        if f.startswith(filename_partial) and f.endswith(extension)
    ]

    if len(files) <= num_files_to_keep:
        return  # No need to remove files if there are fewer or equal to the desired number

    # Sort the list of files by modification time in ascending order (oldest first)
    files.sort(key=lambda x: os.path.getmtime(os.path.join(directory_path, x)))

    # Calculate the number of files to remove
    num_files_to_remove = len(files) - num_files_to_keep

    # Determine if all remaining files have the same size
    sizes = set()
    for i in range(num_files_to_keep, len(files)):
        file_path = os.path.join(directory_path, files[i])
        size = os.path.getsize(file_path)
        sizes.add(size)

    # Remove the oldest files
    for i in range(num_files_to_remove):
        file_to_remove = os.path.join(directory_path, files[i])
        os.remove(file_to_remove)
        log.info(f"Garbage collector removed: {file_to_remove}")

    # Check if all remaining files have the same size and log a warning if they do
    if len(sizes) == 1:
        log.warning("All ssoBFT remaining backups have the same size.")


# Function to download the file
def download_file(url, local_filename):
    """
    Download a file from the specified URL and save it to the local system.

    Parameters:
    - url (str): URL of the file to be downloaded.
    - local_filename (str): Path and name for the file to be saved locally.
    """
    r = requests.get(url, stream=True)

    file_size = int(r.headers.get("Content-Length", 0))
    desc = "(Unknown total file size)" if file_size == 0 else ""
    r.raw.read = functools.partial(r.raw.read, decode_content=True)
    with tqdm.tqdm.wrapattr(r.raw, "read", total=file_size, desc=desc) as r_raw:
        with open(local_filename, "wb") as f:
            shutil.copyfileobj(r_raw, f)

    # r = requests.get(url, stream=True)
    # with open(local_filename, 'wb') as file:
    #     for chunk in r.iter_content(chunk_size=1024):
    #         if chunk:
    #             file.write(chunk)


# Function to get the remote file size
def get_remote_file_size(url, log):
    """
    Get the size of a remote file from its URL.

    Parameters:
    - url (str): URL of the remote file.
    """
    response = requests.head(url)
    if "Content-Length" in response.headers:
        return int(response.headers["Content-Length"])
    else:
        log.warning(f"Content-Length header is missing in response from {url}")
        return None


# Function to convert some of the min errors stored as negative into absolute values
def process_dataframe_cols_toabs(dataframe, columns_to_abs):
    """
    Converts specified columns in a DataFrame to their absolute values.

    Parameters:
    - dataframe (pandas.DataFrame): The DataFrame to modify.
    - columns_to_abs (list of str): List of column names to convert to absolute values.

    Returns:
    pandas.DataFrame: The modified DataFrame with specified columns in absolute values.
    """
    # Convert selected columns to absolute values
    dataframe[columns_to_abs] = dataframe[columns_to_abs].abs()

    return dataframe


# Function the removes paraenthesis in the asteroid number leaving it as a float
def process_dataframe_cols_remove_parenthesis(dataframe, columns_to_rem_par):
    """
    Removes parentheses from the values in specified columns and converts them to float.

    Parameters:
    - dataframe (pandas.DataFrame): The DataFrame to modify.
    - columns_to_rem_par (list of str): List of column names from which to remove parentheses.

    Returns:
    pandas.DataFrame: The modified DataFrame with specified columns processed.
    """
    for col in columns_to_rem_par:
        dataframe[col] = dataframe[col].apply(
            lambda x: str(x).replace("(", "").replace(")", "") if not pd.isna(x) else x
        )
        dataframe[col] = dataframe[col].astype("float64")

    return dataframe


# Function to loads mpcorb_extended database
# Gets latest data from https://minorplanetcenter.net/Extended_Files/mpcorb_extended.json.gz
def load_mpcorb_extended(local_filename, log):
    """
    Loads the mpcorb_extended database from a local file, processing and filtering specific columns.

    Parameters:
    - local_filename (str): The path to the local file containing the mpcorb_extended database.

    Returns:
    pandas.DataFrame: The loaded and processed DataFrame.
    """
    log.info(f"Loading mpcorb_extended file: {local_filename}")
    columns_to_include = [
        "Number",
        "Name",
        "Principal_desig",
        "H",
        "G",
        "Epoch",
        "a",
        "e",
        "i",
        "Node",
        "Peri",
        "M",
        "n",
        "Perihelion_dist",
        "Aphelion_dist",
        "rms",
        "Last_obs",
        "PHA_flag",
        "Critical_list_numbered_object_flag",
    ]
    # load the json file
    try:
        start_time = time.time()  # Record the start time
        data = pd.read_json(local_filename, compression="gzip")
    except MemoryError as e:
        raise Exception(f"MemoryError occurred while loading mpcorb_extended file:{e}")

    # drop unwanted columns
    try:
        # Drop unwanted columns
        error_message = "dropping columns"
        data = data[columns_to_include]

        # Rename the columns in the DataFrame
        error_message = "renaming columns"
        data.rename(
            columns={
                "Number": "number",
                "Name": "name",
                "H": "h",
                "G": "g",
                "Epoch": "epoch",
                "a": "semimajor_axis",
                "e": "eccentricity",
                "i": "inclination",
                "Node": "long_asc_node",
                "Peri": "arg_perihelion",
                "M": "mean_anomaly",
                "n": "mean_daily_motion",
                "Last_obs": "last_obs_included",
                "PHA_flag": "pha_flag",
                "Principal_desig": "principal_designation",
                "Perihelion_dist": "perihelion",
                "Aphelion_dist": "aphelion",
                "Critical_list_numbered_object_flag": "mpc_critical_list",
            },
            inplace=True,
        )

        # Remove parenthesis from asteroid numbers
        error_message = "removing parenthesis from asteroid numbers"
        data = process_dataframe_cols_remove_parenthesis(data, ["number"])

        # Log loading and processing time
        end_time = time.time()  # Record the end time
        loading_time = end_time - start_time
        log.debug(
            f"{local_filename} took {loading_time:.0f} seconds to load and process"
        )
    except:
        raise Exception(
            f"An error occurred while {error_message} in DataFrame read from: {local_filename}"
        )

    return data


# Function to loads ssoBFT database
# Broad and Flat Table of all properties
# from https://ssp.imcce.fr/webservices/ssodnet/api/ssobft/
def load_ssoBFT(local_filename, log):
    """
    Loads the ssoBFT database from a local file, processing and filtering specific columns.

    Parameters:
    - local_filename (str): The path to the local file containing the ssoBFT database.

    Returns:
    pandas.DataFrame: The loaded and processed DataFrame.
    """
    log.info(f"Loading ssoBFT file: {local_filename}")
    columns_to_include = [
        "sso_number",
        "sso_name",
        "sso_class",
        "albedo.value",
        "albedo.error.min",
        "albedo.error.max",
        "density.value",
        "density.error.min",
        "density.error.max",
        "diameter.value",
        "diameter.error.min",
        "diameter.error.max",
        "mass.value",
        "mass.error.min",
        "mass.error.max",
    ]
    try:
        start_time = time.time()  # Record the start time
        data = pd.read_csv(
            local_filename,
            delimiter=",",
            comment="#",
            compression="bz2",
            usecols=columns_to_include,
        )

    except MemoryError as e:
        raise Exception(f"MemoryError occurred while loading ssoBFT file: {e}")

    # drop unwanted columns
    try:
        data = data[columns_to_include]
        # Rename the columns in the DataFrame
        data.rename(
            columns={
                "albedo.value": "albedo",
                "albedo.error.min": "albedo_err_min",
                "albedo.error.max": "albedo_err_max",
                "density.value": "density",
                "density.error.min": "density_err_min",
                "density.error.max": "density_err_max",
                "diameter.value": "diameter",
                "diameter.error.min": "diameter_err_min",
                "diameter.error.max": "diameter_err_max",
                "mass.value": "mass",
                "mass.error.min": "mass_err_min",
                "mass.error.max": "mass_err_max",
            },
            inplace=True,
        )

        # # Remove make sso_number integer from asteroid numbers
        # error_message = 'converting asteroid numbers to integers'
        # data['sso_number'] = data['sso_number'].astype(int).astype(str)

        # Mantem todos as incertezas em valores absolutos
        error_message = "converting all negative uncertainties to their absolute value"
        data = process_dataframe_cols_toabs(
            data,
            ["albedo_err_min", "density_err_min", "diameter_err_min", "mass_err_min"],
        )

        # Log loading and processing time
        end_time = time.time()  # Record the end time
        loading_time = end_time - start_time
        log.debug(
            f"{local_filename} took {loading_time:.0f} seconds to load and process"
        )
    except:
        raise Exception(
            f"An error occurred while {error_message} in DataFrame read from: {local_filename}"
        )

    return data


# Function that cross matches database from mpcextended with ssodnet database
def crossmatch_dataframes(data_mpc, data_bft):
    """
    Cross-matches two DataFrames based on asteroid number, name, and principal designation.

    Parameters:
    - data_mpc (pandas.DataFrame): DataFrame containing mpcorb_extended data.
    - data_bft (pandas.DataFrame): DataFrame containing ssoBFT data.

    Returns:
    pandas.DataFrame: A merged DataFrame with cross-matched data.
    """
    # Create a copy of data_mpc to preserve the original index
    data_mpc_copy = data_mpc.copy()

    # Initialize empty lists to store matching indices and non-matching indices
    number_indices = []
    name_indices = []
    principal_designation_indices = []
    no_match_indices = []

    # Step 1: Crossmatch 'number' column in data_mpc with 'sso_number' in data_bft
    data_mpc_copy.dropna(subset=["number"], inplace=True)
    data_bft_copy = data_bft.copy()
    data_bft_copy.dropna(subset=["sso_number"], inplace=True)
    merged_data_1 = data_mpc_copy.merge(
        data_bft_copy, left_on="number", right_on="sso_number", how="left"
    )
    number_indices = merged_data_1.index.tolist()

    # Step 2: Crossmatch 'name' column in data_mpc with 'sso_name' in data_bft
    # renew copy
    data_mpc_copy = data_mpc.copy()
    data_mpc_copy = data_mpc_copy[~data_mpc_copy.index.isin(number_indices)]
    data_mpc_copy.dropna(subset=["name"], inplace=True)
    data_bft_copy = data_bft.copy()
    data_bft_copy.dropna(subset=["sso_name"], inplace=True)
    merged_data_2 = data_mpc_copy.merge(
        data_bft_copy, left_on="name", right_on="sso_name", how="left"
    )
    name_indices = merged_data_2.index.tolist()

    # Step 3: Crossmatch 'principal_designation' column in data_mpc with 'sso_name' in data_bft
    # renew copy
    data_mpc_copy = data_mpc.copy()
    data_mpc_copy = data_mpc_copy[
        ~data_mpc_copy.index.isin(list(set(number_indices + name_indices)))
    ]
    data_mpc_copy.dropna(subset=["principal_designation"], inplace=True)
    data_bft_copy = data_bft.copy()
    data_bft_copy.dropna(subset=["sso_name"], inplace=True)
    merged_data_3 = data_mpc_copy.merge(
        data_bft_copy, left_on="principal_designation", right_on="sso_name", how="left"
    )
    principal_designation_indices = merged_data_3.index.tolist()

    # Step 4: Store indices of data_mpc that did not have a match
    # renew copy
    data_mpc_copy = data_mpc.copy()
    data_mpc_copy = data_mpc_copy[
        ~data_mpc_copy.index.isin(
            list(set(number_indices + name_indices + principal_designation_indices))
        )
    ]
    no_match_indices = data_mpc_copy.index.tolist()

    # Step 5: Create a new dataframe by merging data_mpc, data_bft, and no-match indices
    merged_data = pd.concat([merged_data_1, merged_data_2, merged_data_3])
    merged_data.reset_index(drop=True, inplace=True)

    # Step 6: Realocate and rename columns
    merged_data.drop(
        merged_data.columns[1], axis=1, inplace=True
    )  # Drop column 'name' at index 1
    merged_data.drop("sso_number", axis=1, inplace=True)  # Drop column 'sso_number'
    merged_data.insert(
        1, "name", merged_data.pop("sso_name")
    )  # Move column 'sso_name' to index 1
    merged_data.rename(
        columns={"sso_name": "name"}, inplace=True
    )  # Rename column 'sso_name' to 'name'
    merged_data.insert(
        3, "sso_class", merged_data.pop("sso_class")
    )  # Move column 'sso_class' to index 3

    return merged_data


# Function to separate Base classes from Subclasses for skybot dynamical class classifications
def conform_skybot_dynclass(dataframe, log):
    """
       Separates base classes from subclasses for skybot dynamical class classifications in a DataFrame.

       Parameters:

    - dataframe (pandas.DataFrame): The DataFrame to modify.

       Returns:
       pandas.DataFrame: The modified DataFrame with separated dynamical classes.
    """
    # Add a new column at index 3 named 'skybot_dynbaseclass'
    dataframe.insert(3, "skybot_dynbaseclass", "Unclassified")

    # Rename column 'sso_class' to 'skybot_dynsubclass'
    dataframe.rename(columns={"sso_class": "skybot_dynsubclass"}, inplace=True)
    dataframe["skybot_dynsubclass"].fillna("Unclassified", inplace=True)

    log.info("Parsing dynamical classes according to Skybot database...")

    # Dictionary mapping skybot_dynsubclass values to their corresponding base classes
    baseclasses = {
        "NEA": "Near-Earth Asteroid",
        "Phocaea": "Phocaea",
        "MB": "Main Belt",
        "Mars-Crosser": "Mars-Crosser",
        "Hungaria": "Hungaria",
        "Trojan": "Trojan",
        "Centaur": "Centaur",
        "KBO": "Kuiper Belt Object",
        "IOC": "Inner Oort Cloud",
        "Unclassified": "Unclassified",
    }

    total_items = len(dataframe["skybot_dynsubclass"])

    # Iterate over each value of 'skybot_dynsubclass'
    for index, value in tqdm.tqdm(
        dataframe["skybot_dynsubclass"].items(),
        total=total_items,
        unit=" Asteroids",
        ncols=80,
    ):
        # Split the value by '>'
        baseclass = value.split(">")[0]
        # Update the corresponding value in 'skybot_dynbaseclass' column
        dataframe.at[index, "skybot_dynbaseclass"] = baseclasses[baseclass]

    # for unclassified try to find a classification
    unclassified_indices = dataframe[
        dataframe["skybot_dynbaseclass"] == "Unclassified"
    ].index
    total_items = len(unclassified_indices)
    log.info("Classifying cases with unknown Skybot dynamical class...")
    for index in tqdm.tqdm(
        unclassified_indices, total=total_items, unit=" Asteroids", ncols=80
    ):
        a = dataframe.iloc[index]["semimajor_axis"]
        e = dataframe.iloc[index]["eccentricity"]
        baseclass, subclass = skybotClassification(a, e)
        dataframe.at[index, "skybot_dynbaseclass"] = baseclass
        dataframe.at[index, "skybot_dynsubclass"] = subclass

    return dataframe


# Function to separate Base classes from Subclasses for astorb dynamical class classifications
def conform_astorb_lowell_obs_dynclass(dataframe, log):
    """
    Separates base classes from subclasses for astorb dynamical class classifications in a DataFrame.

    Parameters:
    - dataframe (pandas.DataFrame): The DataFrame to modify.

    Returns:
    pandas.DataFrame: The modified DataFrame with separated dynamical classes.
    """
    # scientific reference at https://doi.org/10.1016/j.ascom.2022.100661

    dataframe.insert(5, "astorb_dynbaseclass", None)
    dataframe.insert(6, "astorb_dynsubclass", None)

    log.info("Computing and parsing dynamical classes according to ASTORB database...")
    # log.debug("Estimating remaining time...")
    total_rows = len(dataframe)
    # modref = 1000 if (1000 / total_rows) < 0.1 else np.ceil(total_rows * 0.1)
    # start_time = time.time()  # Record the start time

    for index in tqdm.tqdm(range(total_rows), unit=" Asteroids", ncols=80):
        # if index == modref:
        #     remaining_time = (total_rows - modref) * (time.time() - start_time) / modref
        #     log.debug(
        #         f"Remaining Time: {remaining_time:.0f} seconds..."
        #         if remaining_time <= 60
        #         else (
        #             f"Remaining Time: {remaining_time/60:.0f} minutes..."
        #             if remaining_time <= 3600
        #             else f"Remaining Time: {remaining_time/3600:.0f} hours..."
        #         )
        #     )

        try:
            a = dataframe.iloc[index]["semimajor_axis"]
            q = dataframe.iloc[index]["perihelion"]
            i = dataframe.iloc[index]["inclination"]
            e = dataframe.iloc[index]["eccentricity"]
            Q = dataframe.iloc[index]["aphelion"]

            pha_str = dataframe.iloc[index]["pha_flag"]
            pha = float(pha_str) if pha_str != "NaN" else np.nan

            # Check if any of the values are NaN
            if any(pd.notna(param) for param in [a, e, i, q, Q, pha]):
                # Convert NaN values to None
                a = None if pd.isna(a) else a
                e = None if pd.isna(e) else e
                i = None if pd.isna(i) else i
                q = None if pd.isna(q) else q
                Q = None if pd.isna(Q) else Q
                pha = 0 if pd.isna(pha) else pha

            base, sub = astorbClassification(a, e, i, q, Q, pha)
            dataframe.at[index, "astorb_dynbaseclass"] = base
            dataframe.at[index, "astorb_dynsubclass"] = sub

        except:
            dataframe.at[index, "astorb_dynbaseclass"] = "Unclassified"
            dataframe.at[index, "astorb_dynsubclass"] = "Unclassified"
    log.info("Dynamical classes computation completed.")
    return dataframe


def fix_duplicated_alias(series):
    """
    Modify a pandas Series by adding numeric increments to duplicate values.

    Parameters:
    series (pandas Series): The input Series to be modified.

    Returns:
    pandas Series: A modified Series with numeric increments added to duplicate values.
    """
    seen_values = {}
    result = []

    for value in series:
        if value in seen_values:
            seen_values[value] += 1
            result.append(f"{value}_{seen_values[value]}")
        else:
            seen_values[value] = 0
            result.append(value)

    return pd.Series(result)


def validate_last_obs_included(date_string):
    """
    Validate a date string and ensure it includes the last observation date for a given year.

    Parameters:
        date_string (str): A string representing a date in the format "YYYY-MM-DD".

    Returns:
        str: If the input date_string is valid, it returns the same date_string.
             If the input date_string is invalid, it returns a date in the format "YYYY-01-01".

    Examples:
        - validate_last_obs_included("2023-12-31") returns "2023-12-31"
        - validate_last_obs_included("2023-13-01") returns "2023-01-01" (invalid date)
    """
    try:
        datetime.strptime(date_string, "%Y-%m-%d")
        return date_string
    except ValueError:
        try:
            dummy_test = int(date_string[:4])
            return date_string[:4] + "-01-01"
        except IndexError:
            return "1800-01-01"


def clean_duplicate_asteroids(dataframe, category="name"):
    """
        Clean a DataFrame by removing duplicate rows based on a specified category column.

        Parameters:
        -----------
        dataframe : pandas DataFrame
            The input DataFrame containing asteroid data.
        category : str, optional
            The name of the column used for grouping and identifying duplicates.
            Default is 'name'.

        Returns:
        --------
        pandas DataFrame
            A cleaned DataFrame with duplicate rows removed.

        Example:
        --------
        # Import pandas and create a sample DataFrame
        import pandas as pd
    from tno.asteroid_table.load_data import load_mpcorb_extended
        data = {'name': ['Asteroid1', 'Asteroid2', 'Asteroid1', 'Asteroid3'],
                'diameter_km': [5, 8, 5, 10]}
        df = pd.DataFrame(data)

        # Clean the DataFrame by removing duplicate asteroids based on 'name'
        cleaned_df = clean_duplicate_asteroids(df, category='name')

        # Display the cleaned DataFrame
        print(cleaned_df)

        Output:
            name  diameter_km
        1  Asteroid2            8
        3  Asteroid3           10
    """
    data_groups = dataframe.groupby(category)

    for name, group in data_groups:
        if len(group) > 1:
            index, idxmax = group.index.tolist(), group.count(axis=1).idxmax()
            index.remove(idxmax)

            # Drop duplicate rows from the original DataFrame
            for i in index:
                dataframe = dataframe.drop(i)

    return dataframe


def asteroid_table_build(table_path, log, use_local_files):
    """
    Main function to orchestrate the download, loading, and processing of asteroid data.

    The function downloads and processes data from two sources: mpcorb_extended and ssoBFT databases.
    It then cross-matches these datasets, conforms dynamical class classifications, and saves the
    processed data to a CSV file.

    Parameters:
    - table_path (str, optional): The directory path to store the downloaded and processed files.
                                  Defaults to './asteroid_table'.
    - log_path (str, optional): The directory path to store log files. Defaults to './log/'.
    """

    try:
        # Define the URL of the file
        mpcext_url = (
            "https://minorplanetcenter.net/Extended_Files/mpcorb_extended.json.gz"
        )
        # Define the local filename for the downloaded file
        mpcext_local_filename = "mpcorb_extended.json.gz"

        # Define the URL of the file
        ssoBFT_url = "https://ssp.imcce.fr/data/ssoBFT-latest_Asteroid.ecsv.bz2"
        # Define the local filename for the downloaded file
        # ssoBFT_local_filename = "ssoBFT-latest.ecsv.bz2"
        ssoBFT_local_filename = "ssoBFT-latest_Asteroid.ecsv.bz2"

        if not use_local_files:
            download_file_if_not_exists_or_changed(
                mpcext_url, table_path, mpcext_local_filename, log
            )
            download_file_if_not_exists_or_changed(
                ssoBFT_url, table_path, ssoBFT_local_filename, log
            )
        else:
            log.info("Using local files. Skipping download.")

        data_mpc = load_mpcorb_extended(
            os.path.join(table_path, mpcext_local_filename), log
        )

        # Development Only
        # data_mpc = data_mpc.iloc[0:15000,]
        # index = [1, 2, 3, 4, 5, 131240, 644901, 201725, 656765, 470433, 710161]
        # data_mpc = data_mpc.iloc[index]

        data_bft = load_ssoBFT(os.path.join(table_path, ssoBFT_local_filename), log)

        asteroid_table = crossmatch_dataframes(data_mpc, data_bft)
        asteroid_table = conform_skybot_dynclass(asteroid_table, log)
        asteroid_table = conform_astorb_lowell_obs_dynclass(asteroid_table, log)

        # Convert number to column to int64
        asteroid_table["number"] = asteroid_table["number"].fillna(-1)
        asteroid_table["number"] = asteroid_table["number"].astype("int64")
        asteroid_table["number"] = asteroid_table["number"].astype("str")
        asteroid_table["number"] = asteroid_table["number"].replace("-1", "")

        # Fill with principal_designation cases without principal designation
        asteroid_table["name"] = asteroid_table["name"].fillna(
            asteroid_table["principal_designation"]
        )
        asteroid_table["alias"] = asteroid_table["name"].apply(
            lambda origname: str(origname)
            .replace(" ", "")
            .replace("_", "")
            .replace("-", "")
            .replace("/", "")
        )

        # Transform pha_flag and mpc_critical_list into boolean
        asteroid_table["pha_flag"] = asteroid_table["pha_flag"].replace(np.nan, 0)
        asteroid_table["pha_flag"] = asteroid_table["pha_flag"].astype(int).astype(bool)
        asteroid_table["mpc_critical_list"] = asteroid_table[
            "mpc_critical_list"
        ].replace(np.nan, 0)
        asteroid_table["mpc_critical_list"] = (
            asteroid_table["mpc_critical_list"].astype(int).astype(bool)
        )

        # Validate possible errors in last obs included column
        asteroid_table["last_obs_included"] = asteroid_table["last_obs_included"].apply(
            validate_last_obs_included
        )

        # Fix duplicated aliases
        asteroid_table["alias"] = fix_duplicated_alias(asteroid_table["alias"].values)

        # Fix duplicated rows
        asteroid_table = clean_duplicate_asteroids(asteroid_table, category="name")

        asteroid_table = asteroid_table.rename(
            columns={
                "skybot_dynbaseclass": "base_dynclass",
                "skybot_dynsubclass": "dynclass",
            }
        )
        asteroid_table = asteroid_table.reindex(
            columns=[
                "name",
                "number",
                "base_dynclass",
                "dynclass",
                "albedo",
                "albedo_err_max",
                "albedo_err_min",
                "alias",
                "aphelion",
                "arg_perihelion",
                "astorb_dynbaseclass",
                "astorb_dynsubclass",
                "density",
                "density_err_max",
                "density_err_min",
                "diameter",
                "diameter_err_max",
                "diameter_err_min",
                "epoch",
                "g",
                "h",
                "inclination",
                "last_obs_included",
                "long_asc_node",
                "mass",
                "mass_err_max",
                "mass_err_min",
                "mean_anomaly",
                "mean_daily_motion",
                "mpc_critical_list",
                "perihelion",
                "pha_flag",
                "principal_designation",
                "rms",
                "semimajor_axis",
                "eccentricity",
            ]
        )

        return asteroid_table
    except Exception as e:
        raise Exception(e)


def import_asteroid_table(asteroid_table, log):

    try:
        start = datetime.now(tz=timezone.utc)
        log.debug("Deleting all records in asteroid table.")

        db = AsteroidDao(pool=False)
        db.reset_table()

        end = datetime.now(tz=timezone.utc)
        tdelta = end - start
        log.info(
            "All records in the asteroids table were deleted in %s."
            % humanize.naturaldelta(tdelta, minimum_unit="milliseconds")
        )

        start = datetime.now(tz=timezone.utc)
        data = StringIO()
        asteroid_table.to_csv(
            data,
            header=True,
            index=False,
        )
        data.seek(0)

        rows = db.import_asteroids(data, delimiter=",")

        end = datetime.now(tz=timezone.utc)
        tdelta = end - start
        log.debug(f"Rows imported: {rows} ")
        log.info(
            "All records have been imported in in %s."
            % humanize.naturaldelta(tdelta, minimum_unit="milliseconds")
        )

        return rows
    except Exception as e:
        raise Exception(
            f"An error occurred while import the asteroid table. Additional information: {e}"
        )


# if __name__ == "__main__":

#     # Reconfigure logging within the main function
#     log_path = "/logs"
#     if not os.path.exists(os.path.dirname(log_path)):
#         os.makedirs(os.path.dirname(log_path))
#     log_filename = os.path.join(log_path, "asteroid_table_build.log")
#     logfile = os.path.join(log_path, log_filename)
#     log = logging.getLogger(log_filename.split(".log")[0])
#     log.setLevel(logging.INFO)
#     formatter = logging.Formatter("%(asctime)s [%(levelname)s] %(message)s")
#     file_handler = logging.FileHandler(logfile)
#     file_handler.setFormatter(formatter)
#     log.addHandler(file_handler)

#     try:
#         table_path = "/archive/asteroid_table/"
#         csv_filename = "asteroid_table_build.csv"

#         # Executa a funcao e retorna um dataframe
#         df = asteroid_table_build(table_path, log)

#         # Cria o arquivo csv.
#         df.to_csv(os.path.join(table_path, csv_filename), index=False)

#         # Importa o dataframe no banco de dados
#         import_asteroid_table(df, log)

#     except Exception as e:
#         log.error(e)
#         raise e
