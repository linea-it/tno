import json
import logging
import os
import shutil
import traceback
from datetime import datetime, timedelta, timezone

import humanize
import pandas as pd
from des.dao.skybot_position import DesSkybotPositionDao
from django.conf import settings
from tno.dao.asteroids import AsteroidDao


class NoRecordsFound(Exception):
    pass


class DesAstrometryPipeline():

    result = dict({
        'status': None,
        'start': None,
        'end': None,
        'exec_time': None,
        'error': None,
        'traceback': None,
        'update_asteroid_table': {
            'status': None,
            'start': None,
            'end': None,
            'exec_time': 0,
            'records_affected': 0
        },
        'retrieve_asteroids': {
            'status': None,
            'start': None,
            'end': None,
            'exec_time': 0,
            'records': 0
        },
        'retrieve_ccds': {
            'status': None,
            'start': None,
            'end': None,
            'exec_time': 0,
            'records': 0
        },
        'asteroids_csv': None,
        'time_profile': None
    })

    job_path = None

    time_profile = list()

    asteroids = dict()

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
            # Criar um diretório para o Job
            self.job_path = self.create_job_path(self.job_id)

            # Inicia o time profile
            self.setup_time_profile()

            # Atualizar a tabela de asteroids
            self.update_asteroid_table()

            # Aplicar o filtro na tabela de asteroids
            l_asteroids = self.retrive_asteroids(dynclass='MB')

            # Cria um estrutura organizada pelo nome do asteroid,
            # nela serão adicionadas as informações sobre cada asteroid.
            for asteroid in l_asteroids:
                self.asteroids[asteroid['name']] = dict({
                    'id': asteroid['id'],
                    'name': asteroid['name'],
                    'number': asteroid['number'],
                    'alias': asteroid['name'].replace(' ', '_'),
                    'status': None
                })

            # Para cada asteroid recuperar a lista de ccds para cada posição
            self.retrive_asteroids_ccds()

            with open(os.path.join(self.job_path, 'teste.json'), 'w') as fp:
                json.dump(self.asteroids, fp)

            # Baixar os arquivos BSP de cada asteroid

            self.result['status'] = 'done'

        except Exception as e:
            self.on_error(e)

        finally:
            t1 = datetime.now(timezone.utc)
            tdelta = t1 - t0

            self.result['end'] = t1.isoformat()
            self.result['exec_time'] = tdelta.total_seconds()

            self.log.info("DES Astrometry has %s in %s" %
                          (self.result['status'], self.natural_delta(tdelta)))

            return self.result

    def retrive_asteroids_ccds(self):
        self.log.info("Retriving Asteroid CCDs started")

        t0 = datetime.now(timezone.utc)
        self.result['retrieve_ccds']['start'] = t0.isoformat()

        dao = DesSkybotPositionDao()

        try:
            count = 0

            for asteroid_name in self.asteroids:
                asteroid = self.asteroids[asteroid_name]

                records = list()

                # Faz a query na tabela des skybot positions com join na des ccds.
                records = dao.ccds_by_asteroid(asteroid_name)

                asteroid['ccds'] = list()
                # Se não encontrar ccd para este asteroid é uma falha só para este asteroid.
                # Não impede que o processo continue.
                if len(records) == 0:

                    asteroid['ccds_count'] = 0
                    asteroid['error'] = 'No CCD found for this asteroid.'
                    asteroid['status'] = 'failure'

                else:
                    for ccd in records:
                        asteroid['ccds'].append(dict({
                            'id': ccd['id'],
                            'expnum': ccd['expnum'],
                            'ccdnum': ccd['ccdnum'],
                            'band': ccd['band'],
                            # 'date_obs': ccd['date_obs'].isoformat(),
                            'path': ccd['path'],
                            'filename': ccd['filename'],
                            'compression': ccd['compression'],
                            'release': ccd['release'],
                        }))

                    asteroid['ccds_count'] = len(records)

                count += len(records)

                self.asteroids[asteroid_name] = asteroid

            self.result['retrieve_ccds']['records'] = count
            self.result['retrieve_ccds']['status'] = 'done'

        except Exception as e:
            msg = "Failed on retrive asteroids ccds. %s" % e

            self.result['retrieve_ccds']['status'] = 'failed'

            raise Exception(msg)

        finally:
            t1 = datetime.now(timezone.utc)
            tdelta = t1 - t0

            self.result['retrieve_ccds']['end'] = t1.isoformat()
            self.result['retrieve_ccds']['exec_time'] = tdelta.total_seconds()

            # Time Profile
            self.add_time_profile(
                stage='retrieve_ccds',
                status=self.result['retrieve_ccds']['status'],
                start=t0,
                end=t1,
                persist=True
            )

            self.log.info("Retrive Asteroids CCDs has %s in %s" % (
                self.result['retrieve_ccds']['status'], self.natural_delta(tdelta)))

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

            self.log.debug("Count Asteroids: [%s]" % len(records))

            if len(records) == 0:
                # Nenhum resultado encontrado, disparar uma excessão para finalizar a execução do processo.
                raise NoRecordsFound(
                    "No asteroid found for the selected filters.")

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
        self.result['update_asteroid_table']['start'] = t0.isoformat()

        try:
            records_affected = AsteroidDao().insert_update()
            self.log.debug("Affected Records: [%s]" % records_affected)

            self.result['update_asteroid_table']['records_affected'] = records_affected
            self.result['update_asteroid_table']['status'] = 'done'

        except Exception as e:
            msg = "Failed on update Asteroid Table. %e" % e

            self.result['update_asteroid_table']['status'] = 'failed'

            raise Exception(msg)

        finally:
            t1 = datetime.now(timezone.utc)
            tdelta = t1 - t0

            self.result['update_asteroid_table']['end'] = t1.isoformat()
            self.result['update_asteroid_table']['exec_time'] = tdelta.total_seconds()

            self.log.info("Update Asteroid Table has %s in %s" % (
                self.result['update_asteroid_table']['status'], self.natural_delta(tdelta)))

            # Time Profile
            self.add_time_profile(
                stage='update_asteroid_table',
                status=self.result['update_asteroid_table']['status'],
                start=t0,
                end=t1,
                persist=True
            )

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

    def create_job_path(self, job_id):

        path = self.get_job_path(job_id)

        if not os.path.exists(path):
            os.mkdir(path)
            self.log.info("A directory has been created for the job.")

        return path

    def prepare_override_run(self):

        if not self.debug:
            return

        # Remove o diretório do Job
        job_path = self.get_job_path(self.job_id)
        if os.path.exists(job_path):
            shutil.rmtree(job_path)
            self.log.debug("Removed job path: %s" % job_path)

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
