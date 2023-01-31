import logging
import os
import requests
from old_apps.skybotoutput import Pointing as PointingDB
from old_apps.skybotoutput import SkybotOutput as SkybotOutputDB
from sqlalchemy.sql import select, and_, insert, desc
from django.conf import settings
from datetime import datetime
import pandas as pd


class ImportSkybot:
    def __init__(self):
        self.logger = logging.getLogger("skybot")

        self.skybot_server = (
            "http://vo.imcce.fr/webservices/skybot/skybotconesearch_query.php"
        )

        # Cone search radius in Degres
        self.cone_search_radius = 1.1

        # Observer Code
        self.observer_location = "w84"

        # Filter to retrieve only objects with a position error lesser than the given value
        self.position_error = 0

        # Diretorio onde ficam os csv baixados do skybot
        self.skybot_output_path = settings.SKYBOT_OUTPUT

        self.dbsk = SkybotOutputDB()

        self.stats = dict()

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
        stm = (
            select([cols.expnum, cols.band, cols.date_obs, cols.radeg, cols.decdeg])
            .group_by(cols.expnum, cols.band, cols.date_obs, cols.radeg, cols.decdeg)
            .order_by(cols.date_obs)
            .limit(2)
        )

        rows = db.fetch_all_dict(stm)

        self.logger.debug("Rows: [%s]" % len(rows))

        return rows

    def get_asteroids_from_skybot(self, pointing):

        try:
            ti = datetime.now()
            self.logger.debug("Tempo inicial: %s" % ti)
            # http://vo.imcce.fr/webservices/skybot/skybotconesearch_query.php?-ep=2012-11-10%2003:27:03&-ra=37.44875&-dec=-7.7992&-rd=1.1&-mime=text&-output=object&-loc=w84&-filter=0
            self.logger.info("Get asteroids from skybot")

            date_obs = pointing.get("date_obs").strftime("%Y-%m-%d %H:%M:%S")

            self.logger.debug("Expnum: [%s]" % pointing.get("expnum"))
            self.logger.debug("Date obs: [%s]" % date_obs)

            r = requests.get(
                self.skybot_server,
                params={
                    "-ep": date_obs,
                    "-ra": float(pointing.get("radeg")),
                    "-dec": float(pointing.get("decdeg")),
                    "-rd": self.cone_search_radius,
                    "-loc": self.observer_location,
                    "-mime": "text",
                    "-output": "all",
                    "-filter": self.position_error,
                },
            )

            file_id = "%s_%s" % (pointing.get("expnum"), pointing.get("band"))
            filename = "%s.csv" % (file_id)

            file_path = os.path.join(self.skybot_output_path, filename)

            with open(file_path, "w+") as csv:
                csv.write(r.text)

            if os.path.exists(file_path):
                self.logger.info("Skybot output success: [%s]" % file_path)
            else:
                self.logger.error("Skybot output failed: [%s]" % file_path)

            self.stats[file_id] = dict({"success": True})

        except Exception as e:
            self.logger.error(e)
            # self.logger.error("Internet connect not found")
            # self.logger.error("Erro: %s" % e)

        tf = datetime.now()
        self.logger.debug("Tempo Final: [ %s ]" % tf)
        time_all = tf - ti
        self.stats[file_id]["time"] = time_all.total_seconds()
        self.logger.debug(self.stats)

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

    def read_skybot_output_csv(self, filepath):

        self.logger.info("Reading csv: [%s]" % filepath)

        name = os.path.splitext(os.path.basename(filepath))[0]
        names = name.split("_")
        expnum = names[0]
        band = names[1]

        self.logger.debug("Expnum: [%s] Band [%s] " % (expnum, band))

        headers = [
            "num",
            "name",
            "ra",
            "dec",
            "dynclass",
            "mv",
            "errpos",
            "d",
            "dra",
            "ddec",
            "dg",
            "dh",
            "phase",
            "sunelong",
            "x",
            "y",
            "z",
            "vx",
            "vy",
            "vz",
            "epoch",
        ]

        df = pd.read_csv(filepath, skiprows=3, delimiter="|", names=headers)

        last_id = self.get_last_id()

        count_created = 0
        count_updated = 0

        # Para cada asteroid fazer o insert ou update
        for row in df.itertuples():
            next_id = last_id + 1

            created = self.insert_or_update_asteroid(next_id, expnum, band, row)

            if created:
                count_created += 1
            else:
                count_updated += 1

        self.logger.info("CREATED [%s] UPDATED [ %s ]" % (count_created, count_updated))
        self.logger.debug("fineshed")

    # convert ra e dec
    def HMS2deg(self, ra="", dec=""):
        RA, DEC, ds = "", "", 1
        if dec:
            D, M, S = [float(i) for i in dec.split()]
            if str(D)[0] == "-":
                ds, D = -1, abs(D)
            DEC = ds * (D + M / 60.0 + S / 3600.0)

        if ra:
            H, M, S = [float(i) for i in ra.split()]
            RA = (H + M / 60.0 + S / 3600.0) * 15.0

        return RA, DEC

    def insert_or_update_asteroid(self, next_id, expnum, band, asteroid):
        self.logger.debug(
            "Asteroid Name: [%s] Dynclass [%s]"
            % (getattr(asteroid, "name"), getattr(asteroid, "dynclass"))
        )

        db = self.dbsk
        skybot_output = db.tbl

        num = str(getattr(asteroid, "num"))
        num = num.strip()
        self.logger.debug(getattr(asteroid, "ra"))
        ra, dec = self.HMS2deg(ra=getattr(asteroid, "ra"), dec=getattr(asteroid, "dec"))
        self.logger.debug(" %s" % ra)
        name = getattr(asteroid, "name").strip()

        stm_insert = skybot_output.insert().values(
            id=next_id,
            num=num,
            name=name,
            dynclass=getattr(asteroid, "dynclass").strip(),
            ra=getattr(asteroid, "ra").strip(),
            dec=getattr(asteroid, "dec").strip(),
            # raj2000=getattr(asteroid, "raj2000"),
            # decj2000=getattr(asteroid, "decj2000"),
            raj2000=ra,
            decj2000=dec,
            mv=float(getattr(asteroid, "mv")),
            errpos=float(getattr(asteroid, "errpos")),
            d=float(getattr(asteroid, "d")),
            dracosdec=float(getattr(asteroid, "dra")),
            ddec=float(getattr(asteroid, "ddec")),
            dgeo=float(getattr(asteroid, "dg")),
            dhelio=float(getattr(asteroid, "dh")),
            phase=float(getattr(asteroid, "phase")),
            solelong=float(getattr(asteroid, "sunelong")),
            px=float(getattr(asteroid, "x")),
            py=float(getattr(asteroid, "y")),
            pz=float(getattr(asteroid, "z")),
            vx=float(getattr(asteroid, "vx")),
            vy=float(getattr(asteroid, "vy")),
            vz=float(getattr(asteroid, "vz")),
            jdref=float(getattr(asteroid, "epoch")),
            # externallink=getattr(asteroid, ""),
            externallink="link",
            expnum=expnum,
            # ccdnum=
            band=band,
        )
        # self.debug_query(stm_insert)

        created = False
        try:
            a = db.engine.execute(stm_insert)

            self.logger.debug(a)

            self.logger.info("CREATED Asteroid [ %s ]" % name)

            created = True

        except Exception as e:
            self.logger.debug("UPDATE Asteroid.")

            stm_update = (
                skybot_output.update()
                .where(
                    and_(
                        db.tbl.c.num == num,
                        db.tbl.c.name == name,
                        db.tbl.c.expnum == expnum,
                    )
                )
                .values(
                    dynclass=getattr(asteroid, "dynclass").strip(),
                    ra=getattr(asteroid, "ra").strip(),
                    dec=getattr(asteroid, "dec").strip(),
                    # raj2000=getattr(asteroid, "raj2000"),
                    # decj2000=getattr(asteroid, "decj2000"),
                    raj2000=0,
                    decj2000=0,
                    mv=float(getattr(asteroid, "mv")),
                    errpos=float(getattr(asteroid, "errpos")),
                    d=float(getattr(asteroid, "d")),
                    dracosdec=float(getattr(asteroid, "dra")),
                    ddec=float(getattr(asteroid, "ddec")),
                    dgeo=float(getattr(asteroid, "dg")),
                    dhelio=float(getattr(asteroid, "dh")),
                    phase=float(getattr(asteroid, "phase")),
                    solelong=float(getattr(asteroid, "sunelong")),
                    px=float(getattr(asteroid, "x")),
                    py=float(getattr(asteroid, "y")),
                    pz=float(getattr(asteroid, "z")),
                    vx=float(getattr(asteroid, "vx")),
                    vy=float(getattr(asteroid, "vy")),
                    vz=float(getattr(asteroid, "vz")),
                    jdref=float(getattr(asteroid, "epoch")),
                    # externallink=getattr(asteroid, ""),
                    externallink="link",
                )
            )

            # self.debug_query(stm_update)

            a = db.engine.execute(stm_update)

            self.logger.debug(a)

            self.logger.info("UPDATED Asteroid [ %s ]" % name)
            created = False

        return created

    def get_last_id(self):

        db = self.dbsk
        cols = db.tbl.c

        stm = select([cols.id]).order_by(desc(cols.id)).limit(1)
        self.debug_query(stm)
        last_id = db.fetch_scalar(stm)
        self.logger.debug("Last ID: [ %s ]" % last_id)

        return last_id

    def debug_query(self, stm):
        self.logger.debug("Query: [ %s ]" % PointingDB().stm_to_str(stm, False))


# select expnum, band, date_obs, radeg, decdeg
# from tno_pointing
# where expnum = 149267
# group by expnum, date_obs, radeg, decdeg
# order by expnum


# select * from tno_skybotoutput where expnum=149267
# select * from tno_skybotoutput where expnum=149267 and num='81793'
# select * from tno_skybotoutput where expnum=149267 and num='77962'
