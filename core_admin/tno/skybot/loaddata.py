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
from tno.models import Pointing as PointingModel

from sqlalchemy.sql import expression
from sqlalchemy.ext.compiler import compiles
from sqlalchemy.types import String

class ImportSkybot():

    def __init__(self):
        self.logger = logging.getLogger("skybot_load_data")
        try:
            self.dbsk = SkybotOutputDB()
        except Exception as e:
            self.logger.error(e)

    def read_skybot_output_csv(self, file_path):

        t0 = datetime.now()

        self.logger.info("Reading csv: [%s]" % file_path)

        name = os.path.splitext(os.path.basename(file_path))[0]
        names = name.split('_')
        expnum = names[0]
        band = names[1]

        self.logger.debug("Expnum: [%s] Band [%s] " % (expnum, band))

        headers = ["num", "name", "ra", "dec", "dynclass", "mv", "errpos", "d", "dra", "ddec",
                   "dg", "dh", "phase", "sunelong", "x", "y", "z", "vx", "vy", "vz", "epoch"]

        df = pd.read_csv(file_path, skiprows=3, delimiter='|', names=headers)

        last_id = self.get_last_id()

        count_created = 0
        count_updated = 0
        count_rows = df.shape[0]

        # Para cada asteroid fazer o insert ou update
        for row in df.itertuples():
            next_id = last_id + 1

            created = self.insert_or_update_asteroid(
                next_id, expnum, band, row)

            if created:
                count_created += 1
            else:
                count_updated += 1

        self.logger.info("CREATED [%s] UPDATED [ %s ]" %
                         (count_created, count_updated))
        
        t1 = datetime.now()
        tdelta = t1 - t0

        return dict({
            'import_start': t0.strftime("%Y-%m-%d %H:%M:%S.%f")[:-3],
            'import_finish': t1.strftime("%Y-%m-%d %H:%M:%S.%f")[:-3],
            'import_time': tdelta.total_seconds(),
            'count_created': count_created,
            'count_updated': count_updated,
            'count_rows': count_rows 
        })


    # convert ra e dec
    def HMS2deg(self, ra='', dec=''):
        RA, DEC, ds = '', '', 1
        if dec:
            D, M, S = [float(i) for i in dec.split()]
            if str(D)[0] == '-':
                ds, D = -1, abs(D)
            DEC = ds*(D + M/60. + S/3600.)

        if ra:
            H, M, S = [float(i) for i in ra.split()]
            RA = (H + M/60. + S/3600.)*15.

        return RA, DEC

    def insert_or_update_asteroid(self, next_id, expnum, band, asteroid):
        self.logger.debug("Asteroid Name: [%s] Dynclass [%s]" % (
            getattr(asteroid, "name"), getattr(asteroid, "dynclass")))

        db = self.dbsk
        skybot_output = db.tbl

        # con = db.engine.connect()
        # with con.begin():

        num = str(getattr(asteroid, "num"))
        num = num.strip()

        ra, dec = self.HMS2deg(ra=getattr(asteroid, "ra"),
                            dec=getattr(asteroid, "dec"))

        name = getattr(asteroid, "name").strip()

        # Get Pointing
        pointing = PointingModel.objects.get(expnum=232737)

        try:
            stm_insert = skybot_output.insert().values(
                # id=next_id,
                num=num,
                name=name,
                pointing_id=pointing.pk,
                dynclass=getattr(asteroid, "dynclass").strip(),
                ra=getattr(asteroid, "ra").strip(),
                dec=getattr(asteroid, "dec").strip(),
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
                band=band
            )
            self.debug_query(stm_insert)

            a = db.engine.execute(stm_insert)

            created = True

            self.logger.debug("CREATED Asteroid [ %s ]" % name)

        except Exception as e:
            try:
                stm_update = skybot_output.update().where(
                    and_(
                        db.tbl.c.num == num,
                        db.tbl.c.name == name,
                        db.tbl.c.expnum == expnum,
                    )
                ).values(
                    pointing_id=pointing.pk,
                    dynclass=getattr(asteroid, "dynclass").strip(),
                    ra=getattr(asteroid, "ra").strip(),
                    dec=getattr(asteroid, "dec").strip(),
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
                    band=band
                )

                self.debug_query(stm_update)

                a = db.engine.execute(stm_update)
                if a.rowcount == 1:
                    created = False
                    self.logger.info("UPDATED Asteroid [ %s ]" % name)
                else:
                    self.logger.warn("Update not affect correct row. Rowcount [%s]" % a.rowcount)
                    created = False
                    
            except Exception as e:
                self.logger.error(e)
                raise e

        return created

    def get_last_id(self):

        db = self.dbsk
        cols = db.tbl.c

        stm = select([cols.id]).order_by(desc(cols.id)).limit(1)
        # self.debug_query(stm)
        
        last_id = db.fetch_scalar(stm)
        self.logger.debug("Last ID: [ %s ]" % last_id)

        if last_id is None:
            return 1
            
        return last_id

    def debug_query(self, stm):
        self.logger.debug("Query: [ %s ]" %
                          PointingDB().stm_to_str(stm, False))