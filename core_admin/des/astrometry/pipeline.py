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
from common.jpl import get_bsp_from_jpl, findSPKID
import pickle
from common.convert import datetime_to_julian_datetime

import parsl
from des.astrometry.parsl_config import htex_config
from des.astrometry.parsl_apps import increment
from tno.models import BspPlanetary, LeapSecond
import spiceypy as spice


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
        # 'retrieve_ccds': {
        #     'status': None,
        #     'start': None,
        #     'end': None,
        #     'exec_time': 0,
        #     'records': 0
        # },
        'asteroids_csv': None,
        'time_profile': None
    })

    job_path = None

    time_profile = list()

    asteroids = dict()

    DES_START_PERIOD = '2012-11-01'

    DES_FINISH_PERIOD = '2019-02-01'

    BSP_PLANETARY = None

    LEAP_SECOND = None

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
            if self.debug is False:
                self.update_asteroid_table()

            # BSP Planetary
            # TODO: Receber como paramatro
            self.BSP_PLANETARY = self.get_bsp_planetary('de435')

            # Leap Second
            # TODO: Receber como paramatro
            self.LEAP_SECOND = self.get_leap_second('naif0012')

            # Aplicar o filtro na tabela de asteroids
            l_asteroids = self.retrive_asteroids(asteroid_name='Eris')

            # Cria um estrutura organizada pelo nome do asteroid,
            # nela serão adicionadas as informações sobre cada asteroid.
            for asteroid in l_asteroids:

                # Para cada asteroid criar um diretório dentro do diretório do Job
                asteroid_path = self.get_or_create_asteroid_path(
                    asteroid['name'])

                self.asteroids[asteroid['name']] = dict({
                    'id': asteroid['id'],
                    'name': asteroid['name'],
                    'number': asteroid['number'],
                    'spkid': None,
                    'alias': asteroid['name'].replace(' ', '_'),
                    'path': asteroid_path,
                    'bsp_planetary': self.BSP_PLANETARY,
                    'leap_second': self.LEAP_SECOND,
                    'bsp_jpl': None
                })

            # Estas etapas não são paralelizadas!
            for asteroid_name in self.asteroids:
                # Apartir daqui o dict asteroid não está relacionado com o a lista self.asteroids
                # os dados desde dict serão armazenados em um pickle no diretório do asteroid.
                asteroid = self.asteroids[asteroid_name].copy()

                # Para cada asteroid recuperar a lista de ccds para cada posição
                asteroid = self.retrieve_asteroid_ccds(asteroid)

                # Só baixa os BSP para asteroids que tenham ccds
                if asteroid['status'] != 'failure':
                    # Para cada asteroid Baixar os arquivos BSP do JPL
                    asteroid = self.retrieve_asteroid_bsp(asteroid)

                    # Recuperar o SPK Id do objeto a partir do seu BSP
                    asteroid['spkid'] = findSPKID(
                        asteroid['bsp_jpl']['file_path'])
                    self.log.debug("SpkID: [%s]" % asteroid['spkid'])

                # Guardar as informações do asteroid no pickle
                pkl_file = os.path.join(
                    asteroid_path, asteroid['alias'] + '.pkl')

                with open(pkl_file, 'wb') as f:
                    pickle.dump(asteroid, f)

                self.log.debug(json.dumps(asteroid, indent=2))

            # TODO: a partir daqui o processo pode ser paralelizado

            # parsl.clear()
            # parsl.load(htex_config)

            # for i in range(5):
            #     self.log.debug('{} + 1 = {}'.format(i, increment(i).result()))

            # for asteroid in l_asteroids:
            #     # Remonta o path do diretório do asteroid
            #     # o path será o unico parametro para as funções que serão executadas pelo parsl.
            #     asteroid_path = self.get_or_create_asteroid_path(
            #         asteroid['name'])

                # Somente para DEBUG escreve a variavel self.asteroids em um json
            with open(os.path.join(self.job_path, 'teste.json'), 'w') as fp:
                json.dump(self.asteroids, fp)

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
            'time_profile': list(),
            'ccds_count': 0,
            'ccds': list(),
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
                    asteroid['ccds'].append(dict({
                        'id': ccd['id'],
                        'expnum': ccd['expnum'],
                        'ccdnum': ccd['ccdnum'],
                        'band': ccd['band'],
                        'date_obs': str(ccd['date_obs']),
                        'date_jd': self.date_to_jd(ccd['date_obs'], ccd['exptime'], self.LEAP_SECOND['relative_path']),
                        'exptime': ccd['exptime'],
                        'path': ccd['path'],
                        'filename': ccd['filename'],
                        'release': ccd['release'],
                    }))

                    self.log.debug(ccd['path'] + '/' + ccd['filename'])
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
            'relative_path': relative_path,
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
            'relative_path': relative_path,
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
