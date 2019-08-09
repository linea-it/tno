import json
import logging
import os
import traceback
from datetime import datetime, timezone

import humanize

from praia.models import (AstrometryAsteroid, AstrometryInput, AstrometryJob,
                          AstrometryOutput, Run)


def register_input(run_id, name, asteroid_input):

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
        submit_time=datetime.now(timezone.utc)
    )
    job.save()

    return job


def register_astrometry_outputs(astrometry_run, asteroid):
    logger = logging.getLogger("astrometry")
    logger.debug("Register outputs for Astrometry Run [ %s ] Asteroid [ %s ]" % (
        astrometry_run, asteroid))

    t0 = datetime.now(timezone.utc)

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
        count = 0
        count_ccds = 0
        outputs = results.get('outputs')
        for ccd in outputs:
            a_files = outputs[ccd]
            count_ccds += 1

            for output in a_files:
                f_type = get_type_by_extension(output.get('extension'))

                update_create_astrometry_output(
                    asteroid, f_type, output.get('filename'), output.get('file_size'), output.get('extension'), output.get('catalog'), ccd)

                count += 1

        logger.debug(
            "Registered outputs [ %s ] for [ %s ] CCDs" % (count, len(ccd)))

        # Registrar Contadores
        asteroid.processed_ccd_image = results.get('processed_images')
        asteroid.execution_time += asteroid.condor_job.execution_time

        if int(asteroid.processed_ccd_image) != int(asteroid.ccd_images):
            asteroid.status = 'warning'
            asteroid.error_msg = 'Some CCDs were not processed.'
        else:
            asteroid.status = 'success'
            asteroid.error_msg = None

        t1 = datetime.now(timezone.utc)
        tdelta = t1 - t0
        asteroid.execution_time += tdelta

        asteroid.save()

        logger.info("Registered [ %s ] outputs for Astrometry Run [ %s ] Asteroid [ %s ] in %s" % (
            count, astrometry_run, asteroid, humanize.naturaldelta(tdelta)))

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


def finish_astrometry_run(astrometry_run):
    logger = logging.getLogger("astrometry")
    logger.debug("Finish Astrometry Run [ %s ]" % astrometry_run)

    instance = Run.objects.get(pk=astrometry_run)

    try:

        # Tempo de execucao da astrometria
        # Recupera o submit_time do primeiro job de astrometria e o ultimo finish time
        first_job = instance.condor_jobs.order_by('submit_time').first()
        last_job = instance.condor_jobs.order_by('-finish_time').first()
        at0 = first_job.submit_time
        at1 = last_job.finish_time
        atDelta = at1 - at0

        instance.execution_astrometry = atDelta

        # Acrescentar os totais de asteroids por status.
        csuccess = instance.asteroids.filter(status='success').count()
        cfailure = instance.asteroids.filter(status='failure').count()
        cwarning = instance.asteroids.filter(status='warning').count()
        cnotexecuted = instance.asteroids.filter(status='not_executed').count()

        instance.count_success = csuccess
        instance.count_failed = cfailure
        instance.count_warning = cwarning
        instance.count_not_executed = cnotexecuted

        if csuccess == 0:
            instance.status = 'warning'
            instance.error_msg = "Successfully executed but no Asteroid successfully completed."
        else:
            instance.status = 'success'
            instance.error_msg = None
            instance.error_traceback = None

        start_time = instance.start_time
        finish_time = datetime.now(timezone.utc)
        tdelta = finish_time - start_time

        instance.finish_time = finish_time
        instance.execution_time = tdelta
        instance.step = 4

        instance.save()

        logger.info("Astrometry Run successfully completed in %s" %
                    humanize.naturaldelta(tdelta))

    except Exception as e:
        trace = traceback.format_exc()
        logger.error(e)
        logger.error(trace)

        instance.status = 'failed'
        instance.error_msg = 'Failed to register execution status. Error: %s' % e
        instance.error_traceback = trace
        instance.save()
