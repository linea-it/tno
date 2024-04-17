#!/usr/bin/python2.7
# -*- coding: utf-8 -*-
import argparse
import os
import sys
import traceback
from datetime import datetime

from dao import GaiaDao, MissingDBURIException
from generate_dates import generate_dates_file
from generate_ephemeris import centers_positions_to_deg, generate_ephemeris, run_elimina
from library import (
    check_bsp_object,
    check_bsp_planetary,
    check_leapsec,
    clear_for_rerun,
    read_asteroid_json,
)
from search_candidates import search_candidates

parser = argparse.ArgumentParser()
parser.add_argument("name", help="Object name without spaces")
parser.add_argument("start_date", help="Initial date. example '2018-JAN-01'")
parser.add_argument("final_date", help="Final date. example '2018-DEC-31 23:59:01'")
parser.add_argument("step", help="steps in seconds. Example 60")
parser.add_argument(
    "--leap_sec",
    default="naif0012.tls",
    help="Name of the Leap Seconds file, it must be in the directory /data. example naif0012.tls",
)
parser.add_argument(
    "--bsp_planetary",
    default="de435.bsp",
    help="Name of the BSP Planetary file, it must be in the directory /data. example de435.bsp",
)
parser.add_argument(
    "--bsp_object",
    default=None,
    help="Name of the Asteroid BSP file, it must be in the directory /data. example Eris.bsp. default <name>.bsp",
)
parser.add_argument(
    "-p",
    "--path",
    default=None,
    required=False,
    help="Path where the inputs are and where the outputs will be. must be the path as it is mounted on the volume, should be used when it is not possible to mount the volume as /data. example the inputs are in /archive/asteroids/Eris and this path is mounted inside the container the parameter --path must have this value --path /archive/asteroids/Eris, the program will create a link from this path to /data.",
)


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

    log_file = os.path.join(os.environ.get("DIR_DATA"), "praia_occ.log")

    orig_stdout = sys.stdout
    f = open(log_file, "w")
    sys.stdout = f

    # Seta os nomes de arquivos que serão gerados.
    dates_filename = "dates.txt"
    eph_filename = "%s.eph" % name
    radec_filename = "radec.txt"
    positions_filename = "positions.txt"
    centers_filename = "centers.txt"
    centers_deg_filename = "centers_deg.csv"
    gaia_cat_filename = "gaia_catalog.cat"
    gaia_csv_filename = "gaia_catalog.csv"
    occultation_table_filename = "occultation_table.csv"
    if bsp_object_filename is None:
        bsp_object_filename = "%s.bsp" % name

    # Inputs/Outputs do PRAIA Occ Star Search,
    # IMPORTANTE! esses filenames são HARDCODED na função praia_occ_input_file
    search_input_filename = "praia_occ_star_search_12.dat"
    stars_catalog_mini_filename = "g4_micro_catalog_JOHNSTON_2018"
    stars_catalog_xy_filename = "g4_occ_catalog_JOHNSTON_2018"
    stars_parameters_of_occultation_filename = "g4_occ_data_JOHNSTON_2018"
    stars_parameters_of_occultation_plot_filename = "g4_occ_data_JOHNSTON_2018_table"
    praia_occ_log_filename = "praia_star_search.log"

    # Limpa o diretório app e data removendo os links simbolicos e resultados
    # Util quando se roda varias vezes o mesmo job.
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

    # Procura por um arquivo json com os dados do objeto
    # Se o arquivo exisitir os dados da execução das etapas sera escrito nele.
    # Se não existir sera um dicionario vazio onde serão colocados esses dados e depois salvo como asteroidename.json
    obj_data = read_asteroid_json(name)

    # Checar o arquivo de leapserconds
    leap_sec = check_leapsec(leap_sec_filename)
    print("Leap Second: [%s]" % leap_sec_filename)

    # Checa o arquivo bsp_planetary
    bsp_planetary = check_bsp_planetary(bsp_planetary_filename)
    print("BSP Planetary: [%s]" % bsp_planetary)

    # Checa o arquivo bsp_object
    bsp_object = check_bsp_object(bsp_object_filename)
    print("BSP Object: [%s]" % bsp_object)

    # Gerar arquivo de datas
    # dates_file = os.path.join(os.environ.get("DIR_DATA").rstrip("/"), dates_filename)
    # if not os.path.exists(dates_file):
    #     print("Running geradata.")
    dates_file = generate_dates_file(start_date, final_date, step, dates_filename)
    print("Dates File: [%s]" % dates_file)

    # Gerar a ephemeris
    eph_file = generate_ephemeris(
        dates_file, bsp_object, bsp_planetary, leap_sec, eph_filename, radec_filename
    )

    print("Ephemeris File: [%s]" % eph_file)

    # # TODO: Verificar se é mesmo necessário!
    # # Gerar aquivo de posições
    # positions_file = generate_positions(
    #     eph_filename, positions_filename)

    # print("Positions File: [%s]" % positions_file)

    # TODO: Gerar plot Orbit in Sky se for necessário
    # plotOrbit(object_name, footprint, ecliptic_galactic,
    #         positions, orbit_in_sky)
    # os.chmod(orbit_in_sky, 0776)

    # Executar o Elimina e gerar o Centers.txt
    centers_file = run_elimina(eph_filename, centers_filename)
    print("Centers File: [%s]" % centers_file)

    # Converter as posições do Centers.txt para graus
    # gera um arquivo com as posições convertidas, mas o retorno da função é um array.
    center_positions = centers_positions_to_deg(centers_file, centers_deg_filename)

    # Para cada posição executa a query no banco de dados.
    print("Maximum Visual Magnitude: [%s]" % max_mag)

    dao = GaiaDao(
        name=obj_data["star_catalog"]["name"],
        display_name=obj_data["star_catalog"]["display_name"],
        schema=obj_data["star_catalog"]["schema"],
        tablename=obj_data["star_catalog"]["tablename"],
        ra_property=obj_data["star_catalog"]["ra_property"],
        dec_property=obj_data["star_catalog"]["dec_property"],
    )
    df_catalog = dao.catalog_by_positions(
        center_positions, radius=0.15, max_mag=max_mag
    )
    print("Stars: [%s]" % df_catalog.shape[0])
    # Cria um arquivo no formato especifico do praia_occ
    gaia_cat = dao.write_gaia_catalog(df_catalog.to_dict("records"), gaia_cat_filename)

    print("Gaia Cat: [%s]" % gaia_cat)

    # Cria um arquivo csv do catalogo gaia.
    gaia_csv = dao.gaia_catalog_to_csv(df_catalog, gaia_csv_filename)

    print("Gaia CSV: [%s]" % gaia_csv)

    # Quando o diametro do objeto exitir no json, ele é passado para a função search_candidates
    # que cria o arquivo praia_occ_star_search_12.dat. Sua função é reduzir o numero de calculo necessário
    # especialmente para objetos de diametros pequenos.
    object_diameter_upper_limit = obj_data.get("diameter_err_max", None)
    object_diameter = obj_data.get("diameter", None)
    if object_diameter_upper_limit is None:
        if object_diameter is not None:
            object_diameter *= 1.2
    else:
        object_diameter += object_diameter_upper_limit
    print("Object Diameter: [%s]" % object_diameter)

    # Run PRAIA OCC Star Search 12
    # Criar arquivo .dat baseado no template.
    occultation_file = search_candidates(
        star_catalog=gaia_cat,
        object_ephemeris=eph_file,
        filename=occultation_table_filename,
        object_diameter=object_diameter,
    )

    print("Occultation CSV Table: [%s]" % occultation_file)

    sys.stdout = orig_stdout
    f.close()

    os.chmod(log_file, 0o664)

    return occultation_file
