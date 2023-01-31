import os
import csv
import shutil
from datetime import datetime, timezone, timedelta
import logging
import traceback
from old_apps.skybotoutput import FilterObjects
from orbit.bsp_jpl import BSPJPL
from praia.pipeline.register import register_input


def retrieve_bsp_jpl(run_id, name, output_filepath):
    """
    Recupera o BSP JPL para um asteroid.
    verifica se existe algum bsp ja baixado para o asteroid.
    se existir faz uma copia para o diretorio do objeto.
    se nao existir faz o download.
    """
    start = datetime.now(timezone.utc)
    filename = "%s.bsp" % name.replace(" ", "")
    logger = logging.getLogger("astrometry")
    result = dict(
        {
            "asteroid": name,
            "input_type": "bsp_jpl",
            "filename": filename,
            "file_type": "bsp",
            "file_size": None,
            "file_path": None,
            "error_msg": None,
        }
    )
    try:
        # verificar se ja existe bsp baixado dentro da validade.
        rows = FilterObjects().check_bsp_jpl_by_object(name, 30)
        if len(rows) == 1:
            logger.debug(
                "A valid BSP_JPL already exists for this asteroid. [ %s ]" % name
            )
            # Copiar o arquivo para o diretorio do objeto.
            original_file_path, bsp_model = BSPJPL().get_file_path(name)

            bsp_file = os.path.basename(original_file_path)
            f = os.path.join(output_filepath, bsp_file)

            shutil.copy2(original_file_path, f)

            if os.path.exists(f):
                result.update(
                    {
                        "file_path": f,
                        "file_size": os.path.getsize(output_filepath),
                    }
                )
            else:
                result.update(
                    {
                        "error_msg": "Failed to copy the BSP JPL file. [ %s -> %s ]"
                        % (original_file_path, f)
                    }
                )
        else:
            logger.debug(
                "BSP JPL not have or is old, a new download will be executed. [ %s ]"
                % name
            )
            bsp_path = BSPJPL().get_bsp_basepath()

            record = BSPJPL().download(name, filename, bsp_path, logger)

            if record is not None:
                bsp_model, created = BSPJPL().update_or_create_record(record)

                # Copy bsp from BSP_JPL_DIR to Asteroid DIR
                original_file_path = record.get("file_path")
                bsp_file = os.path.join(output_filepath, filename)
                shutil.copy2(original_file_path, bsp_file)

                if os.path.exists(bsp_file):
                    result.update(
                        {
                            "file_path": bsp_file,
                            "file_size": os.path.getsize(bsp_file),
                        }
                    )
                else:
                    result.update(
                        {
                            "error_msg": "Failed to copy the BSP JPL file. [ %s -> %s ]"
                            % (original_file_path, bsp_file)
                        }
                    )
            else:
                result.update({"error_msg": "Failed to download the BSP JPL file."})

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
