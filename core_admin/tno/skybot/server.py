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
from tno.models import SkybotRun
import humanize
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

        # DEBUG LIMIT 
        self.debug_limit = None

        try:
            self.dbsk = SkybotOutputDB()

            self.dbpt = PointingDB()
        except Exception as e:
            self.logger.error(e)

        self.skybotrun = skybotrun

        # self.skybot_server = "http://vo.imcce.fr/webservices/skybot/skybotconesearch_query.php"
        self.skybot_server = "http://srvskybot.linea.gov.br/webservices/skybot/skybotconesearch_query.php"

        # Cone search radius in Degres
        self.cone_search_radius = 1.2

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


        self.stats = dict({
            'tasks': 0,
            'current': 0,
            'rows': 0
        })

        self.stats_json = os.path.join(
            self.skybot_output_path, 'stats.json')

        self.results_file = os.path.join(
            self.skybot_output_path, 'results.csv')

        self.time_profile = os.path.join(
            self.skybot_output_path, 'time_profile.csv')


        self.heart_beat_interval = 10

        self.max_workers = 1

        result_columns = ['expnum', 'band', 'date_obs', 'skybot_downloaded', 'skybot_url', 'download_start', 'download_finish', 'download_time', 'filename',
                        'file_size', 'file_path', 'import_start', 'import_finish', 'import_time', 'count_created', 'count_updated', 'count_rows', 
                        'ccd_count', 'ccd_count_rows', 'ccd_start', 'ccd_finish', 'ccd_time', 'error']

        self.df_results = pd.DataFrame(
            columns=result_columns,
        )

        time_profile_columns = ['expnum', 'operation', 'start', 'finish', ]
        self.df_time_profile = pd.DataFrame(
            columns=time_profile_columns,
        )

        self.pointings = []



    def run_get_asteroids(self, pointings):

        # TODO PARALELIZAR
        # with futures.ProcessPoolExecutor(max_workers=self.max_workers) as ex:
        heart_beat = 0
        current = 1

        self.stats['tasks'] = len(pointings)

        for pointing in pointings:
            self.logger.info("Running  %s/%s" % (current, len(pointings)))

            self.stats['current'] = current

            result = self.get_asteroids_from_skybot(pointing)

            current += 1

            # escrever em arquivo os resultados do download.
            if heart_beat > self.heart_beat_interval:
                self.write_results()
                heart_beat = 0

            heart_beat += 1

            if result['skybot_downloaded']:
                # ex.submit(import_skybot_output, result).add_done_callback(
                #     self.register_result)

                import_result = impSkybot.read_skybot_output_csv(result['file_path'])
                result.update(import_result)

                associate_result = self.associate_ccd(result)
                result.update(associate_result)

                self.register_result(result)
            else:
                self.register_errors(result)

        self.write_results()

    def write_results(self):
        # Escrever o csv com os resultados
        self.df_results.to_csv(
            path_or_buf=self.results_file, sep=";", index=False)

        # Total de linhas alteradas ou criadas.
        self.skybotrun.rows = self.df_results['count_rows'].sum()
        self.skybotrun.save()

        # Escrever o arquivo de time profile
        self.df_time_profile.to_csv(
            path_or_buf=self.time_profile, sep=";", index=False)

    def register_result(self, result):
        self.df_results = self.df_results.append(result, ignore_index=True)

        # Total de linhas alteradas ou criadas.
        self.stats['rows'] = int(self.stats['rows']) + \
            int(result['count_rows'])

        # Escrever o arquivo de Status
        self.write_stats()

        # Register time Download
        self.register_time_profile(
            result['expnum'], 1, result['download_start'], result['download_finish'])

        # Register time Import
        self.register_time_profile(
            result['expnum'], 2, result['import_start'], result['import_finish'])

        # Register time Associate CCD
        self.register_time_profile(
            result['expnum'], 3, result['ccd_start'], result['ccd_finish'])


    def write_stats(self):

        with open(self.stats_json, 'w') as outfile:
            json.dump(self.stats, outfile)

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

        self.skybotrun.exposure = len(pointings)
        self.skybotrun.save()

        self.pointings = pointings

        # Fazer a busca no Skybot
        self.run_get_asteroids(pointings)

    def import_poitings_by_period(self, date_initial, date_final):
        self.logger.info("Import pointing by period. Initial [%s] Final [ %s ]" % (
            date_initial, date_final))

        count = self.dbpt.count_pointings()

        self.logger.debug("Total de Pointings: %s" % count)

        cols = self.dbpt.tbl.c

        stm = select([cols.expnum, cols.band, cols.date_obs, cols.radeg, cols.decdeg]) \
            .where(and_(
                cast(cols.date_obs, DATE) >= date_initial.strftime("%Y-%m-%d"),
                cast(cols.date_obs, DATE) <= date_final.strftime("%Y-%m-%d")
            )) \
            .group_by(cols.expnum, cols.band, cols.date_obs, cols.radeg, cols.decdeg) \
            .order_by(cols.date_obs) \
            .limit(self.debug_limit)

        pointings = self.dbpt.fetch_all_dict(stm)

        self.logger.debug("Rows: [%s]" % len(pointings))

        self.skybotrun.exposure = len(pointings)
        self.skybotrun.save()

        self.pointings = pointings

        # Fazer a busca no Skybot
        self.run_get_asteroids(pointings)

    # query for circle
    def import_pointings_by_radial_query(self, ra, dec, radius):

        self.logger.info("Get Pointing Radial Query.  Ra: [ %s ] Dec: [ %s ] Radius: [ %s ]" % (
            ra, dec, radius))

        self.logger.debug("Output Path: %s" % self.skybot_output_path)

        cols = self.dbpt.tbl.c

        stm = select([cols.expnum, cols.band, cols.date_obs, cols.radeg, cols.decdeg]) \
            .where(and_(
                text(
                    "q3c_radial_query(\"ra_cent\", \"dec_cent\", %s, %s, %s)" % (ra, dec, radius))
            )
        ) \
            .group_by(cols.expnum, cols.band, cols.date_obs, cols.radeg, cols.decdeg) \
            .order_by(cols.date_obs) \
            .limit(self.debug_limit)

        pointings = self.dbpt.fetch_all_dict(stm)

        self.logger.debug("Total de Pointings: %s" % len(pointings))

        self.skybotrun.exposure = len(pointings)
        self.skybotrun.save()

        self.pointings = pointings

        # Fazer a busca no Skybot
        self.run_get_asteroids(pointings)

     # query for square
    def import_pointings_by_square_query(self, ra, dec, ra_ul, dec_ul, ra_ur, dec_ur, ra_lr, dec_lr, ra_ll, dec_ll):

        self.logger.info("Import pointing poly_query - Ra: [ %s ], Dec: [ %s ]" % (
            ra, dec))

        count = self.dbpt.count_pointings()

        self.logger.debug("Total de Pointings: %s" % count)

        cols = self.dbpt.tbl.c

        # TODO query com parametros hardcoded

        stm = select([cols.expnum, cols.band, cols.date_obs, cols.radeg, cols.decdeg]) \
            .where(and_(
                text(
                    "q3c_poly_query(\"ra_cent\", \"dec_cent\",'{%s, %s, %s, %s, %s, %s, %s, %s}')" %(
                        ra_ul, dec_ul, ra_ur, dec_ur, ra_lr, dec_lr, ra_ll, dec_ll))
            )
        ) \
            .group_by(cols.expnum, cols.band, cols.date_obs, cols.radeg, cols.decdeg) \
            .order_by(cols.date_obs) \
            .limit(self.debug_limit)

        pointings = self.dbpt.fetch_all_dict(stm)

        self.logger.debug("Rows: [%s]" % len(pointings))

        self.skybotrun.exposure = len(pointings)
        self.skybotrun.save()

        self.pointings = pointings

        # Fazer a busca no Skybot
        self.run_get_asteroids(pointings)

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

        result = dict({
            'skybot_downloaded': False,
            'skybot_url': None,
            'error': None,
            'filename': None,
            'file_size': None,
            'file_path': None,
        })

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

            result.update({
                'skybot_downloaded': True,
                'skybot_url': r.url,
                'filename': filename,
                'file_size': file_size,
                'file_path': file_path,                
            })

            self.logger.debug("Skybot URL: [ %s ]" % r.url)
        except Exception as e:
            self.logger.error(e)
            error = e

            result.update({
                'skybot_downloaded': False,
                'skybot_url': None,
                'error': error
            })

        t1 = datetime.now()
        tdelta = t1 - t0

        result.update({
            'expnum': pointing.get("expnum"),
            'band': pointing.get("band"),
            'date_obs': pointing.get("date_obs"),
            'download_start': t0.strftime("%Y-%m-%d %H:%M:%S.%f")[:-3],
            'download_finish': t1.strftime("%Y-%m-%d %H:%M:%S.%f")[:-3],
            'download_time': tdelta.total_seconds(),
        })

        if error is None:
            self.logger.info("Skybot output success: [%s]" % file_path)
        else:
            self.logger.error("Skybot output failed: [%s]" % file_path)

        return result

    def get_ccds_by_expnum(self, expnum):

        self.logger.debug("Get CCDs for Expnum: [ %s ]" % expnum)

        t0 = datetime.now()
        tbl = self.dbpt.tbl

        stm = select(tbl.c).order_by(tbl.c.ccdnum).where(and_(tbl.c.expnum == expnum))
        
        ccds = self.dbpt.fetch_all_dict(stm)

        t1 = datetime.now()
        tdelta = t1 - t0

        self.logger.info("Found [ %s ] CCDs for Expnum [ %s ] in %s" % (len(ccds), expnum, humanize.naturaldelta(tdelta)))

        return ccds


    def associate_ccd(self, poiting):
        self.logger.debug("Associate With CCDs")

        self.logger.debug(poiting)
        self.logger.debug("Expnum [ %s ] Band [ %s ]" % (poiting['expnum'], poiting['band']))

        t0 = datetime.now() 

        # Para cada exposicao buscar todos os ccds
        ccds = self.get_ccds_by_expnum(poiting['expnum'])

        count_updates = 0

        for ccd in ccds:
            tt0 = datetime.now()
            self.logger.debug("CCD [ %s ]" % (ccd['ccdnum']))
            self.logger.debug("RAC1 [ %s ] Decc1 [ %s ]" % (ccd['rac1'], ccd['decc1']))
            self.logger.debug("RAC2 [ %s ] Decc2 [ %s ]" % (ccd['rac2'], ccd['decc2']))
            self.logger.debug("RAC3 [ %s ] Decc3 [ %s ]" % (ccd['rac3'], ccd['decc3']))
            self.logger.debug("RAC4 [ %s ] Decc4 [ %s ]" % (ccd['rac4'], ccd['decc4']))

            cols = self.dbsk.tbl.c

            stm = self.dbsk.tbl.update().\
                    where(and_(
                        text("q3c_poly_query(\"raj2000\", \"decj2000\", '{%s, %s, %s, %s, %s, %s, %s, %s}')" % (ccd['rac1'], ccd['decc1'], ccd['rac2'], ccd['decc2'], ccd['rac3'], ccd['decc3'],ccd['rac4'], ccd['decc4'])),
                        cols.expnum == ccd['expnum'],
                        cols.band == ccd['band']
                        )).\
                            values(ccdnum = ccd['ccdnum'])
                    

            self.logger.debug("SQL: %s" % str(stm))

            asteroids = self.dbsk.engine.execute(stm)
            
            count = asteroids.rowcount

            count_updates += count

            tt1 = datetime.now()
            ttdelta = tt1 - tt0

            self.logger.debug("Exposure [ %s ] CCD [ %s ] had [ %s ] Asteroids  associated in %s" % (poiting['expnum'], ccd['ccdnum'], count, humanize.naturaldelta(ttdelta)))

        t1 = datetime.now()
        tdelta = t1 - t0

        result_ccd = dict({
            'ccd_count': len(ccds),
            'ccd_count_rows': count_updates,
            'ccd_start': t0.strftime("%Y-%m-%d %H:%M:%S.%f")[:-3],
            'ccd_finish': t1.strftime("%Y-%m-%d %H:%M:%S.%f")[:-3],
            'ccd_time': tdelta.total_seconds(),
            })

        self.logger.info("Expnum [ %s ] Skybot Output: [ %s ] Asteroids inside CCD: [ %s ] in %s " % (ccd['expnum'], poiting['count_rows'] , count_updates, humanize.naturaldelta(tdelta)))

        return result_ccd

