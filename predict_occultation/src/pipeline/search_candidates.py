#!/usr/bin/python2.7
# -*- coding: utf-8 -*-

import os
import subprocess
from datetime import datetime

import numpy as np
from pipeline.library import HMS2deg


def get_best_projected_search_radius(object_ephemeris, object_diameter):
    """
    Calculate the best projected search circle based on object ephemeris.

    Parameters:
        object_ephemeris (str): The path to the object ephemeris file.

    Returns:
        float: The size of the projected search circle in arcseconds.

    Notes:
        The object ephemeris file should contain distance data in a specific format.
        The function calculates the best distance from the ephemeris and computes the projected search circle size.
    """
    earth_radius = 6371  # km
    body_radius_compensation = (
        0 if object_diameter is None else object_diameter / 2
    )  # km
    distances = []
    with open(object_ephemeris, "r") as file:
        for i, line in enumerate(file, start=3):
            distances.append(line[120:160])
    distances = np.array(distances[3:], dtype=float)
    best_distance = distances.min()
    projected_search_diameter = (
        2 * (earth_radius + body_radius_compensation * 2) / best_distance
    )
    projected_search_diameter *= 3600 * 180 / np.pi  # converts to arcsec
    projected_search_radius = projected_search_diameter / 2
    return np.around(projected_search_radius, 4)


def get_minimum_outreach_radius(projected_search_radius):
    # The minimum outreach radius is X % greater than the projected search radius.
    # All stars outside this region will be discounted to accelarate computations
    return projected_search_radius * 1


def praia_occ_input_file(star_catalog, object_ephemeris, object_diameter):

    # TODO: Alguns dos parametros podem vir da interface.
    try:
        app_path = os.environ.get("APP_PATH").rstrip("/")
        data_dir = os.environ.get("DIR_DATA").rstrip("/")

        # Atenção! Nome do Arquivo de input está HARDCODED!
        filename = "praia_occ_star_search_12.dat"

        output = os.path.join(data_dir, filename)
        out_link = os.path.join(app_path, filename)

        # TODO Melhorar o nome destes arquivos!
        stars_catalog_mini_filename = "g4_micro_catalog_JOHNSTON_2018"
        stars_catalog_xy_filename = "g4_occ_catalog_JOHNSTON_2018"
        stars_parameters_of_occultation_filename = "g4_occ_data_JOHNSTON_2018"
        stars_parameters_of_occultation_plot_filename = (
            "g4_occ_data_JOHNSTON_2018_table"
        )

        with open("praia_occ_input_template.txt") as file:

            data = file.read()

            data = data.replace("{stellar_catalog}", star_catalog.ljust(50))

            data = data.replace("{object_ephemeris}", object_ephemeris.ljust(50))

            name = os.path.join(data_dir, stars_catalog_mini_filename)
            data = data.replace("{stars_catalog_mini}", name.ljust(50))

            name = os.path.join(data_dir, stars_catalog_xy_filename)
            data = data.replace("{stars_catalog_xy}", name.ljust(50))

            name = os.path.join(data_dir, stars_parameters_of_occultation_filename)
            data = data.replace("{stars_parameters_of_occultation}", name.ljust(50))

            name = os.path.join(data_dir, stars_parameters_of_occultation_plot_filename)
            data = data.replace(
                "{stars_parameters_of_occultation_plot}", name.ljust(50)
            )
            projected_search_circle = get_best_projected_search_radius(
                object_ephemeris, object_diameter
            )
            data = data.replace(
                "{projected_search_circle}",
                f"{projected_search_circle:2.7f}".ljust(50),
            )
            minimum_outreach_radius = get_minimum_outreach_radius(
                projected_search_circle
            )
            data = data.replace(
                "{minimum_outreach_radius}",
                f"{minimum_outreach_radius:2.7f}".ljust(50),
            )

            with open(output, "w") as new_file:
                new_file.write(data)

        if os.path.exists(output):
            # Altera permissão do arquivo para escrita do grupo
            os.chmod(output, 0o664)
            # Cria um link simbolico no diretório app
            os.symlink(output, out_link)

            return output
        else:
            raise (Exception("%s not generated. [%s]" % (filename, output)))

    except Exception as e:
        raise (e)


def run_praia_occ(
    input,
):

    data_dir = os.environ.get("DIR_DATA").rstrip("/")
    log = os.path.join(data_dir, "praia_star_search.log")

    with open(log, "w") as fp:
        p = subprocess.Popen(
            "PRAIA_occ_star_search_12 < " + input,
            stdin=subprocess.PIPE,
            shell=True,
            stdout=fp,
        )
        p.communicate()

    os.chmod(log, 0o664)


def fix_table(filename):

    inoutFile = open(filename, "r+b")
    contents = inoutFile.readlines()

    contents[4] = b" G: G magnitude from Gaia\n"
    contents[5] = contents[5][:41] + b"cluded)\n"
    contents[6] = b" G" + contents[6][2:]
    contents[17] = contents[17][:27] + b"\n"
    contents[26] = contents[26][:6] + b"only Gaia DR1 stars are used\n"
    contents[27] = contents[27][:-1] + b" (not applicable here)\n"
    contents[35] = contents[35][:34] + b"10)\n"
    contents[36] = contents[36][:41] + b"\n"
    contents[37] = contents[37][:36] + b"/yr); (0 when not provided by Gaia DR1)\n"
    contents[39] = contents[39][:115] + b"G" + contents[39][116:]

    for i in range(41, len(contents)):
        contents[i] = contents[i][:169] + b"-- -" + contents[i][173:]

    inoutFile.seek(0)  # go at the begining of the read/write file
    inoutFile.truncate()  # clean the file (delete all content)
    inoutFile.writelines(contents)  # write the new content in the blank file
    inoutFile.close()


def get_position_from_occ_table(data_array, index_list):
    """Function to extract right ascension or declination from a array
    The index of specific columns (RA or Dec) is defined inside of index_list
    Args:
        data_array ([type]): [description]
        index_list ([type]): [description]

    Returns:
        [type]: [description]
    """
    return [" ".join(pos) for pos in data_array[:, index_list]]


def ascii_to_csv(inputFile, outputFile):
    """Function to convert data from ascii table (generate by PRAIA OCC) to csv file

    Args:
        inputFile ([type]): [description]
        outputFile ([type]): [description]
    """
    data = np.loadtxt(inputFile, skiprows=41, dtype=str, ndmin=2)

    nRows, nCols = data.shape

    # To avoid 60 in seconds (provided by PRAIA occ),
    date = []
    for d in data[:, range(6)]:
        if d[5] == "60.":
            d[4] = int(d[4]) + 1
            d[5] = "00."
        date.append(datetime.strptime(" ".join(d), "%d %m %Y %H %M %S."))

    # use this definition when seconds = 0..59
    # date = [datetime.strptime(' '.join(d), "%d %m %Y %H %M %S.") for d in data[:,range(6)]]

    dateAndPositions = []
    dateAndPositions.append(date)

    # Extracting positions of stars and objects and save it in a array
    for i in range(6, 17, 3):
        dateAndPositions.append(get_position_from_occ_table(data, [i, i + 1, i + 2]))

    dateAndPositions = np.array(dateAndPositions)
    dateAndPositions = dateAndPositions.T

    # Extracting others parameters (C/A, P/A, etc.)
    otherParameters = data[:, range(18, nCols)]

    newData = np.concatenate((dateAndPositions, otherParameters), 1)

    # Defining the column's names
    colNames = (
        "occultation_date;ra_star_candidate;dec_star_candidate;ra_object;"
        "dec_object;ca;pa;vel;delta;g;j;h;k;long;loc_t;"
        "off_ra;off_de;pm;ct;f;e_ra;e_de;pmra;pmde"
    )

    np.savetxt(outputFile, newData, fmt="%s", header=colNames, delimiter=";")


def search_candidates(star_catalog, object_ephemeris, filename, object_diameter):

    try:
        app_path = os.environ.get("APP_PATH").rstrip("/")
        data_dir = os.environ.get("DIR_DATA").rstrip("/")

        output = os.path.join(data_dir, filename)
        out_link = os.path.join(app_path, filename)

        # Path do arquivo de tabela gerado pelo PRAIA OCC.
        stars_parameters_of_occultation_plot_filename = (
            "g4_occ_data_JOHNSTON_2018_table"
        )
        praia_occ_table = os.path.join(
            data_dir, stars_parameters_of_occultation_plot_filename
        )

        # Criar arquivo .dat baseado no template.
        search_input = praia_occ_input_file(
            star_catalog=star_catalog,
            object_ephemeris=object_ephemeris,
            object_diameter=object_diameter,
        )

        print("PRAIA OCC .DAT: [%s]" % search_input)

        run_praia_occ(search_input)
        print("Terminou o praia occ")

        # Depois de executar o PRAIA OCC, verifica se o arquivo de tabela foi gerado.
        if not os.path.exists(praia_occ_table):
            raise (
                Exception(
                    "%s not generated. [%s]"
                    % (stars_parameters_of_occultation_plot_filename, praia_occ_table)
                )
            )

        fix_table(praia_occ_table)

        print("PRAIA Occultation Table: [%s]" % praia_occ_table)

        # Converter o arquivo praia_occ_table para um csv
        ascii_to_csv(praia_occ_table, output)

        if os.path.exists(output):
            # Altera permissão do arquivo para escrita do grupo
            os.chmod(output, 0o664)
            # Cria um link simbolico no diretório app
            os.symlink(output, out_link)

            # PRAIA OCC gera varios arquivos de saida alterar a permissão desses arquivos.
            files = [
                "g4_micro_catalog_JOHNSTON_2018",
                "g4_occ_catalog_JOHNSTON_2018",
                "g4_occ_data_JOHNSTON_2018",
                "g4_occ_data_JOHNSTON_2018_table",
            ]
            for f in files:
                os.chmod(os.path.join(data_dir, f), 0o664)

            return output
        else:
            raise (Exception("%s not generated. [%s]" % (filename, output)))

    except Exception as e:
        raise (e)
