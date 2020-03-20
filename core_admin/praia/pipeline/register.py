import json
import logging
import os
import traceback
from datetime import datetime, timedelta, timezone

import humanize

from praia.models import (AstrometryAsteroid, AstrometryInput, AstrometryJob,
                          AstrometryOutput, Run)
from tno.condor import (check_condor_job, check_job_history, get_job_by_id,
                        remove_job)

import csv


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


def update_job_status(job, condor_job):
    """
        Condor status
        0 - 'Unexpanded'
        1 - 'Idle'
        2 - 'Running'
        3 - 'Removed'
        4 - 'Completed'
        5 - 'Held'
        6 - 'Submission'

    """
    logger = logging.getLogger("astrometry")

    job.global_job_id = condor_job['GlobalJobId']
    job.job_status = int(condor_job['JobStatus'])

    if 'ClusterName' in condor_job:
        job.cluster_name = condor_job['ClusterName']

    if 'RemoteHost' in condor_job:
        job.remote_host = condor_job['RemoteHost']

    if 'Args' in condor_job:
        job.args = condor_job['Args']

    if 'JobStartDate' in condor_job:
        job.start_time = datetime.fromtimestamp(
            int(condor_job['JobStartDate']))

    if condor_job['JobStatus'] == '1':
        logger.debug("Job in Idle")

        job.asteroid.status = 'idle'
        job.asteroid.save()

        job.save()

    elif condor_job['JobStatus'] == '2':
        logger.debug("Job Running")
        job.asteroid.status = 'running'
        job.asteroid.save()

        job.save()

    elif condor_job['JobStatus'] == '3':
        logger.debug("Job Removed")

        job.asteroid.status = 'failure'
        job.asteroid.error_msg = "Condor job has a Removed status and has not been executed. Check condor log for details."
        job.asteroid.save()

        finish_time = datetime.now()
        job.finish_time = finish_time
        job.execution_time = finish_time - job.start_time

        job.save()

        register_astrometry_outputs(job.astrometry_run.pk, job.asteroid.name)

    elif condor_job['JobStatus'] == '4':
        logger.debug("Job Completed")

        finish_time = datetime.fromtimestamp(int(condor_job['CompletionDate']))
        job.finish_time = finish_time
        job.execution_time = finish_time - job.start_time

        job.save()

        register_astrometry_outputs(job.astrometry_run.pk, job.asteroid.name)

    elif condor_job['JobStatus'] == '5':
        logger.debug("Job Hold")

        job.save()

        # Remover o job do condor
        try:
            remove_job(job.clusterid, job.procid)
        except Exception as e:
            logger.error(e)

        logger.debug("Teste")

    else:
        logger.debug(
            "Job with untreated status. JobStatus [%s] " % condor_job['JobStatus'])
        job.asteroid.status = 'failure'
        job.asteroid.error_msg = "job in the condor returned a status not handled by the application. Check the condor log for more details."

        finish_time = datetime.fromtimestamp(int(condor_job['CompletionDate']))
        job.finish_time = finish_time
        job.execution_time = finish_time - job.start_time

        job.save()

    logger.info("Update Condor Job ClusterId [ %s ] ProcId [ %s ] Status: [ %s ] " % (
        job.clusterid, job.clusterid.procid, condor_job['JobStatus']))

def register_csv_stages_outputs(filepath, rows, unique_stage=''):

    logger = logging.getLogger('astrometry')

    stages = list(['header_extraction', 'praia_targets', 'plots']) if unique_stage is '' else list([unique_stage])
    columns = list(['object', 'start', 'finish', 'execution_time', 'ccd', 'stage'])

    # Time profile list:
    time_profile_list = list()

    for stage in stages:
        time_profile_list.append(dict({
            'object': rows['asteroid'],
            'ccd': None,
            'stage': stage,
            'start':rows[stage]['start'],
            'finish': rows[stage]['finish'],
            'execution_time': rows[stage]['execution_time'],
        }))

    if 'outputs' in rows:
        for output in rows['outputs']:
            if rows['outputs'][output]['start']:
                time_profile_list.append(dict({
                    'object': rows['asteroid'],
                    'ccd': None,
                    'stage': 'praia_astrometry',
                    'start':rows['outputs'][output]['start'],
                    'finish': rows['outputs'][output]['finish'],
                    'execution_time': rows['outputs'][output]['execution_time'],
                }))

    time_profile_list.sort(key=lambda x: x['start'])

    # Check if the file exists:
    file_exists = False if os.path.isfile(filepath) is False else True

    try:
        with open(filepath, 'a+') as file:
            writer = csv.DictWriter(file, fieldnames=columns)

            if not file_exists:
                writer.writeheader()

            for row in time_profile_list:
                writer.writerow(row)

    except IOError:
        return IOError

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

            if asteroid.status != 'failure':
                asteroid.status = 'failure'
                asteroid.error_msg = 'Asteroid was processed but the output file was not created.'

            t1 = datetime.now(timezone.utc)
            tdelta = t1 - t0
            asteroid.execution_time += tdelta

            asteroid.save()

            logger.warning(
                "Asteroid [ %s ] was processed but the output file was not created." % (asteroid.name))

        else:

            results = read_astrometry_json(result_json)

            # Astrometry File
            try:
                astrometry = results.get('astrometry')
                if not astrometry.get('file_size') > 0 and asteroid.status != 'failure':
                    # Se o arquivo de Astrometria estiver vazio, muda o status para warning
                    asteroid.status = 'warning'
                    asteroid.error_msg = 'Astrometry file is empty.'

                update_create_astrometry_output(
                    asteroid, 'astrometry', astrometry.get('filename'), astrometry.get(
                        'file_size'), astrometry.get('extension')
                )
            except Exception as e:
                logger.warning(
                    "Failed to register Astrometry File. %s" % e)

            # Target Offset
            try:
                output = results.get('target_offset')
                update_create_astrometry_output(
                    asteroid, 'target_offset', output.get('filename'), output.get(
                        'file_size'), output.get('extension')
                )
            except Exception as e:
                logger.warning(
                    "Failed to register Target Offset. %s" % e)

            # Targets File
            try:
                output = results.get('targets_file')
                update_create_astrometry_output(
                    asteroid, 'targets', output.get('filename'), output.get(
                        'file_size'), output.get('extension')
                )
            except Exception as e:
                logger.warning(
                    "Failed to register Targets File. %s" % e)

            # Targets Search Log
            try:
                filename = results.get('praia_targets').get('log')
                filepath = os.path.join(asteroid.relative_path, filename)
                filesize = os.path.getsize(filepath)

                update_create_astrometry_output(
                    asteroid, 'targets_log', filename, filesize, '.log')

            except Exception as e:
                logger.warning(
                    "Failed to register PRAIA Target Search Log. %s" % e)

            # Header Extraction
            try:
                output = results.get('header_extraction')
                update_create_astrometry_output(
                    asteroid, 'header_extraction', output.get('filename'), output.get(
                        'file_size'), output.get('extension')
                )
            except Exception as e:
                logger.warning(
                    "Failed to register PRAIA Header Extraction. %s" % e)

            # Header Extraction Log
            try:
                filename = results.get('header_extraction').get('log')
                filepath = os.path.join(asteroid.relative_path, filename)
                filesize = os.path.getsize(filepath)

                update_create_astrometry_output(
                    asteroid, 'header_extraction_log', filename, filesize, '.log')
            except Exception as e:
                logger.warning("Failed to register PRAIA Header Log. %s" % e)

            # Outputs gerados para cada CCD
            count = 0
            count_ccds = 0
            outputs = results.get('outputs')

            for ccd_id in outputs:
                ccd = outputs[ccd_id]
                a_files = ccd.get('files')
                count_ccds += 1

                for output in a_files:
                    f_type = get_output_type(output)

                    update_create_astrometry_output(
                        asteroid, f_type, output.get('filename'), output.get('file_size'), output.get('extension'), output.get('catalog'), ccd['ccd_id'])

                    count += 1

            logger.debug(
                "Registered outputs [ %s ] for [ %s ] CCDs" % (count, count_ccds))

            # Registrar Contadores
            asteroid.available_ccd_image = results.get('available_images')
            asteroid.processed_ccd_image = results.get('processed_images')
            asteroid.outputs = count

            try:
                # Execution Time for Praia Header Extraction
                etime = results.get(
                    'header_extraction').get('execution_time', 0)
                asteroid.execution_header = timedelta(
                    seconds=etime)
            except Exception as e:
                logger.warning(
                    "Failed to register execution time for Praia Header Extraction. %s" % e)

            try:
                # Execution Time for Praia Astrometry
                etime = results.get(
                    'praia_astrometry').get('execution_time', 0)
                asteroid.execution_astrometry = timedelta(
                    seconds=etime)
            except Exception as e:
                logger.warning(
                    "Failed to register execution time for Praia Astrometry. %s" % e)

            try:
                # Execution Time for Praia Targets
                etime = results.get(
                    'praia_targets').get('execution_time', 0)
                asteroid.execution_targets = timedelta(
                    seconds=etime)

            except Exception as e:
                logger.warning(
                    "Failed to register execution time for Praia Targets. %s" % e)

            try:
                # Execution Time for Plots
                etime = results.get(
                    'plots').get('execution_time', 0)
                asteroid.execution_plots = timedelta(
                    seconds=etime)

            except Exception as e:
                logger.warning(
                    "Failed to register execution times for Plots. %s" % e)

            if asteroid.status != 'failure':
                if int(asteroid.processed_ccd_image) != int(asteroid.ccd_images) and asteroid.status != 'failure':
                    asteroid.status = 'warning'
                    asteroid.error_msg = 'Some CCDs are not available.'
                else:
                    asteroid.status = 'success'
                    asteroid.error_msg = None

            # TODO rever essa regra de falha
            if results.get('error') is not None:
                asteroid.status = 'warning'
                asteroid.error_msg = results.get('error')

            # Execution Time Registry outputs
            t1 = datetime.now(timezone.utc)
            tdelta = t1 - t0
            asteroid.execution_registry = tdelta

            asteroid.execution_time = (asteroid.execution_ccd_list + asteroid.execution_bsp_jpl + asteroid.execution_reference_catalog +
                                       asteroid.execution_header + asteroid.execution_astrometry + asteroid.execution_targets + asteroid.execution_plots + asteroid.execution_registry)

            asteroid.save()

            # Executar o time profile:
            stages_output_filepath = os.path.join(asteroid.relative_path, 'time_profile.csv')

            logger.info("--------- filepath ----------")
            logger.info(stages_output_filepath)
            logger.info("--------- filepath ----------")
            register_csv_stages_outputs(stages_output_filepath, results)

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


def get_output_type(output):
    if output.get('extension') == '.xy':
        return 'astrometric_results'

    elif output.get('extension') == '.mes':
        return 'mes'

    elif output.get('extension') == '.reg':
        return 'saoimage_region_file'

    elif output.get('extension') == '.txt':
        return output.get('filename').split('.')[1]

    elif output.get('extension') == '.dat':
        return 'astrometry_params'

    elif output.get('extension') == '.log':
        return 'astrometry_log'

    elif output.get('extension') == '.png':
        return 'astrometry_plot'

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
        try:
            at1 = last_job.finish_time
        except:
            at1 = datetime.now(timezone.utc)

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


def check_astrometry_running():
    logger = logging.getLogger("astrometry_daemon")

    runs = Run.objects.filter(status='running', step=3)

    # logger.debug("Astrometry Runs: %s" % runs)

    # Para cada running recupera os jobs
    for astrometry_run in runs:

        # Lista todos os jobs que nao estejam em Idle ou Running
        jobs = astrometry_run.condor_jobs.all().exclude(job_status__in=[3, 4])

        if jobs.count() > 0:
            # Para cada Job verifica o status no Cluster
            for job in jobs:

                result = get_job_by_id(job.clusterid, job.procid)

                logger.info("Check Status. Asteroid: [%s] Old Status: [%s] Current Status: [%s] ClusterId: [ %s ] " % (
                    job.asteroid.name, job.job_status, result['JobStatus'], job.clusterid))

                if int(result['JobStatus']) != int(job.job_status):
                    logger.debug("STATUS Diferente")
                    update_job_status(job, result)
        else:

            # Registra o Final da execucao.
            if not check_jobs_wait_to_run(astrometry_run):
                # Se todos os objetos ja foram executados finaliza o processo.
                finish_astrometry_run(astrometry_run.pk)


def check_jobs_wait_to_run(astrometry_run):
    # Verificar se nao tem nenhum objeto esperando para ser executado.
    a = astrometry_run.asteroids.filter(
        status__in=['pending', 'running', 'idle'])

    if a.count() > 0:
        return True
    else:
        return False
