#!/usr/bin/env python3

import argparse
import os
from datetime import datetime, timezone

from sqlalchemy import engine

from library import (
    get_logger,
    read_inputs,
    retrieve_asteroids,
    retrieve_ccds_by_asteroid,
    retrieve_bsp_by_asteroid,
    theoretical_positions,
    observed_positions,
    ingest_observations,
    write_asteroid_data,
    write_job_file
)
from dao import AsteroidDao, AstrometryJobDao
import time
import traceback
import parsl
# from config import htex_config, condor_config
from config import htex_config, DES_CATALOGS_BASEPATH
import pathlib
import json
import humanize

parser = argparse.ArgumentParser()
parser.add_argument("jobid", help="Job ID")
parser.add_argument("path", help="Job Path")
args = parser.parse_args()

# Asteroid Name
jobid = int(args.jobid)

# Paths de execução
original_path = os.getcwd()
current_path = args.path

# Start Running Time
t0 = datetime.now(tz=timezone.utc)

# Create a Log file
log = get_logger(current_path)
log.info("--------------< DES Object Identifier >--------------")
log.info("Job ID: [%s]" % jobid)
log.info("Current Path: [%s]" % current_path)

# Altera o path de execução
# A raiz agora é o path passado como parametro.
os.chdir(current_path)

# Read Inputs from job.json
job = read_inputs(current_path, 'job.json')

job.update({
    'status': 'Running',
    'start': t0.isoformat()
})

log.info("Update Job status to running.")
write_job_file(current_path, job)

try:
    # log.debug("Job Inputs: %s" % json.dumps(job))

    # Setting Inputs
    BSP_PLANETARY = job['bsp_planetary']['absolute_path']
    log.info("BSP_PLANETARY: [%s]" % BSP_PLANETARY)

    LEAP_SECOND = job['leap_seconds']['absolute_path']
    log.info("LEAP_SECOND: [%s]" % LEAP_SECOND)

    DES_START_PERIOD = job['period'][0]
    log.info("DES_START_PERIOD: [%s]" % DES_START_PERIOD)

    DES_FINISH_PERIOD = job['period'][1]
    log.info("DES_FINISH_PERIOD: [%s]" % DES_FINISH_PERIOD)

    # Location of observatory: [longitude, latitude, elevation]
    OBSERVATORY_LOCATION = job['observatory_location']
    log.info("OBSERVATORY_LOCATION: %s" % OBSERVATORY_LOCATION)

    MATCH_RADIUS = job['match_radius']
    log.info("MATCH_RADIUS: [%s]" % MATCH_RADIUS)

    log.info("Parsl Load started")
    # Load Parsl Configs
    parsl.clear()

    htex_config.run_dir = os.path.join(current_path, "runinfo")
    # Htcondor config with full nodes
    htex_config.executors[0].provider.channel.script_dir = os.path.join(current_path, "script_dir")
    # Htcondor config with Limited nodes
    htex_config.executors[1].provider.channel.script_dir = os.path.join(current_path, "script_dir")
    
    # Adicionar o ID do processo ao arquivo de submissão do condor
    htex_config.executors[0].provider.scheduler_options += '+AppId = {}\n'.format(jobid)
    htex_config.executors[1].provider.scheduler_options += '+AppId = {}\n'.format(jobid)


    parsl.load(htex_config)

    log.info("Parsl Load finished")

    # Retrieve Asteroids.
    log.info("Retriving Asteroids started")

    step_t0 = datetime.now(tz=timezone.utc)

    asteroids = retrieve_asteroids(
        job['filter_type'],
        job['filter_value']
    ).result()

    # asteroids = asteroids[0:120]

    job.update({'count_asteroids': len(asteroids)})

    step_t1 = datetime.now(tz=timezone.utc)
    step_tdelta = step_t1 - step_t0

    # Update Job time profile
    job['time_profile'].append(dict({
        'step': 'retrieve_asteroids',
        'start': step_t0.isoformat(),
        'end': step_t1.isoformat(),
        'exec_time': step_tdelta.total_seconds()
    }))

    job['processed_asteroids'] = len(asteroids)

    log.info("Asteroids Count: %s" % job['processed_asteroids'])

    log.info("Retriving Asteroids Finished in %s" % humanize.naturaldelta(step_tdelta, minimum_unit='microseconds'))

    # Retrieve CCDs
    log.info("Retriving CCDs started")

    step_t0 = datetime.now(tz=timezone.utc)

    count_ccds = 0
    i = 0
    for asteroid in asteroids:
        if asteroid['status'] != 'failure':

            result = retrieve_ccds_by_asteroid(asteroid, LEAP_SECOND).result()

            count_ccds += len(result['ccds'])

            if len(result['ccds']) == 0:
                asteroid.update({'status': 'failure', 'ccds': []})
                # TODO: Se o asteroid falhou deve ser escrito no diretório o json e removido do array asteroids            
            else:
                asteroid.update({'ccds': result['ccds']})

            log.debug("Asteroid: [%s] CCDs: [%s]" % (asteroid['name'], len(asteroid['ccds'])))

        i += 1
        
        log.debug("Query CCDs: %s/%s" % (i, len(asteroids)))
   
    job.update({'count_ccds': count_ccds})

    step_t1 = datetime.now(tz=timezone.utc)
    step_tdelta = step_t1 - step_t0

    # Update Job time profile
    job['time_profile'].append(dict({
        'step': 'retrieve_ccds',
        'start': step_t0.isoformat(),
        'end': step_t1.isoformat(),
        'exec_time': step_tdelta.total_seconds()
    }))

    log.info("CCDs Count: %s" % count_ccds)
    log.info("Retriving CCDs Finished in %s" % humanize.naturaldelta(step_tdelta, minimum_unit='microseconds'))
        
    # Retrieve BSPs
    # Etapa sequencial
    log.info("Retriving BSP JPL started")

    step_t0 = datetime.now(tz=timezone.utc)

    for asteroid in asteroids:
        # TODO: Verificar antes de baixar se o arquivo já existe
        bsp = retrieve_bsp_by_asteroid(
            name=asteroid['name'],
            initial_date=DES_START_PERIOD,
            final_date=DES_FINISH_PERIOD,
            job_path=current_path
        ).result()

        # Criar o diretório para o asteroid.
        asteroid_path = pathlib.Path.joinpath(
            pathlib.Path(current_path), asteroid['name'].replace(' ', '_'))

        asteroid.update({
            'bsp_jpl': bsp,
            'path': str(asteroid_path.absolute())
        })

        log.debug("[%s] BSP: [%s]" % (asteroid['name'], bsp))

        if bsp['status'] == 'failure':
            asteroid.update({'status': 'failure'})
            # TODO: Se o asteroid falhou deve ser escrito no diretório o json e removido do array asteroids


    step_t1 = datetime.now(tz=timezone.utc)
    step_tdelta = step_t1 - step_t0

    # Update Job time profile
    job['time_profile'].append(dict({
        'step': 'retrieve_bsp',
        'start': step_t0.isoformat(),
        'end': step_t1.isoformat(),
        'exec_time': step_tdelta.total_seconds()
    }))

    log.info("Retriving BSP JPL Finished %s" % humanize.naturaldelta(step_tdelta, minimum_unit='microseconds'))

    # Calculando as posições teoricas
    log.info("Calculating theoretical positions started")

    step_t0 = datetime.now(tz=timezone.utc)

    futures = list()
    for asteroid in asteroids:
        if asteroid['status'] != 'failure':
            futures.append(theoretical_positions(
                asteroid, BSP_PLANETARY, LEAP_SECOND, OBSERVATORY_LOCATION))


    # Monitoramento parcial das tasks
    is_done = list()
    while is_done.count(True) != len(futures):
        is_done = list()
        for f in futures:
            is_done.append(f.done())
        log.debug("Theoretical Positions running: %s/%s" % (is_done.count(True), len(futures)))
        time.sleep(1)

    # asteroids = [i.result() for i in futures]
    asteroids = list()
    for task in futures:
        asteroid = task.result()

        if asteroid['status'] == 'failure':
            pass
            # TODO: Se o asteroid falhou deve ser escrito no diretório o json e removido do array asteroids                
        else:
            asteroids.append(asteroid)

    log.info("Calculating theoretical positions Finished %s" % humanize.naturaldelta(step_tdelta, minimum_unit='microseconds'))

    step_t1 = datetime.now(tz=timezone.utc)
    step_tdelta = step_t1 - step_t0

    # Update Job time profile
    job['time_profile'].append(dict({
        'step': 'theoretical_positions',
        'start': step_t0.isoformat(),
        'end': step_t1.isoformat(),
        'exec_time': step_tdelta.total_seconds()
    }))

    # Calculando as posições teoricas
    log.info("Calculating observed positions started")

    step_t0 = datetime.now(tz=timezone.utc)

    futures = list()
    for asteroid in asteroids:
        if asteroid['status'] != 'failure':
            idx = 0
            for ccd in asteroid['ccds']:
                if ccd['theoretical_coordinates'] is not None:
                    # Monta o path para os catalogos
                    ccd['path'] = os.path.join(DES_CATALOGS_BASEPATH, ccd['path'])

                    # TODO: Path hardcoded remover para rodar no ambiente.
                    #ccd['path'] = '/archive/ccd_images/Eris'

                    futures.append(observed_positions(
                        idx=idx,
                        name=asteroid['name'],
                        asteroid_id=asteroid['id'],
                        ccd=ccd,
                        asteroid_path=asteroid['path'],
                        radius=MATCH_RADIUS,
                    ))
                    idx += 1

    # Monitoramento parcial das tasks
    is_done = list()
    while is_done.count(True) != len(futures):
        is_done = list()
        for f in futures:
            is_done.append(f.done())
        log.debug("Observed Positions running: %s/%s" % (is_done.count(True), len(futures)))
        time.sleep(1)

    results = dict({})
    for task in futures:
        asteroid_name, ccd, obs_coordinates = task.result()

        alias = asteroid_name.replace(' ', '_')
        if alias not in results:
            results[alias] = dict({'ccds': list(), 'observations': list()})

        results[alias]['ccds'].append(ccd)
        if obs_coordinates is not None:
            results[alias]['observations'].append(obs_coordinates)

    # Agrupar os resultados.
    count_observations = 0
    for asteroid in asteroids:
        alias = asteroid_name.replace(' ', '_')
        asteroid.update({
            'ccds': results[alias]['ccds'],
            'observations': results[alias]['observations'],
            'observations_count': len(results[alias]['observations'])
        })
        count_observations += asteroid['observations_count']

    # log.debug(asteroids[0])

    job.update({'count_observations': count_observations})

    step_t1 = datetime.now(tz=timezone.utc)
    step_tdelta = step_t1 - step_t0

    # Update Job time profile
    job['time_profile'].append(dict({
        'step': 'observed_positions',
        'start': step_t0.isoformat(),
        'end': step_t1.isoformat(),
        'exec_time': step_tdelta.total_seconds()
    }))

    log.info("Observations Count: %s" % count_observations)
    log.info("Calculating observed positions Finished %s" % humanize.naturaldelta(step_tdelta, minimum_unit='microseconds'))


    # Ingere as posições observadas no banco de dados
    # ETAPA SEQUENCIAL!
    log.info("Ingest the observations into the database started")

    step_t0 = datetime.now(tz=timezone.utc)

    ingested_obs = 0
    for asteroid in asteroids:
        alias = asteroid_name.replace(' ', '_')
        observations = results[alias]['observations']

        if len(observations) > 0:
            count = ingest_observations(observations).result()
            ingested_obs += count

    step_t1 = datetime.now(tz=timezone.utc)
    step_tdelta = step_t1 - step_t0

    # Update Job time profile
    job['time_profile'].append(dict({
        'step': 'ingest_observations',
        'start': step_t0.isoformat(),
        'end': step_t1.isoformat(),
        'exec_time': step_tdelta.total_seconds()
    }))

    log.info("Observations Ingested: %s" % ingested_obs)
    log.info("Ingest the observations into the database Finished %s" % humanize.naturaldelta(step_tdelta, minimum_unit='microseconds'))


    log.info("Write Asteroid Data in json started")
    futures = list()
    for asteroid in asteroids:
        asteroid.update({'status': 'completed'})
        futures.append(write_asteroid_data(asteroid))

    asteroids = [i.result() for i in futures]

    log.info("Write Asteroid Data in json Finish %s" % humanize.naturaldelta(step_tdelta, minimum_unit='microseconds'))

    # Status 3 = Completed
    job.update({'status': 'Completed'})


except Exception as e:
    trace = traceback.format_exc()
    log.error(trace)
    log.error(e)

    # Status 4 = Failed
    job.update({
        'status': 'Failed',
        'error': str(e),
        'traceback': str(trace),
    })

finally:
    parsl.clear()

    t1 = datetime.now(tz=timezone.utc)
    tdelta = t1 - t0

    job.update({
        'end': t1.isoformat(),
        'exec_time': tdelta.total_seconds()
    })

    log.info("Update Job status.")
    write_job_file(current_path, job)

    # Altera o path de execução para o path original
    os.chdir(original_path)

    log.info("Execution Time: %s" % tdelta)
    log.info("Identification of DES object is done!.")

