# -*- coding: utf-8 -*-

import argparse
import os
import traceback
from datetime import datetime

from pipeline.predict_occ import main

parser = argparse.ArgumentParser()
parser.add_argument("name", help="Object name without spaces. example '1999RB216'")
parser.add_argument("start_date", help="Initial date. example '2018-01-01'")
parser.add_argument("final_date", help="Final date. example '2018-12-31'")
parser.add_argument("--step", help="steps in seconds. Example 60", default=600)
parser.add_argument(
    "--leap_sec",
    default="naif0012.tls",
    help="Name of the Leap Seconds file, it must be in the directory /data. example naif0012.tls",
)
parser.add_argument(
    "--bsp_planetary",
    default="de440.bsp",
    help="Name of the BSP Planetary file, it must be in the directory /data. example de440.bsp",
)

parser.add_argument(
    "--refina_orbit",
    action="store_true",
    help="Use this parameter to perform orbit refinement with NIMA when possible. Without this parameter, execution will jump straight to the prediction, which is the default behavior.",
)
parser.add_argument(
    "-p",
    "--path",
    default=None,
    required=False,
    help="Path where the inputs are and where the outputs will be. must be the path as it is mounted on the volume, should be used when it is not possible to mount the volume as /data. example the inputs are in /archive/asteroids/Eris and this path is mounted inside the container the parameter --path must have this value --path /archive/asteroids/Eris, the program will create a link from this path to /data.",
)

if __name__ == "__main__":
    t0 = datetime.now()

    args = parser.parse_args()

    print("******************************************************************")
    print("HOME: %s" % os.environ.get("HOME"))
    print("ASTROPY CACHE: %s" % os.environ.get("XDG_CACHE_HOME"))
    import astropy.config as config

    # Get the path to the currently used cache directory
    cache_directory = config.get_cache_dir()
    print(f"Astropy is using the following cache directory: {cache_directory}")

    print("******************************************************************")

    # Verifica o path onde o programa está sendo executado
    app_path = os.environ.get("APP_PATH")
    original_cwd = os.getcwd()
    print("Current Path: %s" % original_cwd)

    if original_cwd != app_path:
        print("Changing the work directory")
        os.chdir(app_path)
        print("Current Path: %s" % os.getcwd())

    try:

        # Tratar o diretório dos inputs
        if (
            args.path is not None
            and os.path.exists(os.environ.get("DIR_DATA")) is False
        ):
            # Se for passado o parametro --path e o diretório /tmp/data nao existir
            # Cria um link simbolico do --path para /tmp/data (não pode ser /data por causa de permissão.)
            # Altera a variavel de ambiente DIR_DATA com o valor /tmp/data.
            # é necessário criar este link por que os paths para os arquivos
            # não podem ser muito grande limite de 50 caracteres para o PRAIA_OCC.
            os.symlink(args.path, os.environ.get("DIR_DATA"))

        if args.path is None and os.path.exists(os.environ.get("DIR_DATA")) is False:
            # Se não for passado o parametro --path e o diretório /data não existir o programa para a execução.
            raise Exception(
                "No data directory was found. use the volume mounting the data in the /data directory or run the run.py script with parameter --path in which case the directory passed as parameter must be a mounted volume."
            )

        # Diretorio de Dados dentro do container.
        data_dir = os.environ.get("DIR_DATA").rstrip("/")
        print("DATA DIR: [%s]" % data_dir)

        # Tratar os Parametros de entrada
        # TODO: Estes argumentos podem ser recuperados do asteroid json
        name = args.name.replace(" ", "").replace("_", "")
        # Converter para datetime para testar se a data é valida
        start_date = datetime.strptime(args.start_date, "%Y-%m-%d").date()
        final_date = datetime.strptime(args.final_date, "%Y-%m-%d").date()
        step = args.step
        leap_sec_filename = args.leap_sec
        bsp_planetary_filename = args.bsp_planetary

        # Até aqui preparou o ambiente para a execução Praia OCC.

        main(
            name=name,
            data_dir=data_dir,
            start_date=start_date,
            final_date=final_date,
            step=int(step),
            leap_sec_filename=leap_sec_filename,
            bsp_planetary_filename=bsp_planetary_filename,
        )

    except Exception as e:
        print(e)
        traceback.print_exc()

    finally:
        # Volta para o diretório original
        os.chdir(original_cwd)

        t1 = datetime.now()
        td = t1 - t0
        print("Predict Occultation Done in %s" % td)
