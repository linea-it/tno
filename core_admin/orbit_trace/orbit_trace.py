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
    write_asteroid_data
)
from dao import AsteroidDao
import time
import traceback
import parsl
# from config import htex_config, condor_config
from config import htex_config, DES_CATALOGS_BASEPATH
import pathlib
import json

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

job.update({'start': t0.isoformat()}),

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

    # Load Parsl Configs
    parsl.clear()
    htex_config.run_dir = os.path.join(current_path, "runinfo")
    parsl.load(htex_config)

    # Retrieve Asteroids.
    log.info("Retriving Asteroids started")

    step_t0 = datetime.now(tz=timezone.utc)

    asteroids = retrieve_asteroids(
        job['filter_type'],
        job['filter_value']
    ).result()

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

    log.info("Retriving Asteroids finished")

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

    step_t1 = datetime.now(tz=timezone.utc)
    step_tdelta = step_t1 - step_t0

    # Update Job time profile
    job['time_profile'].append(dict({
        'step': 'retrieve_bsp',
        'start': step_t0.isoformat(),
        'end': step_t1.isoformat(),
        'exec_time': step_tdelta.total_seconds()
    }))

    log.info("Retriving BSP JPL finished")

    # Retrieve CCDs
    log.info("Retriving CCDs started")

    step_t0 = datetime.now(tz=timezone.utc)

    futures = list()
    for asteroid in asteroids:
        futures.append(retrieve_ccds_by_asteroid(asteroid, LEAP_SECOND))

    asteroids = [i.result() for i in futures]

    step_t1 = datetime.now(tz=timezone.utc)
    step_tdelta = step_t1 - step_t0

    # Update Job time profile
    job['time_profile'].append(dict({
        'step': 'retrieve_ccds',
        'start': step_t0.isoformat(),
        'end': step_t1.isoformat(),
        'exec_time': step_tdelta.total_seconds()
    }))

    log.info("Retriving CCDs finished")

    # Calculando as posições teoricas
    log.info("Calculating theoretical positions started")

    step_t0 = datetime.now(tz=timezone.utc)

    futures = list()
    for asteroid in asteroids:
        futures.append(theoretical_positions(
            asteroid, BSP_PLANETARY, LEAP_SECOND, OBSERVATORY_LOCATION))

    asteroids = [i.result() for i in futures]

    log.info("Calculating theoretical positions finished")

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
        idx = 0
        for ccd in asteroid['ccds']:

            # Monta o path para os catalogos
            ccd['path'] = os.path.join(DES_CATALOGS_BASEPATH, ccd['path'])

            # TODO: Path hardcoded remover para rodar no ambiente.
            ccd['path'] = '/archive/ccd_images/Eris'

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
        log.debug("%s/%s" % (is_done.count(True), len(futures)))
        time.sleep(1)

    results = dict({})
    for task in futures:
        asteroid_name, ccd, obs_coordinates = task.result()

        if asteroid_name not in results:
            results[asteroid_name] = dict(
                {'ccds': list(), 'observations': list()})

        results[asteroid_name]['ccds'].append(ccd)
        if obs_coordinates is not None:
            results[asteroid_name]['observations'].append(obs_coordinates)

    # Agrupar os resultados.
    count = 0
    for asteroid in asteroids:
        asteroid.update({
            'ccds': results[asteroid['name']]['ccds'],
            'observations_count': len(results[asteroid['name']]['observations'])
        })
        count += asteroid['observations_count']

    step_t1 = datetime.now(tz=timezone.utc)
    step_tdelta = step_t1 - step_t0

    # Update Job time profile
    job['time_profile'].append(dict({
        'step': 'observed_positions',
        'start': step_t0.isoformat(),
        'end': step_t1.isoformat(),
        'exec_time': step_tdelta.total_seconds()
    }))

    log.info("Calculating observed positions finished")
    log.info("Observations Count: %s" % count)

    # Ingere as posições observadas no banco de dados
    # ETAPA SEQUENCIAL!
    log.info("Ingest the observations into the database started")

    step_t0 = datetime.now(tz=timezone.utc)

    ingested_obs = 0
    for asteroid in asteroids:
        observations = results[asteroid['name']]['observations']

        ingested_obs += ingest_observations(observations).result()

    step_t1 = datetime.now(tz=timezone.utc)
    step_tdelta = step_t1 - step_t0

    # Update Job time profile
    job['time_profile'].append(dict({
        'step': 'ingest_observations',
        'start': step_t0.isoformat(),
        'end': step_t1.isoformat(),
        'exec_time': step_tdelta.total_seconds()
    }))

    log.info("Ingest the observations into the database finished")
    log.info("Observations Ingested: %s" % ingested_obs)

    log.info("Write Asteroid Data in json started")
    futures = list()
    for asteroid in asteroids:
        filepath = os.path.join(
            asteroid['path'], '%s.json.gz' % asteroid['name'].replace(' ', '_'))
        futures.append(write_asteroid_data(filepath, asteroid))

    asteroids = [i.result() for i in futures]

    log.info("Write Asteroid Data in json finish")


except Exception as e:
    trace = traceback.format_exc()
    log.error(trace)
    log.error(e)

    # Status 4 = Failed
    job.update({
        'status': 4,
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

    with open(os.path.join(current_path, 'job.json'), 'w') as f:
        json.dump(job, f)

    # Altera o path de execução para o path original
    os.chdir(original_path)

    log.info("Identification of DES object is done!.")
    log.info("Execution Time: %s" % tdelta)
