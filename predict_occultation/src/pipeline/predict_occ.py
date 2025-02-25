import os
import traceback
from datetime import datetime
from pathlib import Path

import pandas as pd
from asteroid import Asteroid
from dao import PredictOccultationJobResultDao
from pipeline.library import count_lines, read_asteroid_json, write_asteroid_json
from pipeline.occ_path_coeff import run_occultation_path_coeff
from pipeline.run_praia_occ import start_praia_occ


def main(
    name: str,
    data_dir: str,
    start_date: datetime,
    final_date: datetime,
    step: int,
    leap_sec_filename: str = "naif0012.tls",
    bsp_planetary_filename: str = "de440.bsp",
):
    # OBS: Name neste script representa o Alias.

    # Procura pelo arquivo json com os dados do objeto
    # Se o arquivo exisitir os dados da execução das etapas serao escritos nele.
    # Se não existir o pipeline não pode ser executado. TODO: Deveria interromper a execução.
    temp_data = read_asteroid_json(name)

    task_id = temp_data["task_id"]

    try:
        a = Asteroid(name=temp_data["name"], base_path=data_dir, path=data_dir)

        obj_data = a.read_asteroid_json()

        # Alterar o status da task para 4-running
        print("Updating task status to 4-running")
        dao_job_result = PredictOccultationJobResultDao()
        dao_job_result.update(id=obj_data["task_id"], data={"status": 4})

        inputs_dir = Path(os.getenv("PREDICT_INPUTS")).joinpath(obj_data["alias"])

        GAIA_NAME = obj_data["star_catalog"]["display_name"]

        # True, se o Nima tiver sido executado e o bsp de resultado tiver sido
        # Utilizado na predicao.
        USED_NIMA_BSP = False

        # ============== Executar o PRAIA OCC ==============

        # Checa o arquivo bsp_object
        bsp_object_filename = obj_data["bsp_jpl"]["filename"]

        # uncertainty file
        mag_and_uncert_path = inputs_dir.joinpath(
            obj_data["bsp_jpl"]["mag_and_uncert_file"]
        )
        if not mag_and_uncert_path.exists():
            # Se não encontrar no diretório de inputs utiliza o diretório do objeto.
            mag_and_uncert_path = Path(data_dir).joinpath(
                obj_data["bsp_jpl"]["mag_and_uncert_file"]
            )
        praia_t0 = datetime.now()

        # Define o limite máximo para as magnitudes das estrelas ocultadas
        MAXIMUM_VMAG_DEFAULT = 18
        maximum_visual_magnitude = MAXIMUM_VMAG_DEFAULT
        print("Maximum Visual Magnitude: [%s]" % maximum_visual_magnitude)

        print("Running PRAIA OCC")
        occultation_file = start_praia_occ(
            name,
            str(start_date),
            str(final_date),
            step,
            leap_sec_filename,
            bsp_planetary_filename,
            bsp_object_filename,
            maximum_visual_magnitude,
        )

        praia_t1 = datetime.now()
        praia_td = praia_t1 - praia_t0

        print("PRAIA OCC is Done!")
        if os.path.exists(occultation_file):
            print("Occultation table created: [%s]" % occultation_file)

            # Quantidade de predições.
            # Subtrai 1 por que o arquivo mesmo vazio tem os Headers
            count = count_lines(occultation_file) - 1
            print("Praia OCC Count: [%s]" % count)

            # Quantidade de estrelas analisadas.
            gaia_catalog_csv = os.path.join(data_dir, "gaia_catalog.csv")
            count_stars = count_lines(gaia_catalog_csv) - 1

            praia_result = dict(
                {
                    "filename": os.path.basename(occultation_file),
                    "size": os.path.getsize(occultation_file),
                    "count": count,
                    "start_period": str(start_date),
                    "end_period": str(final_date),
                    "start": praia_t0.isoformat(),
                    "finish": praia_t1.isoformat(),
                    "exec_time": praia_td.total_seconds(),
                    "catalog": GAIA_NAME,
                    "predict_step": int(step),
                    "bsp_planetary": bsp_planetary_filename.split(".")[0],
                    "leap_seconds": leap_sec_filename.split(".")[0],
                    "nima": USED_NIMA_BSP,
                    "maximum_visual_magnitude": maximum_visual_magnitude,
                    "stars": count_stars,
                }
            )

        else:
            praia_result = dict(
                {
                    "message": "PRAIA was executed but failed to create Occultation table."
                }
            )

            raise Exception(
                "Failed to create Occultation table. [%s]" % occultation_file
            )

        a.set_predict_occultation(praia_result)

        # TODO: Toda esta parte do path coeff deveria estar dentro da função que roda o praia.
        # Executa o calculo Coeff Path
        # Somente calcula path coeff se o arquivo existir e não for vazio
        occultation_filepath = Path(occultation_file)
        print("PRAIA Occultation File Path: [%s]" % occultation_filepath)

        if occultation_filepath.exists() and not pd.read_csv(occultation_file).empty:

            print("Calculating path coef")
            # TODO: path_coeff deve ter tratamento de erro e lançar exceções.
            path_coef_result = run_occultation_path_coeff(
                predict_table_path=occultation_filepath,
                obj_data=a.read_asteroid_json(),
                mag_and_uncert_path=mag_and_uncert_path,
            )
            # obj_data["calculate_path_coeff"] = path_coef_result
            a.set_calculate_path_coeff(path_coef_result)

            # Só pode registrar no banco de dados as predições de occultação.
            # Caso a patch coef tenha sido executado com sucesso.
            # Se não o csv vai estar em outro formato.
            print("startirng register occultations in database")
            a.register_occultations()

        # Escreve os dados da execução no arquivo json do objeto.
        # write_asteroid_json(name, obj_data)
        a.write_asteroid_json()

    except Exception as e:
        print(e)
        traceback.print_exc()
        # TODO: Erro não tratado, deve ser registrado no banco de dados.
        # O problema é que o consolidate do finaly sobrescreve.
        # deveria ficar regitrado pela Classe Asteroid.
    finally:
        print("Consolidating Asteroid execution data")
        consolidated = a.consiladate()
        dao_job_result.update(id=task_id, data=consolidated)
        print("Task status updated")
