import json
import logging
import os
import traceback
from datetime import datetime, timezone, timedelta

import humanize

from praia.models import (AstrometryAsteroid, AstrometryInput, AstrometryJob,
                          AstrometryOutput, Run)
from tno.condor import check_condor_job, check_job_history, remove_job, get_job_by_id


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
            astrometry = results.get('astrometry')
            if not astrometry.get('file_size') > 0 and asteroid.status != 'failure':
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

            # Header Extraction
            output = results.get('header_extraction')
            update_create_astrometry_output(
                asteroid, 'header_extraction', output.get('filename'), output.get(
                    'file_size'), output.get('extension')
            )

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
                "Registered outputs [ %s ] for [ %s ] CCDs" % (count, len(ccd)))

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

                # Execution Time for Praia Astrometry
                etime = results.get(
                    'praia_astrometry').get('execution_time', 0)
                asteroid.execution_astrometry = timedelta(
                    seconds=etime)

                # Execution Time for Praia Targets
                etime = results.get(
                    'praia_targets').get('execution_time', 0)
                asteroid.execution_targets = timedelta(
                    seconds=etime)

                # Execution Time for Plots
                etime = results.get(
                    'plots').get('execution_time', 0)
                asteroid.execution_plots = timedelta(
                    seconds=etime)

            except Exception as e:
                logger.warning("Failed to register execution times. %s" % e)

            try:
                # Adicionar ao tempo de execucao total do asteroid o tempo do condor Job
                asteroid.execution_time += asteroid.condor_job.execution_time
            except Exception as e:
                logger.warning(
                    "Failed to register condor job execution time. %s" % e)

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
    logger = logging.getLogger("astrometry")

    runs = Run.objects.filter(status='running', step=3)

    logger.debug("Astrometry Runs: %s" % runs)

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

                # result = check_condor_job(job.clusterid, job.procid)
                # logger.debug(result)
                # if result is None:
                #     # Busca informacao do job no history do condor
                #     jobHistory = check_job_history(job.clusterid, job.procid)

                #     update_job_status(job, jobHistory)
                # else:
                #     if int(result['JobStatus']) != int(job.job_status):
                #         update_job_status(job, result)
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


# def get_jobs_in_hold(astrometry_run):
#     return astrometry_run.condor_jobs.filter(job_status=5)
