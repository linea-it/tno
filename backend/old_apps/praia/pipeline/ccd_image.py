import os
import csv
from datetime import datetime, timezone, timedelta
from tno.skybotoutput import FilterObjects, SkybotOutput, Pointing as PointingDB
from praia.pipeline.register import register_input
from django.conf import settings
from tno.des_ccds import download_des_ccds, count_available_des_ccds
import traceback
import logging


def create_ccd_images_list(run_id, name, output_filepath, max_workers=10):
    logger = logging.getLogger("astrometry")

    # Recuperar as exposicoes para cada objeto.
    start = datetime.now(timezone.utc)

    result = dict(
        {
            "asteroid": name,
            "input_type": "ccd_images_list",
            "filename": os.path.basename(output_filepath),
            "file_type": "csv",
            "file_size": None,
            "file_path": output_filepath,
            "ccds_count": None,
            "error_msg": None,
        }
    )
    try:
        # Listar todos as posicoes do objeto que estejam associadas a um CCD.
        positions, count = SkybotOutput().positions_by_object(name, only_in_ccd=True)

        logger.debug("Skybot Positions: [%s]" % len(positions))

        if positions is not None and len(positions) > 0:
            pdb = PointingDB()
            rows = list()

            # Para cada posicao recuperar os dados do ccd na tabela de apontamentos.
            for position in positions:

                pointing = pdb.exposure_by_expnum(
                    position["expnum"], position["ccdnum"], position["band"]
                )

                if pointing is not None:
                    # Adiciona o ID do Skybotoutput que resultou na selecao deste Apontamento.
                    pointing.update({"skybotoutput_id": position["id"]})

                    logger.debug(
                        "Pointing: [%s] for Position: [%s]"
                        % (pointing["id"], position["id"])
                    )

                    rows.append(pointing)
                else:
                    # Nao encontrou um apontamento para esta posicao.
                    logger.warning(
                        "Pointing not foud for Position: [%s]" % (position["id"])
                    )

            logger.debug("Pointings: [%s]" % len(rows))
            headers = [
                "id",
                "pfw_attempt_id",
                "desfile_id",
                "nite",
                "date_obs",
                "expnum",
                "ccdnum",
                "band",
                "exptime",
                "cloud_apass",
                "cloud_nomad",
                "t_eff",
                "crossra0",
                "radeg",
                "decdeg",
                "racmin",
                "racmax",
                "deccmin",
                "deccmax",
                "ra_cent",
                "dec_cent",
                "rac1",
                "rac2",
                "rac3",
                "rac4",
                "decc1",
                "decc2",
                "decc3",
                "decc4",
                "ra_size",
                "dec_size",
                "path",
                "filename",
                "compression",
                "skybotoutput_id",
            ]

            with open(output_filepath, mode="w") as temp_file:
                writer = csv.DictWriter(temp_file, delimiter=";", fieldnames=headers)
                writer.writeheader()
                writer.writerows(rows)

            # Para cada CCD, verifica se ele existe e faz o Download se nao existir.
            downloaded = download_des_ccds(rows, max_workers)

            result.update(
                {
                    "file_size": os.path.getsize(output_filepath),
                    "ccds_count": len(rows),
                    "ccds_available": count_available_des_ccds(rows),
                    "ccds_downloaded": downloaded,
                }
            )

        else:
            result.update(
                {
                    "error_msg": "No CCD Image found for this object.",
                }
            )

    except Exception as e:
        trace = traceback.format_exc()
        logger.error(e)
        logger.error(trace)
        result.update({"error_msg": e})

    finish = datetime.now(timezone.utc)
    result.update(
        {"start_time": start, "finish_time": finish, "execution_time": finish - start}
    )

    register_input(run_id, name, result)

    return result

    #     return dict({
    #         'count': len(rows),
    #         'rows': rows
    #     })
    # except Exception as e:
    #     trace = traceback.format_exc()
    #     logger.error(e)
    #     logger.error(trace)

    # try:
    #     ccds, ccds_count = FilterObjects().ccd_images_by_object(name, only_in_ccd=True)

    #     if ccds_count is not None and ccds_count > 0:

    #         headers = ['id', 'pfw_attempt_id', 'desfile_id', 'nite', 'date_obs', 'expnum', 'ccdnum', 'band', 'exptime', 'cloud_apass', 'cloud_nomad', 't_eff', 'crossra0', 'radeg', 'decdeg', 'racmin', 'racmax',
    #                    'deccmin', 'deccmax', 'ra_cent', 'dec_cent', 'rac1', 'rac2', 'rac3', 'rac4', 'decc1', 'decc2', 'decc3', 'decc4', 'ra_size', 'dec_size', 'path', 'filename', 'compression', 'downloaded']

    #         with open(output_filepath, mode='w') as temp_file:
    #             writer = csv.DictWriter(
    #                 temp_file, delimiter=';', fieldnames=headers)
    #             writer.writeheader()
    #             writer.writerows(ccds)

    #         # Para cada CCD, verifica se ele existe e faz o Download se nao existir.
    #         downloaded = download_des_ccds(ccds, max_workers)

    #         result.update({
    #             'file_size': os.path.getsize(output_filepath),
    #             'ccds_count': ccds_count,
    #             'ccds_available': count_available_des_ccds(ccds),
    #             'ccds_downloaded': downloaded
    #         })
    #     else:
    #         result.update({
    #             'error_msg': "No CCD Image found for this object.",
    #         })

    # except Exception as e:
    #     result.update({
    #         'error_msg': e
    #     })

    # finish = datetime.now(timezone.utc)
    # result.update({
    #     'start_time': start,
    #     'finish_time': finish,
    #     'execution_time': finish - start
    # })

    # register_input(run_id, name, result)

    # return result
