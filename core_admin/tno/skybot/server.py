import logging
import os
import requests
import json
from time import sleep
from tno.skybotoutput import Pointing as PointingDB
from tno.skybotoutput import SkybotOutput as SkybotOutputDB
from sqlalchemy.sql import select, and_, insert, desc
from sqlalchemy import cast, DATE, func, text
from django.conf import settings
from datetime import datetime
import pandas as pd
from tno.models import SkybotRun
from concurrent import futures

from sqlalchemy.sql import expression
from sqlalchemy.ext.compiler import compiles
from sqlalchemy.types import String

from .loaddata import ImportSkybot


impSkybot = ImportSkybot()

def import_skybot_output(result):

    import_result = impSkybot.read_skybot_output_csv(result['file_path'])

    result.update(import_result)

    return result


class SkybotServer():

    def __init__(self, skybotrun):
        self.logger = logging.getLogger("skybot")

        self.logger.info(
            "-------------------------- Skybot Run: %s --------------------------" % skybotrun.id)

        self.skybotrun = skybotrun

        # self.skybot_server = "http://vo.imcce.fr/webservices/skybot/skybotconesearch_query.php"
        self.skybot_server = "http://srvskybot.linea.gov.br/webservices/skybot/skybotconesearch_query.php"

        # Cone search radius in Degres
        self.cone_search_radius = 1.1

        # Observer Code
        self.observer_location = 'w84'

        # Filter to retrieve only objects with a position error lesser than the given value
        self.position_error = 0

        # Diretorio onde ficam os csv baixados do skybot
        self.base_path = settings.SKYBOT_OUTPUT

        output_path = os.path.join(self.base_path, str(skybotrun.id))
        if not os.path.exists(output_path):
            os.mkdir(output_path)

        self.skybot_output_path = output_path

        self.dbsk = SkybotOutputDB()

        self.dbpt = PointingDB()

        self.statistics = dict()

        self.statistics_json = os.path.join(
            self.skybot_output_path, 'statistics.json')

        self.results_file = os.path.join(
            self.skybot_output_path, 'results.csv')

        self.time_profile = os.path.join(
            self.skybot_output_path, 'time_profile.csv')

        self.debug_limit = None

        self.heart_beat_interval = 5

        self.max_workers = 4

        result_columns = ['expnum', 'band', 'skybot_downloaded', 'skybot_url', 'download_start', 'download_finish', 'download_time', 'filename',
                          'file_size', 'file_path', 'import_start', 'import_finish', 'import_time', 'count_created', 'count_updated', 'count_rows', 'error']

        self.df_results = pd.DataFrame(
            columns=result_columns,
        )

        time_profile_columns = ['expnum', 'operation', 'start', 'finish', ]
        self.df_time_profile = pd.DataFrame(
            columns=time_profile_columns,
        )

    # def write_stats(self):

    #     with open(self.statistics_json, 'w') as outfile:
    #         json.dump(self.statistics, outfile)

    #     self.logger.info("Writing Statistics")

    def run_get_asteroids(self, pointings):

        with futures.ProcessPoolExecutor(max_workers=self.max_workers) as ex:
            self.logger.info("***************** Start ****************")

            heart_beat = 0
            current = 1
            for pointing in pointings:
                self.logger.debug("Running  %s/%s" % (current, len(pointings)))

                result = self.get_asteroids_from_skybot(pointing)

                current += 1


                if heart_beat > self.heart_beat_interval:
                    self.write_results()
                    heart_beat = 0

                heart_beat +=1

                if result['skybot_downloaded']:
                    ex.submit(import_skybot_output, result).add_done_callback(
                        self.register_result)
                else:
                    self.register_errors(result)

        self.write_results()

        self.logger.info("***************** Done ****************")

    def write_results(self):
        # Escrever o csv com os resultados
        self.df_results.to_csv(
            path_or_buf=self.results_file, sep=";", index=False)

        # Escrever o arquivo de time profile
        self.df_time_profile.to_csv(
            path_or_buf=self.time_profile, sep=";", index=False)

    def register_result(self, future):
        # self.logger.debug("***** Futture: %s" % future.result())

        result = future.result()

        self.df_results = self.df_results.append(result, ignore_index=True)

        # Register time Download
        self.register_time_profile(
            result['expnum'], 1, result['download_start'], result['download_finish'])

        # Register time Import
        self.register_time_profile(
            result['expnum'], 2, result['import_start'], result['import_finish'])


    def register_time_profile(self, expnum, operation, start, finish):

        self.df_time_profile = self.df_time_profile.append(dict(
            {'expnum': expnum, 'operation': operation, 'start': start, 'finish': finish}), ignore_index=True)

    def register_errors(self, result):
        # TODO Criar metodo para registrar os errors.
        pass

    def import_all_poitings(self):
        self.logger.info("Get Pointings")

        count = self.dbpt.count_pointings()

        self.logger.debug("Total de Pointings: %s" % count)

        cols = self.dbpt.tbl.c

        stm = select([cols.expnum, cols.band, cols.date_obs, cols.radeg, cols.decdeg]).group_by(
            cols.expnum, cols.band, cols.date_obs, cols.radeg, cols.decdeg).order_by(cols.date_obs).limit(self.debug_limit)

        pointings = self.dbpt.fetch_all_dict(stm)

        self.logger.debug("Rows: [%s]" % len(pointings))

        # Fazer a busca no Skybot
        self.run_get_asteroids(pointings)

    def import_poitings_by_period(self, date_initial, date_final):
        self.logger.info("Import pointing by period. Initial [%s] Final [ %s ]" % (
            date_initial, date_final))

        count = self.dbpt.count_pointings()

        self.logger.debug("Total de Pointings: %s" % count)

        cols = self.dbpt.tbl.c

        stm = select([cols.expnum, cols.band, cols.date_obs,
                      cols.radeg, cols.decdeg]) \
            .where(and_(
                cast(cols.date_obs, DATE) >= date_initial.strftime("%Y-%m-%d"),
                cast(cols.date_obs, DATE) >= date_final.strftime("%Y-%m-%d")
            )) \
            .group_by(cols.expnum, cols.band, cols.date_obs, cols.radeg, cols.decdeg) \
            .order_by(cols.date_obs) \
            .limit(self.debug_limit)

        pointings = self.dbpt.fetch_all_dict(stm)

        self.logger.debug("Rows: [%s]" % len(pointings))

        # Fazer a busca no Skybot
        for pointing in pointings:
            self.get_asteroids_from_skybot(pointing)

    # query for circle
    def import_pointings_by_radial_query(self, ra, dec, radius):

        self.logger.info("Get Pointing Radial Query.  Ra: [ %s ] Dec: [ %s ] Radius: [ %s ]" % (
            ra, dec, radius))

        self.logger.debug("Output Path: %s" % self.skybot_output_path)

        cols = self.dbpt.tbl.c

        stm = select([cols.expnum, cols.band, cols.date_obs,
                      cols.radeg, cols.decdeg]) \
            .where(and_(
                text(
                    "q3c_radial_query(\"ra_cent\", \"dec_cent\", 37.133189, -8.416731, 2.5)")
            )
        ) \
            .group_by(cols.expnum, cols.band, cols.date_obs, cols.radeg, cols.decdeg) \
            .order_by(cols.date_obs) \
            .limit(self.debug_limit)

        pointings = self.dbpt.fetch_all_dict(stm)

        self.logger.debug("Total de Pointings: %s" % len(pointings))

        # Fazer a busca no Skybot
        self.run_get_asteroids(pointings)

     # query for square
    def import_pointings_by_square_query(self, ra, dec, ra_ul, dec_ul, ra_ur, dec_ur, ra_lr, dec_lr, ra_ll, dec_ll):

        self.logger.info("Import pointing poly_query - Ra: [ %s ], Dec: [ %s ]" % (
            ra, dec))

        count = self.dbpt.count_pointings()

        self.logger.debug("Total de Pointings: %s" % count)

        cols = self.dbpt.tbl.c

        stm = select([cols.expnum, cols.band, cols.date_obs,
                      cols.radeg, cols.decdeg]) \
            .where(and_(
                text(
                    "q3c_poly_query(\"ra_cent\", \"dec_cent\",'{149.007568, 1.231059, 151.094971, 1.231059, 151.094971, 3.172285, 149.007568, 3.172285}')")
            )
        ) \
            .group_by(cols.expnum, cols.band, cols.date_obs, cols.radeg, cols.decdeg) \
            .order_by(cols.date_obs) \
            .limit(self.debug_limit)

        self.logger.debug("Antes")
        pointings = self.dbpt.fetch_all_dict(stm)
        self.logger.debug("Depois")

        self.logger.debug("Rows: [%s]" % len(pointings))

        # Fazer a busca no Skybot
        for pointing in pointings:
            self.get_asteroids_from_skybot(pointing)

    def get_asteroids_from_skybot(self, pointing):

        t0 = datetime.now()

        # http://vo.imcce.fr/webservices/skybot/skybotconesearch_query.php?-ep=2012-11-10%2003:27:03&-ra=37.44875&-dec=-7.7992&-rd=1.1&-mime=text&-output=object&-loc=w84&-filter=0
        self.logger.info(
            "Get asteroids from skybot. Pointing [ %s ] " % pointing.get('expnum'))

        date_obs = pointing.get('date_obs').strftime("%Y-%m-%d %H:%M:%S")

        self.logger.debug("Expnum: [%s]" % pointing.get('expnum'))
        self.logger.debug("Date obs: [%s]" % date_obs)

        file_id = "%s_%s" % (pointing.get("expnum"), pointing.get("band"))
        filename = "%s.csv" % (file_id)

        file_path = os.path.join(self.skybot_output_path, filename)
        file_size = None
        error = None

        try:
            r = requests.get(self.skybot_server, params={
                '-ep': date_obs,
                '-ra': float(pointing.get('radeg')),
                '-dec': float(pointing.get('decdeg')),
                '-rd': self.cone_search_radius,
                '-loc': self.observer_location,
                '-mime': 'text',
                '-output': 'all',
                '-filter': self.position_error,
            })

            with open(file_path, 'w+') as csv:
                csv.write(r.text)

            if os.path.exists(file_path):
                file_size = os.path.getsize(file_path)

        except Exception as e:
            self.logger.error(e)
            error = e

        t1 = datetime.now()
        tdelta = t1 - t0

        result = dict({
            'expnum': pointing.get("expnum"),
            'band': pointing.get("band"),
            'skybot_downloaded': True,
            'skybot_url': r.url,
            'download_start': t0.strftime("%Y-%m-%d %H:%M:%S.%f")[:-3],
            'download_finish': t1.strftime("%Y-%m-%d %H:%M:%S.%f")[:-3],
            'download_time': tdelta.total_seconds(),
            'filename': filename,
            'file_size': file_size,
            'file_path': file_path,
            'error': error
        })

        if error is None:
            self.logger.info("Skybot output success: [%s]" % file_path)
        else:
            self.logger.error("Skybot output failed: [%s]" % file_path)

        return result
