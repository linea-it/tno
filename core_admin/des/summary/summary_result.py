import logging
import traceback
from datetime import datetime

import humanize
import pandas as pd

from des.models import SkybotByYear
from des.models import SkybotByDynclass

from des.dao import (
    ExposureDao,
    CcdDao,
    DesSkybotJobResultDao,
    SkybotByYearDao,
    DesSummaryDynclassDao,
)
from des.dao import SkybotByDynclassDao, DesSkybotPositionDao


class SummaryResult:
    def __init__(self):
        self.logger = logging.getLogger("skybot_load_data")

    def by_job(self, job_id):

        t0 = datetime.now()
        self.logger.info("".ljust(50, "-"))
        self.logger.info("By Job Started [%s]" % t0.strftime("%Y-%m-%d %H:%M:%S"))

        dao = DesSkybotJobResultDao(pool=False)

        # Get asteroids by dynclass of the job
        asteroids = dao.dynclass_asteroids_by_job(job_id)

        if len(asteroids) == 0:
            self.logger.warning("SummaryResult::by_job -> No results found.")
            return

        # Get ccds by dynclass of the job
        ccds = dao.dynclass_ccds_by_job(job_id)

        # Get positions by dynclass of the job
        positions = dao.dynclass_positions_by_job(job_id)

        # Create a dataframe of asteroids
        df_asteroids = pd.DataFrame(asteroids)
        df_asteroids.set_index("dynclass")
        df_asteroids = df_asteroids.fillna(0)

        # Create a dataframe of ccds
        df_ccds = pd.DataFrame(ccds)
        df_ccds.set_index("dynclass")
        df_ccds = df_ccds.fillna(0)

        # Create a dataframe of positions
        df_positions = pd.DataFrame(positions)
        df_positions.set_index("dynclass")
        df_positions = df_positions.fillna(0)

        # Merge all three dataframes
        df = pd.concat([df_asteroids, df_ccds, df_positions], axis=1)
        df = df.fillna(0)
        # df = df.rename(columns={'index': 'dynclass'})

        # Initialize bands with zero
        df["g"] = 0
        df["r"] = 0
        df["i"] = 0
        df["z"] = 0
        df["Y"] = 0
        df["u"] = 0

        # Remove columnn duplicates
        df = df.loc[:, ~df.columns.duplicated()]

        for i in range(len(df)):
            dynclass = str(df.iloc[i, 0])
            bands = dao.dynclass_band_by_job(job_id, dynclass)

            for band in bands:
                df.at[i, str(band["band"])] = int(band["positions"])

        # Rename the column Y to y
        # because the database doesn't allow uppercase columns
        df = df.rename(columns={"Y": "y"})

        # Fill Job ID column
        df["job_id"] = job_id

        dsd = DesSummaryDynclassDao(pool=False)
        dsd.import_data(df)

        self.logger.info('Imported into "des_summarydynclass" table')

        # Job end time
        t1 = datetime.now()

        # Job time delta
        tdelta = t1 - t0

        self.logger.info("By Job Finished [%s]" % t1.strftime("%Y-%m-%d %H:%M:%S"))
        self.logger.info(
            "By Job Execution Time: [%s]"
            % humanize.naturaldelta(tdelta, minimum_unit="seconds")
        )

    def run_by_year(self):

        t0 = datetime.now()
        self.logger.info("".ljust(50, "-"))
        self.logger.info("By Year Started [%s]" % t0.strftime("%Y-%m-%d %H:%M:%S"))

        # Years to run
        years = {
            "2012": ["2012-11-10", "2012-12-31"],
            "2013": ["2013-01-01", "2013-12-31"],
            "2014": ["2014-01-01", "2014-12-31"],
            "2015": ["2015-01-01", "2015-12-31"],
            "2016": ["2016-01-01", "2016-12-31"],
            "2017": ["2017-01-01", "2017-12-31"],
            "2018": ["2018-01-01", "2018-12-31"],
            "2019": ["2019-01-01", "2019-12-31"],
        }

        epdao = ExposureDao(pool=False)
        ccdao = CcdDao(pool=False)
        dsdao = DesSkybotJobResultDao(pool=False)

        rows = []

        for year in years:

            start = datetime.strptime(years[year][0], "%Y-%m-%d").strftime(
                "%Y-%m-%d 00:00:00"
            )

            end = datetime.strptime(years[year][1], "%Y-%m-%d").strftime(
                "%Y-%m-%d 23:59:59"
            )

            # Total nights with exposures by period
            nights = epdao.count_nights_by_period(start, end)

            # Total exposures by period
            exposures = epdao.count_exposures_by_period(start, end)

            # Total CCDs with exposures by period
            ccds = ccdao.count_ccds_by_period(start, end)

            # Total nights analyzed by period
            nights_analyzed = dsdao.count_nights_analyzed_by_period(start, end)

            # Total exposures analyzed by period
            exposures_analyzed = dsdao.count_exposures_analyzed_by_period(start, end)

            # Total ccds analyzed by period
            ccds_analyzed = dsdao.count_ccds_analyzed_by_period(start, end)

            rows.append(
                {
                    "year": year,
                    "nights": nights,
                    "exposures": exposures,
                    "ccds": ccds,
                    "nights_analyzed": nights_analyzed,
                    "exposures_analyzed": exposures_analyzed,
                    "ccds_analyzed": ccds_analyzed,
                }
            )

            self.logger.info(
                "[%s] Year, [%s] Nights, [%s] Exposures, [%s] CCDs, [%s] Nights Analyzed, [%s] Exposures Analyzed and [%s] CCDs Analyzed"
                % (
                    year,
                    nights,
                    exposures,
                    ccds,
                    nights_analyzed,
                    exposures_analyzed,
                    ccds_analyzed,
                )
            )

            self.logger.info("Year Rows [%s]" % len(rows))

        df = pd.DataFrame.from_records(
            rows,
            columns=[
                "year",
                "nights",
                "exposures",
                "ccds",
                "nights_analyzed",
                "exposures_analyzed",
                "ccds_analyzed",
            ],
        )

        # Cleaning table before import
        SkybotByYear.objects.all().delete()
        self.logger.info('Deleted "des_skybotbyyear" table')

        dydao = SkybotByYearDao(pool=False)

        # Copying dataframe into database
        dydao.import_data(df)
        self.logger.info('Imported into "des_skybotbyyear" table')

        # Job end time
        t1 = datetime.now()

        # Job time delta
        tdelta = t1 - t0

        self.logger.info("Finished By Year [%s]" % t1.strftime("%Y-%m-%d %H:%M:%S"))
        self.logger.info(
            "By Year Execution Time: [%s]"
            % humanize.naturaldelta(tdelta, minimum_unit="seconds")
        )

    def run_by_dynclass(self):

        t0 = datetime.now()
        self.logger.info("".ljust(50, "-"))
        self.logger.info("By Dynclass Started [%s]" % t0.strftime("%Y-%m-%d %H:%M:%S"))

        # List of all dynamic classes
        dynclasses = [
            "Centaur",
            "Comet",
            "Hungaria",
            "KBO",
            "MB",
            "Mars-Crosser",
            "NEA",
            "Planet",
            "Trojan",
        ]

        rows = []

        dpdao = DesSkybotPositionDao(pool=False)

        for dynclass in dynclasses:

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
                "g": 0,
                "i": 0,
                "r": 0,
                "u": 0,
                "Y": 0,
                "z": 0,
            }

            # Change the dictionary structure to have each band
            # as a column later on a dataframe
            for band in bands:
                bands_dict = {
                    # Spread properties to allow zero values
                    **bands_dict,
                    band["band"]: band["asteroids"],
                }

            rows.append(
                {
                    "dynclass": dynclass,
                    "nights": nights,
                    "ccds": ccds,
                    "asteroids": asteroids,
                    "positions": positions,
                    **bands_dict,
                }
            )

            self.logger.info(
                "[%s] Dynclass, [%s] Nights, [%s] CCDs, [%s] Asteroids, [%s] Positions, [%s] Band u, [%s] Band g, [%s] Band r, [%s] Band i, [%s] Band z and [%s] Band Y"
                % (
                    dynclass,
                    nights,
                    ccds,
                    asteroids,
                    positions,
                    bands_dict["u"],
                    bands_dict["g"],
                    bands_dict["r"],
                    bands_dict["i"],
                    bands_dict["z"],
                    bands_dict["Y"],
                )
            )

            self.logger.info("Dynclass Rows [%s]" % len(rows))

        df = pd.DataFrame.from_records(
            rows,
            columns=[
                "dynclass",
                "nights",
                "ccds",
                "asteroids",
                "positions",
                "g",
                "i",
                "r",
                "u",
                "Y",
                "z",
            ],
        )

        # Rename the column Y to y
        # because the database doesn't allow uppercase columns
        df.rename(columns={"Y": "y"})

        # Cleaning table before import
        SkybotByDynclass.objects.all().delete()
        self.logger.info('Deleted "des_skybotbydynclass" table')

        dddao = SkybotByDynclassDao(pool=False)

        # Copying dataframe into database
        dddao.import_data(df)
        self.logger.info('Imported into "des_skybotbydynclass" table')

        # Job end time
        t1 = datetime.now()

        # Job time delta
        tdelta = t1 - t0

        self.logger.info("Finished [%s]" % t1.strftime("%Y-%m-%d %H:%M:%S"))
        self.logger.info(
            "By Dynclass Execution Time: [%s]"
            % humanize.naturaldelta(tdelta, minimum_unit="seconds")
        )
