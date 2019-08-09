import json
import logging
import os
import traceback
from datetime import datetime, timezone

from praia.models import (AstrometryAsteroid, AstrometryInput, AstrometryJob,
                          AstrometryOutput, Run)


def register_input(run_id, name, asteroid_input):
    # try:

    asteroid = AstrometryAsteroid.objects.get(
        astrometry_run=run_id, name=name)

    input_model, create = AstrometryInput.objects.update_or_create(
        asteroid=asteroid,
        input_type=asteroid_input["input_type"],
        defaults={
            'filename': asteroid_input["filename"],
            'file_size': asteroid_input["file_size"],
            'file_type': asteroid_input["file_type"],
            'file_path': asteroid_input["file_path"],
            'error_msg': asteroid_input["error_msg"],
            'start_time': asteroid_input["start_time"],
            'finish_time': asteroid_input["finish_time"],
            'execution_time': asteroid_input["execution_time"],
        })
    input_model.save()

    return input_model


def register_condor_job(astrometryRun, asteroid, clusterid, procid, job_status):

    job = AstrometryJob.objects.create(
        astrometry_run=astrometryRun,
        asteroid=asteroid,
        clusterid=clusterid,
        procid=procid,
        job_status=job_status,
        # start_time=datetime.now(timezone.utc)
        submit_time=datetime.now(timezone.utc)
    )
    job.save()

    return job


def register_astrometry_outputs(astrometry_run, asteroid):
    logger = logging.getLogger("astrometry")
    logger.info("Register outputs for Astrometry Run [ %s ] Asteroid [ %s ]" % (
        astrometry_run, asteroid))

    asteroid = AstrometryAsteroid.objects.get(
        astrometry_run=astrometry_run, name=asteroid)

    try:
        # Verificar se o arquivo astrometria.json que contem os resultados do pipeline foi criado
        result_json = os.path.join(asteroid.relative_path, 'astrometry.json')

        # Se nao existir marca o asteroid como falha
        if not os.path.exists(result_json):
            logger.debug("Arquivo Output NAO existe")

            asteroid.status = 'failed'
            asteroid.error_msg = 'Asteroid was processed but the outputs file was not created.'
            asteroid.save()

            return

        results = read_astrometry_json(result_json)

        # Astrometry File
        astrometry = results.get('astrometry')
        if not astrometry.get('file_size') > 0:
            # Se o arquivo de Astrometria estiver vazio, muda o status para warning
            asteroid.status = 'warning'
            asteroid.error_msg = 'Astrometry file is empty.'

        update_create_astrometry_output(
            asteroid, 'astrometry', astrometry.get('filename'), astrometry.get(
                'file_size'), astrometry.get('extension')
        )

        # Target Offset
        output = results.get('target_offset')
        update_create_astrometry_output(
            asteroid, 'target_offset', output.get('filename'), output.get(
                'file_size'), output.get('extension')
        )

        # Targets File
        output = results.get('targets_file')
        update_create_astrometry_output(
            asteroid, 'targets', output.get('filename'), output.get(
                'file_size'), output.get('extension')
        )

        # Arquivos XY gerados para cada ccd e varios catalogos de referencia
        outputs = results.get('outputs')
        for ccd in outputs:
            a_files = outputs[ccd]

            for output in a_files:
                f_type = get_type_by_extension(output.get('extension'))

                update_create_astrometry_output(
                    asteroid, f_type, output.get('filename'), output.get('file_size'), output.get('extension'), output.get('catalog'), ccd)
                logger.debug("TESTE")

        logger.debug("OK ate aqui ")

        # Registar arquivo de Astrometria.

    except Exception as e:
        trace = traceback.format_exc()
        logger.error(e)
        logger.error(trace)

        asteroid.status = 'failed'
        asteroid.error_msg = 'Asteroid was processed but failed to record results. Error: %s' % e
        asteroid.save()


def read_astrometry_json(filepath):
    with open(filepath, 'r') as fp:
        results = json.load(fp)

        return results


def update_create_astrometry_output(
        asteroid, type, filename, file_size, file_type, catalog=None, ccd_image=None):

    # Corrigir o filepath, pegar o filename e somar com o relative_path do asteroid
    file_path = os.path.join(asteroid.relative_path, filename)

    record, created = AstrometryOutput.objects.update_or_create(
        asteroid=asteroid,
        type=type,
        filename=filename,
        defaults={
            'file_size': file_size,
            'file_type': file_type,
            'file_path': file_path,
            'catalog': catalog,
            'ccd_image': ccd_image
        })

    record.save()

    return record


def get_type_by_extension(extension):
    if extension == '.xy':
        return 'astrometric_results'

    elif extension == '.mes':
        return 'mes'

    elif extension == '.reg':
        return 'saoimage_region_file'

    else:
        return None