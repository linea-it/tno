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

# BENCHMARK_MODULE_START - Easy to remove: delete this import and the benchmark call
if os.getenv("BENCHMARK_ENABLED", "").lower() in ("true", "1", "yes"):
    try:
        from pipeline.benchmark import run_benchmark
    except ImportError:
        run_benchmark = None
else:
    run_benchmark = None
# BENCHMARK_MODULE_END


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

    a = Asteroid(name=temp_data["name"], base_path=data_dir, path=data_dir)

    try:
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
        try:
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

        except Exception as e:
            msg = f"Failed to run PRAIA OCC. Error: {e}"
            print(msg)
            praia_result = dict(
                {
                    "message": msg,
                }
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

            # BENCHMARK_CALL_START - Easy to remove: delete this block
            # Run benchmarking after path_coeff completes (if enabled)
            # This monitors both PRAIA and path_coeff (astropy-heavy) stages
            if run_benchmark is not None:
                try:
                    # Get occultation count for benchmark
                    occ_count = None
                    if os.path.exists(occultation_file):
                        occ_count = count_lines(occultation_file) - 1

                    # Extract path_coeff timing from result
                    path_coeff_start = None
                    path_coeff_finish = None
                    path_coeff_exec_time = None
                    path_coeff_detailed_timings = None
                    if path_coef_result and isinstance(path_coef_result, dict):
                        if "start" in path_coef_result:
                            try:
                                path_coeff_start = datetime.fromisoformat(
                                    path_coef_result["start"].replace("Z", "+00:00")
                                )
                            except (ValueError, AttributeError):
                                pass
                        if "finish" in path_coef_result:
                            try:
                                path_coeff_finish = datetime.fromisoformat(
                                    path_coef_result["finish"].replace("Z", "+00:00")
                                )
                            except (ValueError, AttributeError):
                                pass
                        if "exec_time" in path_coef_result:
                            path_coeff_exec_time = path_coef_result["exec_time"]
                        # Get detailed timings if available
                        if "benchmark_timings" in path_coef_result:
                            path_coeff_detailed_timings = path_coef_result[
                                "benchmark_timings"
                            ]

                    # Get catalog query timing from run_praia_occ module
                    catalog_query_timing = None
                    try:
                        from pipeline.run_praia_occ import get_benchmark_timings

                        praia_timings = get_benchmark_timings()
                        if praia_timings and "catalog_query" in praia_timings:
                            catalog_query_timing = praia_timings["catalog_query"]
                    except (ImportError, AttributeError):
                        pass

                    run_benchmark(
                        data_dir=data_dir,
                        asteroid_name=temp_data["name"],
                        task_id=task_id,
                        praia_start=praia_t0,
                        praia_finish=praia_t1,
                        praia_exec_time=praia_td.total_seconds(),
                        occultation_count=occ_count,
                        path_coeff_start=path_coeff_start,
                        path_coeff_finish=path_coeff_finish,
                        path_coeff_exec_time=path_coeff_exec_time,
                        catalog_query_timing=catalog_query_timing,
                        path_coeff_detailed_timings=path_coeff_detailed_timings,
                    )
                except Exception as e:
                    # Don't fail pipeline if benchmarking fails
                    print(f"Warning: Benchmarking failed: {e}")
            # BENCHMARK_CALL_END

            # Consolida os resultados, adiciona informações de provenance
            # Formata o arquivo de saida, mas não insere as prediçoes no banco de dados.
            # 2025-07-15 - O registro dos resultados no banco de dados será feito na consolidação do job.
            print("Consolidating Occultations")
            a.consolidate_results()

        # Escreve os dados da execução no arquivo json do objeto.
        a.write_asteroid_json()

    except Exception as e:
        print(e)
        traceback.print_exc()
        # TODO: Erro não tratado, deve ser registrado no banco de dados.
        # O problema é que o consolidate do finaly sobrescreve.
        # deveria ficar regitrado pela Classe Asteroid.
    finally:
        print("Processing finished, updating task status to 6-ingesting")
        # Changing status to Ingesting
        # This indicates that the task is in the process of being finalized.
        # and waiting for the registration of the occultations.
        # Status 6 is Ingesting
        dao_job_result.update(id=task_id, data={"status": 6})
        print("Task status updated")
