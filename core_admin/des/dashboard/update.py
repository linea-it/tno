import logging
import traceback
from datetime import datetime

import humanize
import pandas as pd

from des.models import DashboardSkybotYearResult
from des.models import DashboardSkybotDynclassResult

from des.dao import (ExposureDao, CcdDao,
                     DesSkybotJobResultDao, DashboardSkybotYearResultDao)
from des.dao import DashboardSkybotDynclassResultDao, DesSkybotPositionDao


class DashboardUpdate():

    def __init__(self):
        self.logger = logging.getLogger("dashboard_update")

    def run_job(self):
        try:
            # Job start time
            t0 = datetime.now()
            self.logger.info('Start [%s]' % t0.strftime("%Y-%m-%d %H:%M:%S"))

            # Get results by year
            results_by_year = self.run_results_by_year()

            # Get results by dynclass
            results_by_dynclass = self.run_results_by_dynclass()

            # Import results by year
            self.import_results_by_year(results_by_year)

            # Import results by dynclass
            self.import_results_by_dynclass(results_by_dynclass)

            # Job end time
            t1 = datetime.now()

            # Job time delta
            tdelta = t1 - t0

            self.logger.info('Finished [%s]' %
                             t1.strftime("%Y-%m-%d %H:%M:%S"))
            self.logger.info('Execution Time: [%s]' % humanize.naturaldelta(
                tdelta, minimum_unit="seconds"))

        except Exception as e:
            trace = traceback.format_exc()
            self.logger.error(trace)
            self.logger.error(e)

    def run_results_by_year(self):

        # Years to run
        years = {
            '2012': ['2012-11-10', '2012-12-31'],
            '2013': ['2013-01-01', '2013-12-31'],
            '2014': ['2014-01-01', '2014-12-31'],
            '2015': ['2015-01-01', '2015-12-31'],
            '2016': ['2016-01-01', '2016-12-31'],
            '2017': ['2017-01-01', '2017-12-31'],
            '2018': ['2018-01-01', '2018-12-31'],
            '2019': ['2019-01-01', '2019-12-31'],
        }

        epdao = ExposureDao(pool=False)
        ccdao = CcdDao(pool=False)
        dsdao = DesSkybotJobResultDao(pool=False)

        rows = []

        for year in years:
            t0 = datetime.now()

            start = datetime.strptime(
                years[year][0], '%Y-%m-%d').strftime("%Y-%m-%d 00:00:00")

            end = datetime.strptime(
                years[year][1], '%Y-%m-%d').strftime("%Y-%m-%d 23:59:59")

            # Total nights with exposures by period
            nights = epdao.count_nights_by_period(start, end)

            # Total exposures by period
            exposures = epdao.count_exposures_by_period(start, end)

            # Total CCDs with exposures by period
            ccds = ccdao.count_ccds_by_period(start, end)

            # Total nights analyzed by period
            nights_analyzed = dsdao.count_nights_analyzed_by_period(
                start, end)

            # Total exposures analyzed by period
            exposures_analyzed = dsdao.count_exposures_analyzed_by_period(
                start, end)

            # Total ccds analyzed by period
            ccds_analyzed = dsdao.count_ccds_analyzed_by_period(start, end)

            rows.append({
                'year': year,
                'nights': nights,
                'exposures': exposures,
                'ccds': ccds,
                'nights_analyzed': nights_analyzed,
                'exposures_analyzed': exposures_analyzed,
                'ccds_analyzed': ccds_analyzed,
            })

            t1 = datetime.now()

            tdelta = t1 - t0

            self.logger.info("[%s] Year, [%s] Nights, [%s] Exposures, [%s] CCDs, [%s] Nights Analyzed, [%s] Exposures Analyzed and [%s] CCDs Analyzed: in [%s]" % (
                year, nights, exposures, ccds, nights_analyzed, exposures_analyzed, ccds_analyzed, humanize.naturaldelta(tdelta, minimum_unit="seconds")))

            self.logger.info('Year Rows [%s]' % len(rows))

        return rows

    def import_results_by_year(self, rows):

        df = pd.DataFrame.from_records(rows, columns=[
                                       'year', 'nights', 'exposures', 'ccds',
                                       'nights_analyzed', 'exposures_analyzed',
                                       'ccds_analyzed'])

        # Cleaning table before import
        DashboardSkybotYearResult.objects.all().delete()
        self.logger.info('Deleted "des_dashboardskybotyearresult" table')

        dydao = DashboardSkybotYearResultDao(pool=False)

        # Copying dataframe into database
        dydao.import_data(df)
        self.logger.info(
            'Imported into "des_dashboardskybotyearresult" table')

    def run_results_by_dynclass(self):

        # List of all dynamic classes
        dynclasses = ['Centaur', 'Comet', 'Hungaria', 'KBO',
                      'MB', 'Mars-Crosser', 'NEA', 'Planet', 'Trojan']

        rows = []

        dpdao = DesSkybotPositionDao(pool=False)

        for dynclass in dynclasses:
            t0 = datetime.now()

            # Total nights analyzed by dynamic class
            nights = dpdao.count_nights_by_dynclass(dynclass)

            # Total ccds analyzed by dynamic class
            ccds = dpdao.count_ccds_by_dynclass(dynclass)

            # Total asteroids by dynamic class
            asteroids = dpdao.count_asteroids_by_dynclass(dynclass)

            # Total asteroids by dynamic class
            positions = dpdao.count_positions_by_dynclass(dynclass)

            # Bands with exposures by dynamic class
            bands = dpdao.count_bands_by_dynclass(dynclass)

            # Initialize bands with zero to allow zero values
            bands_dict = {
                'g': 0,
                'i': 0,
                'r': 0,
                'u': 0,
                'Y': 0,
                'z': 0,
            }

            # Change the dictionary structure to have each band
            # as a column later on a dataframe
            for band in bands:
                bands_dict = {
                    # Spread properties to allow zero values
                    **bands_dict,
                    band['band']: band['asteroids']
                }

            rows.append({
                'dynclass': dynclass,
                'nights': nights,
                'ccds': ccds,
                'asteroids': asteroids,
                'positions': positions,
                **bands_dict
            })

            t1 = datetime.now()

            tdelta = t1 - t0

            self.logger.info("[%s] Dynclass, [%s] Nights, [%s] CCDs, [%s] Asteroids, [%s] Positions, [%s] Band u, [%s] Band g, [%s] Band r, [%s] Band i, [%s] Band z and [%s] Band Y: in [%s]" % (
                dynclass, nights, ccds, asteroids, positions, bands_dict['u'], bands_dict['g'], bands_dict['r'], bands_dict['i'], bands_dict['z'], bands_dict['Y'], humanize.naturaldelta(tdelta, minimum_unit="seconds")))

            self.logger.info('Dynclass Rows [%s]' % len(rows))

        return rows

    def import_results_by_dynclass(self, rows):

        df = pd.DataFrame.from_records(rows, columns=['dynclass', 'nights',
                                                      'ccds', 'asteroids',
                                                      'positions',
                                                      'g', 'i', 'r',
                                                      'u', 'Y', 'z'])

        # Rename the column Y to y
        # because the database doesn't allow uppercase columns
        df.rename(columns={'Y': 'y'})

        # Cleaning table before import
        DashboardSkybotDynclassResult.objects.all().delete()
        self.logger.info('Deleted "des_dashboardskybotdynclassresult" table')

        dddao = DashboardSkybotDynclassResultDao(pool=False)

        # Copying dataframe into database
        dddao.import_data(df)
        self.logger.info(
            'Imported into "des_dashboardskybotdynclassresult" table')
