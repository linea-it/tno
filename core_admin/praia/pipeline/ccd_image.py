import os
import csv
from datetime import datetime, timezone, timedelta
from tno.skybotoutput import FilterObjects
from praia.pipeline.register import register_input
from django.conf import settings
from tno.des_ccds import download_des_ccds, count_available_des_ccds


def create_ccd_images_list(run_id, name, output_filepath, max_workers=10):
    # Recuperar as exposicoes para cada objeto.
    start = datetime.now(timezone.utc)

    result = dict({
        'asteroid': name,
        'input_type': 'ccd_images_list',
        'filename': os.path.basename(output_filepath),
        'file_type': 'csv',
        'file_size': None,
        'file_path': output_filepath,
        'ccds_count': None,
        'error_msg': None
    })

    try:
        ccds, ccds_count = FilterObjects().ccd_images_by_object(name)

        if ccds_count is not None and ccds_count > 0:

            headers = ['id', 'pfw_attempt_id', 'desfile_id', 'nite', 'date_obs', 'expnum', 'ccdnum', 'band', 'exptime', 'cloud_apass', 'cloud_nomad', 't_eff', 'crossra0', 'radeg', 'decdeg', 'racmin', 'racmax',
                       'deccmin', 'deccmax', 'ra_cent', 'dec_cent', 'rac1', 'rac2', 'rac3', 'rac4', 'decc1', 'decc2', 'decc3', 'decc4', 'ra_size', 'dec_size', 'path', 'filename', 'compression', 'downloaded']

            with open(output_filepath, mode='w') as temp_file:
                writer = csv.DictWriter(
                    temp_file, delimiter=';', fieldnames=headers)
                writer.writeheader()
                writer.writerows(ccds)

            # Para cada CCD, verifica se ele existe e faz o Download se nao existir.
            downloaded = download_des_ccds(ccds, max_workers)

            result.update({
                'file_size': os.path.getsize(output_filepath),
                'ccds_count': ccds_count,
                'ccds_available': count_available_des_ccds(ccds),
                'ccds_downloaded': downloaded
            })
        else:
            result.update({
                'error_msg': "No CCD Image found for this object.",
            })

    except Exception as e:
        result.update({
            'error_msg': e
        })

    finish = datetime.now(timezone.utc)
    result.update({
        'start_time': start,
        'finish_time': finish,
        'execution_time': finish - start
    })

    register_input(run_id, name, result)

    return result
