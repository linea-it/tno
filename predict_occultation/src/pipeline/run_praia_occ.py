# -*- coding: utf-8 -*-
import argparse
import os
import shutil
import sys
import traceback
from datetime import datetime
from pathlib import Path

import pandas as pd
from dao import GaiaDao, MissingDBURIException
from pipeline.generate_dates import generate_dates_file
from pipeline.generate_ephemeris import (
    centers_positions_to_deg,
    generate_ephemeris,
    run_elimina,
)
from pipeline.library import (
    check_bsp_object,
    check_bsp_planetary,
    check_leapsec,
    clear_for_rerun,
    read_asteroid_json,
    read_ra_dec_from_ephemerides,
)
from pipeline.search_candidates import search_candidates


def obter_catalogo_de_estrelas(
    dao,
    ra: float,
    dec: float,
    angular_diameter: float,
    max_mag: float,
    eph_filename: str,
    centers_filename: str,
    centers_deg_filename: str,
) -> pd.DataFrame:
    """
    Searches for a star catalog using two methods: polygons and radial search.

    First, it tries the polygon method. If it fails or returns no results,
    it attempts the radial search method as a fallback.
    Args:
        dao: Data Access Object with search methods.
        ra: Right ascension.
        dec: Declination.
        angular_diameter: Angular diameter for the search.
        max_mag: Maximum magnitude of the stars.
        eph_filename: Name of the ephemeris file for the radial method.
        centers_filename: Name of the centers file generated by `elimina`.
        centers_deg_filename: Name of the output file for positions in degrees.
    Returns:
        A pandas DataFrame with the catalog data.
    Raises:
        Exception: If both methods fail to find stars.
    """
    df_catalog = None
    # --- METHOD 1: SEARCH BY POLYGONS (PREFERRED) ---
    print("Attempt 1: Searching catalog by polygons.")
    try:
        df_result = dao.catalog_by_polygons(ra, dec, angular_diameter, max_mag=max_mag)

        # Requirement 1: Validate that the result is not null and not empty
        if df_result is not None and not df_result.empty:
            df_catalog = df_result
            print(">>> Success! Catalog obtained via polygon method.")
        else:
            print("WARNING: Polygon method executed, but no stars were found.")

    except Exception as e:
        # Requirement 3: Handle individual failure of the first method
        print(f"ERROR: Failure in the polygon method: {e}")
        # Prints the traceback for more debugging details
        # traceback.print_exc()
        # df_catalog remains None, which will trigger the next method
    # --- METHOD 2: RADIAL SEARCH (FALLBACK) ---
    # Requirement 2: This block is executed only if the first method failed

    if df_catalog is None:
        print("\n----------------------------------------------------------------")
        print("Attempt 2: Fallback to radial search method (QC3).")
        try:
            centers_file = run_elimina(eph_filename, centers_filename)
            print(f"Centers file generated: [{centers_file}]")

            center_positions = centers_positions_to_deg(
                centers_file, centers_deg_filename
            )
            print("Center positions converted to degrees.")

            df_result = dao.catalog_by_positions(
                center_positions, radius=0.15, max_mag=max_mag
            )
            # Requirement 1: Validate that the result is not null and not empty
            if df_result is not None and not df_result.empty:
                df_catalog = df_result
                print(">>> Success! Catalog obtained via radial search method.")
            else:
                print(
                    "WARNING: Radial search method executed, but no stars were found."
                )
        except Exception as e:
            # Requirement 3: Handle individual failure of the second method
            print(f"ERROR: Failure in the radial search method: {e}")
            # traceback.print_exc()
            # df_catalog remains None
    # --- FINAL CHECK AND GENERAL FAILURE ---
    # Requirement 4: Raise a general failure if both methods failed
    if df_catalog is None:
        msg = "CRITICAL FAILURE: Neither method (polygons or radial) could obtain stars from the catalog."
        print(f"\n{msg}")
        raise Exception(msg)
    print(f"\nFinal catalog successfully obtained. Found {len(df_catalog)} stars.")
    return df_catalog


def start_praia_occ(
    name,
    start_date,
    final_date,
    step,
    leap_sec_filename,
    bsp_planetary_filename,
    bsp_object_filename,
    max_mag,
):
    # Data directory inside the container.
    data_dir = os.environ.get("DIR_DATA").rstrip("/")
    print("DATA DIR: [%s]" % data_dir)
    log_file = os.path.join(os.environ.get("DIR_DATA"), "praia_occ.log")
    orig_stdout = sys.stdout
    f = open(log_file, "w")
    sys.stdout = f
    # Sets the names of the files that will be generated.
    dates_filename = "dates.txt"
    eph_filename = "%s.eph" % name
    radec_filename = "radec.txt"
    positions_filename = "positions.txt"
    centers_filename = "centers.txt"
    centers_deg_filename = "centers_deg.csv"
    gaia_cat_filename = "gaia_catalog.cat"
    gaia_csv_filename = "gaia_catalog.csv"
    occultation_table_filename = "occultation_table.csv"
    praia_occultation_table_filename = "praia_occultation_table.csv"

    # Inputs/Outputs of PRAIA Occ Star Search,
    # IMPORTANT! These filenames are HARDCODED in the praia_occ_input_file function
    search_input_filename = "praia_occ_star_search_12.dat"
    stars_catalog_mini_filename = "g4_micro_catalog_JOHNSTON_2018"
    stars_catalog_xy_filename = "g4_occ_catalog_JOHNSTON_2018"
    stars_parameters_of_occultation_filename = "g4_occ_data_JOHNSTON_2018"
    stars_parameters_of_occultation_plot_filename = "g4_occ_data_JOHNSTON_2018_table"
    praia_occ_log_filename = "praia_star_search.log"

    # Cleans the app and data directory by removing symbolic links and results
    # Useful when running the same job multiple times.
    clear_for_rerun(
        input_files=[bsp_object_filename, gaia_cat_filename],
        # input_files=[gaia_cat_filename],
        output_files=[
            eph_filename,
            radec_filename,
            positions_filename,
            centers_filename,
            centers_deg_filename,
            gaia_csv_filename,
            search_input_filename,
            stars_catalog_mini_filename,
            stars_catalog_xy_filename,
            stars_parameters_of_occultation_filename,
            stars_parameters_of_occultation_plot_filename,
            occultation_table_filename,
            praia_occ_log_filename,
        ],
    )
    # Searches for a json file with the object's data
    # If the file exists, the execution data of the steps will be written to it.
    # If it does not exist, it will be an empty dictionary where this data will be placed and then saved as asteroidname.json
    obj_data = read_asteroid_json(name)
    # Check the leapseconds file
    leap_sec = check_leapsec(leap_sec_filename)
    print("Leap Second: [%s]" % leap_sec_filename)
    # Check the bsp_planetary file
    bsp_planetary = check_bsp_planetary(bsp_planetary_filename)
    print("BSP Planetary: [%s]" % bsp_planetary)
    # Check the bsp_object file
    # Searches for the bsp_jpl file first in the inputs directory.
    # Then in the asteroid's directory.
    bsp_jpl_filepath = os.path.join(
        os.getenv("PREDICT_INPUTS"), obj_data["alias"], bsp_object_filename
    )
    if not os.path.exists(bsp_jpl_filepath):
        # If not found in the inputs directory, use the object's directory.
        bsp_jpl_filepath = Path(data_dir).joinpath(bsp_object_filename)
        print("BSP JPL FILE PATH: [%s]" % bsp_jpl_filepath)
    bsp_object = check_bsp_object(
        filepath=bsp_jpl_filepath, filename=bsp_object_filename
    )
    print("BSP Object: [%s]" % bsp_object)
    # Generate dates file
    # dates_file = os.path.join(os.environ.get("DIR_DATA").rstrip("/"), dates_filename)
    # if not os.path.exists(dates_file):
    #     print("Running geradata.")
    dates_file = generate_dates_file(start_date, final_date, step, dates_filename)
    print("Dates File: [%s]" % dates_file)
    # Generate the ephemeris
    eph_file = generate_ephemeris(
        dates_file, bsp_object, bsp_planetary, leap_sec, eph_filename, radec_filename
    )
    print("Ephemeris File: [%s]" % eph_file)
    # For each position, execute the query on the database.
    print("Maximum Visual Magnitude: [%s]" % max_mag)
    dao = GaiaDao(
        name=obj_data["star_catalog"]["name"],
        display_name=obj_data["star_catalog"]["display_name"],
        schema=obj_data["star_catalog"]["schema"],
        tablename=obj_data["star_catalog"]["tablename"],
        ra_property=obj_data["star_catalog"]["ra_property"],
        dec_property=obj_data["star_catalog"]["dec_property"],
    )
    # TODO: optimize the query in Gaia based on the apparent size of the object in the sky (rodrigo)
    # # SEARCH USING QC3 POLYGON calculating apparent size (object+earth+object)
    # Gets the object's diameter + maximum error, handles possible absence of error and diameter
    object_diameter = (obj_data.get("diameter", None) or 0) + (
        obj_data.get("density_err_max", None) or 0
    )
    object_diameter = object_diameter if object_diameter > 0 else None
    print("Object Diameter: [%s]" % object_diameter)
    # Get the object's positions to calculate the polygons
    ra, dec, angular_diameter = read_ra_dec_from_ephemerides(
        eph_filename,
        object_diameter=object_diameter,
        h=obj_data.get("h", None),
        proper_motion_compensation=150,  # proper motion compensation in arcsec (stars move over time)
    )

    # (Removed the commented-out block entirely)

    df_catalog = obter_catalogo_de_estrelas(
        dao=dao,
        ra=ra,
        dec=dec,
        angular_diameter=angular_diameter,
        max_mag=max_mag,
        eph_filename=eph_filename,
        centers_filename=centers_filename,
        centers_deg_filename=centers_deg_filename,
    )

    print("Stars: [%s]" % df_catalog.shape[0])
    # Creates a file in the specific format of praia_occ
    gaia_cat = dao.write_gaia_catalog(df_catalog.to_dict("records"), gaia_cat_filename)
    print("Gaia Cat: [%s]" % gaia_cat)
    # Creates a csv file of the Gaia catalog.
    gaia_csv = dao.gaia_catalog_to_csv(df_catalog, gaia_csv_filename)
    print("Gaia CSV: [%s]" % gaia_csv)
    # When the object's diameter exists in the json, it is passed to the search_candidates function
    # which creates the praia_occ_star_search_12.dat file. Its function is to reduce the number of necessary calculations
    # especially for objects with small diameters.
    object_diameter_upper_limit = obj_data.get("diameter_err_max", None)
    object_diameter = obj_data.get("diameter", None)
    if object_diameter_upper_limit is None:
        if object_diameter is not None:
            object_diameter *= 1.2
    else:
        object_diameter += object_diameter_upper_limit
    print("Object Diameter: [%s]" % object_diameter)
    # Run PRAIA OCC Star Search 12
    # Create .dat file based on the template.
    occultation_file = search_candidates(
        star_catalog=gaia_cat,
        object_ephemeris=eph_file,
        filename=occultation_table_filename,
        object_diameter=object_diameter,
    )
    print("Occultation CSV Table: [%s]" % occultation_file)
    # COPY file to keep original praia csv for debug
    praia_occultation_table_filepath = Path(data_dir).joinpath(
        praia_occultation_table_filename
    )
    shutil.copy(occultation_file, praia_occultation_table_filepath)
    sys.stdout = orig_stdout
    f.close()
    os.chmod(log_file, 0o664)
    return occultation_file
