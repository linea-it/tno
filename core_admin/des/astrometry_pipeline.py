from des.models.astrometry_job import AstrometryJob
import gzip
import json
import logging
import os
import pickle
import shutil
import traceback
from datetime import datetime, timedelta, timezone

import humanize
import numpy as np
import pandas as pd
import parsl
import spiceypy as spice
from astropy.coordinates import GCRS, EarthLocation
from astropy.time import Time
from common.jpl import findSPKID, get_bsp_from_jpl
from django.conf import settings
from tno.dao.asteroids import AsteroidDao
from tno.models import BspPlanetary, LeapSecond

# from des.astrometry_parsl_apps import increment, proccess_ccd
# from astrometry_parsl_pipeline import run_parsl

from des.dao.skybot_position import DesSkybotPositionDao


import humanize
import pandas as pd
from io import StringIO
from des.models import Observation
from des.dao.observation import DesObservationDao

import time


class NoRecordsFound(Exception):
    pass


class DesAstrometryPipeline():

    result = dict({
        'status': None,
        'submit_time': None,
        'start': None,
        'end': None,
        'exec_time': None,
        'path': None,
        'bsp_planetary': None,
        'leap_seconds': None,
        'period': [],
        'observatory_location': [],
        'match_radius': 0,
        'expected_asteroids': 0,
        'processed_asteroids': 0,
        'filter_type': None,
        'filter_value': None,
        'time_profile': list(),
        'traceback': None,
        'error': None,
    })

    job_path = None

    time_profile = list()

    asteroids = dict()

    DES_START_PERIOD = '2012-11-01'

    DES_FINISH_PERIOD = '2019-02-01'

    # Location of observatory: [longitude, latitude, elevation] Cerro tololo
    OBSERVATORY_LOCATION = [+289.193583333, -30.16958333, 2202.7]

    BSP_PLANETARY = None

    LEAP_SECOND = None

    MATCH_RADIUS = 2

    def __init__(self, debug=False):
        self.log = logging.getLogger("des_astrometry")

        # Diretorio onde ficam os processos de DES Astrometry
        self.base_path = settings.DES_ASTROMETRY_OUTPUT

        self.debug = bool(debug)

    def run(self, job_id):
        self.log.info("-".ljust(52, '-'))
        self.log.info("Start DES Astrometry Pipeline")

        self.job_id = int(job_id)
        self.log.info("Job ID: %s" % self.job_id)

        # Se o mode debug estiver ligado executa o metodo que permite repetir um job
        if self.debug:
            self.prepare_override_run()

        t0 = datetime.now(timezone.utc)

        self.result['status'] = 'running'
        self.result['start'] = t0.isoformat()

        try:
            os.umask(2)

            # Criar um diretório para o Job
            self.job_path = self.create_job_path(self.job_id)

            # Inicia o time profile
            self.setup_time_profile()

            # TODO: Mover para uma etapa diferente.
            # # Atualizar a tabela de asteroids
            # if self.debug is False:
            #     self.update_asteroid_table()

            # BSP Planetary
            # TODO: Receber como paramatro
            self.BSP_PLANETARY = self.get_bsp_planetary('de435')

            # Leap Second
            # TODO: Receber como paramatro
            self.LEAP_SECOND = self.get_leap_second('naif0012')

            # Aplicar o filtro na tabela de asteroids
            l_asteroids = self.retrive_asteroids(asteroid_name='Eris')

            if self.debug is True:
                for asteroid in l_asteroids:
                    self.clear_observations_by_asteroid(asteroid['id'])

            # Cria um estrutura organizada pelo nome do asteroid,
            # nela serão adicionadas as informações sobre cada asteroid.
            for asteroid in l_asteroids:

                # Para cada asteroid criar um diretório dentro do diretório do Job
                asteroid_path = self.get_or_create_asteroid_path(
                    asteroid['name'])

                self.asteroids[asteroid['name']] = dict({
                    'id': asteroid['id'],
                    'status': None,
                    'name': asteroid['name'],
                    'number': asteroid['number'],
                    'spkid': None,
                    'alias': asteroid['name'].replace(' ', '_'),
                    'path': asteroid_path,
                    'observatory_location': self.OBSERVATORY_LOCATION,
                    'ccds_count': 0,
                    'observations_count': 0,
                    'bsp_planetary': self.BSP_PLANETARY,
                    'leap_second': self.LEAP_SECOND,
                    'bsp_jpl': None,
                    'ccds': list(),
                    'observations': list(),
                    'time_profile': list(),
                    'exec_time': 0,
                })

            parsl_tasks = list()

            # Estas etapas não são paralelizadas!
            for asteroid_name in self.asteroids:
                # Apartir daqui o dict asteroid não está relacionado com o a lista self.asteroids
                # os dados desde dict serão armazenados em um pickle no diretório do asteroid.
                asteroid = self.asteroids[asteroid_name].copy()

                # Para cada asteroid recuperar a lista de ccds para cada posição
                asteroid = self.retrieve_asteroid_ccds(asteroid)

                # Se o Asteroid falhou ou não tem ccds
                # ignora o resto das operações e passa para o proximo asteroid.
                if asteroid['status'] == 'failure':
                    continue

                # Para cada asteroid Baixar os arquivos BSP do JPL
                asteroid = self.retrieve_asteroid_bsp(asteroid)

                # Recuperar o SPK Id do objeto a partir do seu BSP
                asteroid['spkid'] = findSPKID(
                    asteroid['bsp_jpl']['file_path'])
                self.log.debug("SpkID: [%s]" % asteroid['spkid'])

                # Calcula as posições Teoricas para cada ccd do Asteroid.
                asteroid = self.retrieve_theoretical_positions(asteroid)

                # Se o Asteroid falhou no calculo das posições teoricas
                # ignora o resto das operações e passa para o proximo asteroid.
                if asteroid['status'] == 'failure':
                    continue

                # Cria uma Lista de Task que seram executadas em paralelo pelo Parsl
                for ccd in asteroid['ccds']:

                    # TODO: path para os CCD só para debug
                    if self.debug is True:
                        ccd['path'] = '/archive/ccd_images/Eris'

                    task = dict({
                        'name': asteroid['name'],
                        'ccd': ccd,
                        'path': asteroid['path']
                    })
                    parsl_tasks.append(task)

                self.asteroids[asteroid_name] = asteroid
                del asteroid

            self.log.info("Antes de executar o parsl.")
            results = run_parsl(parsl_tasks, self.job_path)
            self.log.info("Depois de executar o parsl.")

            self.log.info("Results: [%s]." % len(results))
            self.log.info(results)

            # # Inicio da Etapa paralelizada com Parsl.
            # self.log.info("Configuring Parsl.")
            # parsl.clear()

            # # Parametros de configuração do Parsl a partir do settings
            # htex_config = settings.PARSL_CONFIG
            # # Altera o diretório de execução do parsl.
            # htex_config.run_dir = os.path.join(self.job_path, "runinfo")
            # # Carrega as configurações do Parsl.
            # parsl.load(htex_config)

            # # Espera as tasks terminarem de ser executadas
            # self.log.info(
            #     "Submitting the tasks to Parsl. The tasks will now run in parallel.")

            # futures = list()
            # for task in parsl_tasks:
            #     futures.append(proccess_ccd(
            #         task['name'], task['ccd'], task['path']))

            # # Monitoramento parcial das tasks
            # is_done = list()
            # while is_done.count(True) != len(futures):
            #     is_done = list()
            #     for f in futures:
            #         is_done.append(f.done())
            #     self.log.debug("%s/%s" % (is_done.count(True), len(futures)))
            #     time.sleep(1)

            # # TODO: Talvez essa parte da consolidação possa ser paralelizada.
            # # Um dict indexado pelo nome do Asteroid que vai guardar os resultados por ccds
            # temp_results = dict({})

            # self.log.info("Generating list of all observations.")
            # # Lista com TODAS as posições observadas independente do asteroid e ccd.
            # observed_postions = list()

            # # Espera o Resultado de todos os jobs.
            # for task in futures:
            #     asteroid_name, ccd, obs_coordinates, mtp_time_profile = task.result()

            #     if asteroid_name not in temp_results:
            #         temp_results[asteroid_name] = dict()

            #     temp_results[asteroid_name][ccd['id']] = ccd

            #     if obs_coordinates is not None:
            #         # Adiciona o id do asteroid a cada observação, necessário para o preenchimento da tabela de observações.
            #         obs_coordinates.update(
            #             {'asteroid_id': self.asteroids[asteroid_name]['id']})

            #         # Adiciona a observação a lista com todas as observações de todos os asteroids.
            #         observed_postions.append(obs_coordinates)

            #         # Adiciona a posição observada na variavel self.asteroid
            #         self.asteroids[asteroid_name]['observations'].append(
            #             obs_coordinates)
            #         # Adicionao time profile do match position desta task ao time profile do asteroid.
            #         self.asteroids[asteroid_name]['time_profile'].append(
            #             mtp_time_profile)

            #         # TODO: Adicionar um contador de ccds com falhas.
            #     task.done()

            # parsl.clear()

            # self.log.info("End of parallel tasks.")

            # Etapa de Consolidação volta a ser sequencial.

            # TODO: Tratar/Filtrar a lista de observações

            # TODO: Ingerir na tabela de posições observadas.
            # self.ingest_observations(observed_postions)

            # # Guardar no diretório de cada Asteroid o dict completo com dados para debug.
            # for asteroid_name in self.asteroids:
            #     asteroid = self.asteroids[asteroid_name]

            #     # Para cada ccd do asteroid procura no resultado temporario
            #     for ccd in asteroid['ccds']:
            #         if ccd['id'] in temp_results[asteroid_name]:

            #             # Atualiza os dados de ccd do asteroid com os retornados pela função proccess_ccd.
            #             result_ccd = temp_results[asteroid_name][ccd['id']]
            #             ccd.update(result_ccd)

            #     exec_time = 0
            #     # TODO: Criar uma função que calcule o tempo de execução individual por asteroid
            #     # deve pegar a menor start e a maior end da etapa match_position e fazer a diferença.
            #     # a_start_match = list()
            #     # for tp in asteroid['time_profile']:
            #     #     exec_time += tp['exec_time']

            #     # Retira da variavel temp_result os dados deste asteroid.
            #     del temp_results[asteroid_name]

            #     # self.log.debug(asteroid)
            #     # TODO: Definir regra para avaliar se o asteroid deu sucesso ou falhou.
            #     asteroid.update({
            #         'status': 'done',
            #         'exec_time': exec_time,
            #         'h_exec_time': humanize.naturaldelta(timedelta(seconds=exec_time), minimum_unit='microseconds'),
            #         'observations_count': len(asteroid['observations'])
            #     })

            #     # Escreve no diretório do asteroid um arquivo json compactado
            #     # com os todas as informações utilizadas no processamento.
            #     zipfilepath = os.path.join(
            #         asteroid['path'], asteroid['alias'] + '.json.gz')
            #     with gzip.open(zipfilepath, 'wt', encoding='UTF-8') as zipfile:
            #         json.dump(asteroid, zipfile)

            self.result['status'] = 'done'

        except Exception as e:
            self.on_error(e)

        finally:
            parsl.clear()
            t1 = datetime.now(timezone.utc)
            tdelta = t1 - t0

            self.result['end'] = t1.isoformat()
            self.result['exec_time'] = tdelta.total_seconds()

            self.log.info("DES Astrometry has %s in %s" %
                          (self.result['status'], self.natural_delta(tdelta)))

            # Escreve no diretório do Job um arquivo Json com o conteudo da variavel result.
            with open(os.path.join(self.job_path, 'job_result.json'), 'w') as fp:
                json.dump(self.result, fp)

            # Apenas para Debug
            self.log.debug(json.dumps(self.result, indent=2))

    def ingest_observations(self, observations):
        self.log.info("Ingest the observations into the database.")

        t0 = datetime.now(timezone.utc)

        tp = dict({
            'start': t0.isoformat(),
            'end': None,
            'exec_time': None,
            'rows': 0
        })

        try:
            self.log.info("Creating a pandas dataframe.")
            df_obs = pd.DataFrame(observations, columns=[
                'name', 'date_obs', 'date_jd', 'ra', 'dec', 'offset_ra',
                'offset_dec', 'mag_psf', 'mag_psf_err', 'asteroid_id', 'ccd_id'])

            self.log.debug(df_obs.head())

            # TODO: Tratar os dados se necessário

            self.log.info("Converting the pandas dataframe to csv")
            data = StringIO()
            df_obs.to_csv(
                data,
                sep="|",
                header=True,
                index=False,
            )
            data.seek(0)

            self.log.info("Executing the import function on the database.")
            tablename = Observation.objects.model._meta.db_table
            self.log.debug("Tablename: %s" % tablename)

            # Sql Copy com todas as colunas que vão ser importadas e o formato do csv.
            sql = "COPY %s (name, date_obs, date_jd, ra, dec, offset_ra, offset_dec, mag_psf, mag_psf_err, asteroid_id, ccd_id) FROM STDIN with (FORMAT CSV, DELIMITER '|', HEADER);" % tablename
            self.log.debug("SQL: [ %s ]" % sql)

            rowcount = DesObservationDao().import_with_copy_expert(sql, data)

            self.log.info(
                "The observations were successfully imported.")
            self.log.info(
                "Total observations ingested in the database: %s" % rowcount)

            tp['rows'] = rowcount

        except Exception as e:
            raise Exception(
                "Failed to import observations data. Error: [%s]" % e)

        finally:
            t1 = datetime.now(timezone.utc)
            tdelta = t1 - t0

            tp['end'] = t1.isoformat()
            tp['exec_time'] = tdelta.total_seconds()

            self.result['ingest_observations'] = tp

    def retrieve_theoretical_positions(self, asteroid):
        self.log.info("Calculating theoretical positions for the asteroid.")

        t0 = datetime.now(timezone.utc)

        tp = dict({
            'stage': 'theoretical_positions',
            'start': t0.isoformat(),
            'end': None,
            'exec_time': None,
        })

        try:
            ccds = self.compute_theoretical_positions(
                asteroid['spkid'],
                asteroid['ccds'],
                asteroid['bsp_jpl']['file_path'],
                asteroid['bsp_planetary']['relative_path'],
                asteroid['leap_second']['relative_path'],
                asteroid['observatory_location']
            )

            asteroid['ccds'] = ccds

        except Exception as e:
            msg = "Failed on calculate theoretical positions. %s" % e

            asteroid['error'] = msg
            asteroid['status'] = 'failure'

        finally:
            t1 = datetime.now(timezone.utc)
            tdelta = t1 - t0

            tp['end'] = t1.isoformat()
            tp['exec_time'] = tdelta.total_seconds()

            asteroid['time_profile'].append(tp)

            return asteroid

    def compute_theoretical_positions(self, spk, ccds, bsp, dexxx, leap_second, location):
        # TODO: Provavelmente esta etapa é que causa a lentidão desta operação
        # Por que carrega o arquivo de ephemeris planetarias que é pesado
        # Load the asteroid and planetary ephemeris and the leap second (in order)
        spice.furnsh(dexxx)
        spice.furnsh(leap_second)
        spice.furnsh(bsp)

        for ccd in ccds:
            date_jd = ccd['date_jd']

            # Convert dates from JD to et format. "JD" is added due to spice requirement
            date_et = spice.utc2et(str(date_jd) + " JD UTC")

            # Compute geocentric positions (x,y,z) in km for each date with light time correction
            r_geo, lt_ast = spice.spkpos(spk, date_et, 'J2000', 'LT', '399')

            lon, lat, ele = location
            l_ra, l_dec = [], []

            # Convert from geocentric to topocentric coordinates
            r_topo = r_geo - self.geoTopoVector(lon, lat, ele, float(date_jd))

            # Convert rectangular coordinates (x,y,z) to range, right ascension, and declination.
            d, rarad, decrad = spice.recrad(r_topo)

            # Transform RA and Decl. from radians to degrees.
            ra = np.degrees(rarad)
            dec = np.degrees(decrad)

            ccd.update({
                'date_et': date_et,
                'geocentric_positions': list(r_geo),
                'topocentric_positions': list(r_topo),
                'theoretical_coordinates': [ra, dec]
            })

        spice.kclear()

        return ccds

    def geoTopoVector(self, longitude, latitude, elevation, jd):
        '''
        Transformation from [longitude, latitude, elevation] to [x,y,z]
        '''

        loc = EarthLocation(longitude, latitude, elevation)

        time = Time(jd, scale='utc', format='jd')
        itrs = loc.get_itrs(obstime=time)
        gcrs = itrs.transform_to(GCRS(obstime=time))

        r = gcrs.cartesian

        # convert from m to km
        x = r.x.value/1000.0
        y = r.y.value/1000.0
        z = r.z.value/1000.0

        return np.array([x, y, z])

    def retrieve_asteroid_bsp(self, asteroid):
        self.log.info("Retriving BSP for Asteroid [%s]" % asteroid['name'])

        t0 = datetime.now(timezone.utc)

        asteroid.update({
            'bsp_jpl': None
        })

        tp = dict({
            'stage': 'retrieve_bsp_jpl',
            'start': t0.isoformat(),
            'end': None,
            'exec_time': None,
        })

        try:
            bsp_file_path = get_bsp_from_jpl(
                identifier=asteroid['name'],
                initial_date=self.DES_START_PERIOD,
                final_date=self.DES_FINISH_PERIOD,
                email='glauber.vila.verde@gmail.com',
                directory=asteroid['path']
            )

            asteroid['bsp_jpl'] = dict({
                'file_name': os.path.basename(bsp_file_path),
                'file_path': str(bsp_file_path),
                'file_size': os.path.getsize(bsp_file_path)
            })

        except Exception as e:
            msg = "Failed on retrive asteroids BSP from JPL. %s" % e

            asteroid['bsp_jpl'] = None
            asteroid['error'] = msg
            asteroid['status'] = 'failure'

        finally:
            t1 = datetime.now(timezone.utc)
            tdelta = t1 - t0

            tp['end'] = t1.isoformat()
            tp['exec_time'] = tdelta.total_seconds()

            asteroid['time_profile'].append(tp)

            return asteroid

    def retrieve_asteroid_ccds(self, asteroid):
        self.log.info("Retriving CCDs for Asteroid [%s]" % asteroid['name'])

        t0 = datetime.now(timezone.utc)

        asteroid.update({
            'status': 'running',
        })

        tp = dict({
            'stage': 'retrieve_ccds',
            'start': t0.isoformat(),
            'end': None,
            'exec_time': None,
        })

        dao = DesSkybotPositionDao()

        try:
            # Faz a query na tabela des skybot positions com join na des ccds.
            records = dao.ccds_by_asteroid(asteroid['name'])

            # Se não encontrar ccd para este asteroid é uma falha só para este asteroid.
            # Não impede que o processo continue.
            if len(records) == 0:
                raise Exception('No CCD found for this asteroid.')
            else:
                # Para cada ccds pega só os campos que importa
                # e adiciona ao dict do asteroid
                for ccd in records:
                    path = os.path.join(
                        settings.DES_CCD_CATALOGS_DIR, ccd['path'].replace('OPS', ''))

                    asteroid['ccds'].append(dict({
                        'id': ccd['id'],
                        'date_obs': str(ccd['date_obs']),
                        'date_jd': self.date_to_jd(ccd['date_obs'], ccd['exptime'], self.LEAP_SECOND['relative_path']),
                        'exptime': ccd['exptime'],
                        'path': path,
                        'filename': ccd['filename'],
                    }))
                    self.log.debug("CCD Path: %s" % path)

                asteroid['ccds_count'] = len(records)

        except Exception as e:
            msg = "Failed on retrive asteroids ccds. %s" % e

            asteroid['ccds_count'] = 0
            asteroid['error'] = msg
            asteroid['status'] = 'failure'

        finally:
            t1 = datetime.now(timezone.utc)
            tdelta = t1 - t0

            tp['end'] = t1.isoformat()
            tp['exec_time'] = tdelta.total_seconds()

            asteroid['time_profile'].append(tp)

            return asteroid

    def retrive_asteroids(self, dynclass=None, asteroid_name=None, asteroids=list()):
        self.log.info("Retriving Asteroids started")

        t0 = datetime.now(timezone.utc)
        self.result['retrieve_asteroids']['start'] = t0.isoformat()

        try:
            records = list()

            if dynclass is not None:
                self.log.info(
                    "Getting all asteroids of the %s class." % dynclass)

                records = AsteroidDao().asteroids_by_base_dynclass(dynclass=dynclass)

            elif asteroid_name is not None:
                self.log.info(
                    "Getting Asteroid by name [%s] ." % asteroid_name)

                record = AsteroidDao().asteroids_by_name(name=asteroid_name)
                records.append(record)

            self.log.debug("Count Asteroids: [%s]" % len(records))
            if len(records) == 0:
                # Nenhum resultado encontrado, disparar uma excessão para finalizar a execução do processo.
                raise NoRecordsFound(
                    "No asteroid found for the selected filters.")

            self.log.debug(records)

            # Criar um dataframe com os asteroids
            df_asteroids = pd.DataFrame(
                records,
                columns=['id', 'name', 'number', 'base_dynclass', 'dynclass'],
            ).astype({
                'id': 'int64',
                'name': 'string',
                'number': 'string',
                'base_dynclass': 'string',
                'dynclass': 'string',
            })
            df_asteroids = df_asteroids.set_index('id')
            df_asteroids.number = df_asteroids.number.fillna('')

            # Criar um arquivo csv com as informações dos asteroids
            asteroids_csv = os.path.join(self.get_job_path(), 'asteroids.csv')
            df_asteroids.to_csv(asteroids_csv, sep=';',
                                header=True, index=True)

            self.result['asteroids_csv'] = asteroids_csv
            self.result['retrieve_asteroids']['records'] = len(records)
            self.result['retrieve_asteroids']['status'] = 'done'

            return records

        except NoRecordsFound as e:
            # falhou por não ter nenhum asteroid que atenda o filtro
            self.result['retrieve_asteroids']['records'] = 0
            self.result['retrieve_asteroids']['status'] = 'failed'
            raise Exception(e)

        except Exception as e:
            msg = "Failed on retrive asteroids. %s" % e

            self.result['retrieve_asteroids']['status'] = 'failed'

            raise Exception(msg)

        finally:
            t1 = datetime.now(timezone.utc)
            tdelta = t1 - t0

            self.result['retrieve_asteroids']['end'] = t1.isoformat()
            self.result['retrieve_asteroids']['exec_time'] = tdelta.total_seconds()

            # Time Profile
            self.add_time_profile(
                stage='retrieve_asteroids',
                status=self.result['retrieve_asteroids']['status'],
                start=t0,
                end=t1,
                persist=True
            )

            self.log.info("Retrive Asteroid has %s in %s" % (
                self.result['retrieve_asteroids']['status'], self.natural_delta(tdelta)))

    def update_asteroid_table(self):
        self.log.info("Update Asteroid Table started")

        t0 = datetime.now(timezone.utc)
        # self.result['update_asteroid_table']['start'] = t0.isoformat()

        tp = dict({
            'status': 'running',
            'start': t0.isoformat(),
            'end': None,
            'exec_time': None,
            'records_affected': 0
        })

        try:
            records_affected = AsteroidDao().insert_update()
            self.log.info("Affected Records: [%s]" % records_affected)

            tp['records_affected'] = records_affected
            tp['status'] = 'done'

        except Exception as e:
            msg = "Failed on update Asteroid Table. %e" % e

            tp['status'] = 'failed'

            raise Exception(msg)

        finally:
            t1 = datetime.now(timezone.utc)
            tdelta = t1 - t0

            tp['end'] = t1.isoformat()
            tp['exec_time'] = tdelta.total_seconds()

            self.log.info("Update Asteroid Table has %s in %s" % (
                tp['status'], self.natural_delta(tdelta)))

            self.result['update_asteroid_table'] = tp

            # Time Profile
            self.add_time_profile(
                stage='update_asteroid_table',
                status=self.result['update_asteroid_table']['status'],
                start=t0,
                end=t1,
                persist=True
            )

    def date_to_jd(self, date_obs, exptime, leap_second):
        """Aplica uma correção a data de observação e converte para data juliana

        Correção para os CCDs do DES:
            date = date_obs + 0.5 * (exptime + 1.05)

        Args:
            date_obs (datetime): Data de observação do CCD "date_obs"
            exptime (float): Tempo de exposição do CCD "exptime"
            lead_second (str): Path para o arquivo leap second a ser utilizado por exemplo: '/archive/lead_second/naif0012.tls'

        Returns:
            str: Data de observação corrigida e convertida para julian date.
        """
        # Calcula a correção
        correction = (exptime + 1.05)/2

        # Carrega o lead second na lib spicepy
        spice.furnsh(leap_second)

        # Converte a date time para JD
        date_et = spice.utc2et(str(date_obs).split('+')[0] + " UTC")
        date_jdutc = spice.et2utc(date_et, 'J', 14)

        # Remove a string JD retornada pela lib
        midtime = date_jdutc.replace('JD ', '')

        # Soma a correção
        jd = float(midtime) + correction/86400

        spice.kclear()

        return jd

    def get_bsp_planetary(self, name):

        record = BspPlanetary.objects.get(name=name)

        relative_path = os.path.join(settings.ARCHIVE_DIR, str(record.upload))

        absolute_path = os.path.join(
            settings.HOST_ARCHIVE_DIR, str(record.upload))

        return dict({
            'name': name,
            'filename': os.path.basename(relative_path),
            'absolute_path': absolute_path
        })

    def get_leap_second(self, name):

        record = LeapSecond.objects.get(name=name)

        relative_path = os.path.join(settings.ARCHIVE_DIR, str(record.upload))

        absolute_path = os.path.join(
            settings.HOST_ARCHIVE_DIR, str(record.upload))

        return dict({
            'name': name,
            'filename': os.path.basename(relative_path),
            'absolute_path': absolute_path
        })

    def natural_delta(self, tdelta):
        return humanize.naturaldelta(
            timedelta(seconds=tdelta.total_seconds()), minimum_unit="milliseconds")

    def get_job_path(self, job_id=None):
        """Retorna o path para o Job baseado em seu id.
        o diretório de um job é composto por base_path/des_astrometry_<job_id>

        Arguments:
            job_id {int} -- Id do Job que está sendo executado

        Returns:
            str -- Path onde o job está sendo executado.
        """
        if job_id is None:
            job_id = self.job_id

        output_path = os.path.join(
            self.base_path, "des_astrometry_%s" % str(job_id))

        return output_path

    def get_or_create_asteroid_path(self, asteroid_name):

        job_path = self.get_job_path()

        asteroid_folder = asteroid_name.replace(' ', '_')
        path = os.path.join(job_path, asteroid_folder)

        if not os.path.exists(path):
            os.mkdir(path)
            self.log.info(
                "A directory has been created for the Asteroid [%s]." % asteroid_name)

        return path

    def create_job_path(self, job_id):

        path = self.get_job_path(job_id)

        if not os.path.exists(path):
            os.mkdir(path)
            self.log.info("A directory has been created for the job.")

        return path

    def prepare_job(self, job_id):

        job = AstrometryJob.objects.get(pk=job_id)

        jobpath = self.create_job_path(job_id)

        job_info = self.result

        job_info.update({
            'status': job.status,
            'submit_time': job.start.isoformat(),
            'path': jobpath,
            'bsp_planetary': self.get_bsp_planetary('de435'),
            'leap_seconds': self.get_leap_second('naif0012'),
            'period': [self.DES_START_PERIOD, self.DES_FINISH_PERIOD],
            'observatory_location': self.OBSERVATORY_LOCATION,
            'match_radius': self.MATCH_RADIUS,
            'expected_asteroids': job.asteroids
        })

        if job.asteroids is not None and job.asteroids is not '':
            job_info.update({
                'filter_type': 'name',
                'filter_value': job.asteroids
            })
        else:
            job_info.update({
                'filter_type': 'dynclass',
                'filter_value': job.dynclass
            })

        with open(os.path.join(jobpath, 'job.json'), 'w') as f:
            json.dump(job_info, f)

        return jobpath

    def prepare_override_run(self):

        if not self.debug:
            return

        # Remove o diretório do Job
        job_path = self.get_job_path(self.job_id)
        if os.path.exists(job_path):
            shutil.rmtree(job_path)
            self.log.debug("Removed job path: %s" % job_path)

    def clear_observations_by_asteroid(self, asteroid_id):
        self.log.info(
            "Delete observations for Asteroid ID: [%s]." % asteroid_id)

        t0 = datetime.now(timezone.utc)

        tp = dict({
            'start': t0.isoformat(),
            'end': None,
            'exec_time': None,
            'rows': 0
        })

        try:
            dao = DesObservationDao()

            result = dao.delete_by_asteroid_id(asteroid_id)

            self.log.info(
                "Deleted observations for this asteroid. Rows[%s]" % result.rowcount)

        except Exception as e:
            raise Exception(
                "Failed to delete observations data. Error: [%s]" % e)

        finally:
            t1 = datetime.now(timezone.utc)
            tdelta = t1 - t0

            tp['end'] = t1.isoformat()
            tp['exec_time'] = tdelta.total_seconds()

    def setup_time_profile(self):

        # path para arquivo time profile csv
        time_profile_csv = os.path.join(self.job_path, 'time_profile.csv')
        self.result['time_profile'] = time_profile_csv

        # Criar um arquivo csv com as informações de time profile
        df = pd.DataFrame(
            columns=['stage', 'status', 'asteroid', 'start', 'end'])
        df.to_csv(time_profile_csv, sep=';', header=True, index=False)

        self.log.debug("Created Time Profile CSV: [%s]" % time_profile_csv)

    def add_time_profile(self, stage, status, start, end, asteroid=None, persist=True):

        self.time_profile.append({
            'stage': stage,
            'status': status,
            'asteroid': asteroid,
            'start': start,
            'end': end
        })

        if persist:
            self.persist_time_profile()

    def persist_time_profile(self):

        df = pd.DataFrame(self.time_profile, columns=[
            'stage', 'status', 'asteroid', 'start', 'end'])
        df.to_csv(self.result['time_profile'],
                  sep=';', header=True, index=False)

    def on_error(self, e=None):
        trace = traceback.format_exc()

        self.result['traceback'] = trace

        self.log.error(trace)

        if e is not None:
            self.result['error'] = str(e)

            self.log.error(e)

        self.result['status'] = 'failed'

        # TODO Gravar no banco de dados e finalizar o job
        # TODO Notificar o usuario.
