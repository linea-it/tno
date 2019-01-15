import logging
import os
import requests
from tno.skybotoutput import Pointing as PointingDB
from sqlalchemy.sql import select, and_
from django.conf import settings
import pandas as pd


class ImportSkybot():

    def __init__(self):
        self.logger = logging.getLogger("skybot")

        self.skybot_server = "http://vo.imcce.fr/webservices/skybot/skybotconesearch_query.php"

        # Cone search radius in Degres
        self.cone_search_radius = 1.1

        # Observer Code
        self.observer_location = 'w84'

        # Filter to retrieve only objects with a position error lesser than the given value
        self.position_error = 0

        # Diretorio onde ficam os csv baixados do skybot
        self.skybot_output_path = settings.SKYBOT_OUTPUT

    def import_skybot(self):
        self.logger.info("oi")

        # Função principal

        # Passo 1 - Saber as ocultações, tabela pointings
        pointings = self.get_poitings()

        # Passo 2 - Fazer a busca no Skybot
        for pointing in pointings:
            self.get_asteroids_from_skybot(pointing)

    def get_poitings(self):
        self.logger.info("Get Pointings")

        # Conectar no banco
        db = PointingDB()

        count = db.count_pointings()

        self.logger.debug("Total de Pointings: %s" % count)

        # select expnum, date_obs, radeg, decdeg
        # from tno_pointing
        # where expnum =149263
        # group by expnum, date_obs, radeg, decdeg
        # order by expnum;
        cols = db.tbl.c

        # stm = select([cols.expnum, cols.date_obs, cols.radeg, cols.decdeg]).where(and_(cols.expnum == 149263)).group_by(cols.expnum, cols.date_obs, cols.radeg, cols.decdeg)
        stm = select([cols.expnum, cols.date_obs, cols.radeg, cols.decdeg]).group_by(
            cols.expnum, cols.date_obs, cols.radeg, cols.decdeg).order_by(cols.date_obs).limit(5)

        rows = db.fetch_all_dict(stm)

        self.logger.debug("Rows: [%s]" % rows)

        return rows

    def get_asteroids_from_skybot(self, pointing):

        # http://vo.imcce.fr/webservices/skybot/skybotconesearch_query.php?-ep=2012-11-10%2003:27:03&-ra=37.44875&-dec=-7.7992&-rd=1.1&-mime=text&-output=object&-loc=w84&-filter=0
        self.logger.info("Get asteroids from skybot")

        date_obs = pointing.get('date_obs').strftime('%Y-%m-%d %H:%M:%S')

        self.logger.debug("Expnum: [%s]" % pointing.get('expnum'))
        self.logger.debug("Date obs: [%s]" % date_obs)

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

        filename = "%s.csv" % pointing.get("expnum")

        file_path = os.path.join(self.skybot_output_path, filename)

        with open(file_path, 'w+') as csv:
            csv.write(r.text)

        if os.path.exists(file_path):
            self.logger.info("Skybot output success: [%s]" % file_path)
        else:
            self.logger.error("Skybot output failed: [%s]" % file_path)

# ----------------------------------------------//-----------------------------------

    def register_skybot_output(self):
        self.logger.info("Register skybot output")

        # Os resultados estao no diretorio em arquivos csv.

        for filename in os.listdir(self.skybot_output_path):
            if filename.endswith(".csv"):
                self.logger.debug("Filename: [ %s ]" % filename)

                self.read_skybot_output_csv(
                    os.path.join(self.skybot_output_path, filename)
                )

            break

    def read_skybot_output_csv(self, filepath):

        self.logger.info("Reading csv: [%s]" % filepath)

        headers = ["num", "name", "ra", "dec", "class", "mv", "err", "d", "dra", "ddec",
                   "dg", "dh", "phase", "sunelong", "x", "y", "z", "vx", "vy", "vz", "epoch"]

        df = pd.read_csv(filepath, skiprows=3, delimiter='|', names=headers)

        for row in df.itertuples():
            self.logger.debug("Asteroid Name: [%s]" % getattr(row, "name"))

        # self.logger.debug(df.head(5))

    def debug_query(self, stm):
        self.logger.debug("Query: [ %s ]" %
                          PointingDB().stm_to_str(stm, False))
