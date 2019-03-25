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
import humanize
from sqlalchemy.sql import expression
from sqlalchemy.ext.compiler import compiles
from sqlalchemy.types import String

from .server import SkybotServer

# TODO investigar Custon Function no SQL ALCHEMY
# class q3c_radial_query(expression.FunctionElement):
#     type = String()


# @compiles(q3c_radial_query, 'postgresql')
# def pg_q3c_radial(element, compiler, **kw):

#     # arg1, arg2 = list(element.clauses)

#     return "q3c_radial_query('ra_cent', 'dec_cent', 37.133189, -8.416731, 2.5)"


class ImportSkybotManagement():
    def __init__(self):
        self.logger = logging.getLogger("skybot")

    def start_import_skybot(self, run_id):
        self.logger.info("Start Import Skybot Run Id [%s] " % run_id)

        current_run = SkybotRun.objects.get(pk=run_id)

        # current_run.status = 'running'
        current_run.status = 'pending'
        current_run.save()

        try:
            t0 = datetime.now()

            if current_run.type_run == 'all':
                self.logger.info("Running for all Exposures")

                SkybotServer(skybotrun=current_run).import_all_poitings()

            elif current_run.type_run == 'period':
                self.logger.info("Running Exposures with date in Period")

                SkybotServer(skybotrun=current_run).import_poitings_by_period(
                    date_initial=current_run.date_initial,
                    date_final=current_run.date_final,
                )

            elif current_run.type_run == 'circle':
                self.logger.info("Running Exposures in Cone search")

                SkybotServer(skybotrun=current_run).import_pointings_by_radial_query(
                    ra=current_run.ra_cent, dec=current_run.dec_cent, radius=current_run.radius)

            elif current_run.type_run == 'square':
                self.logger.info("Running Exposures inside a Square")

                SkybotServer(skybotrun=current_run).import_pointings_by_square_query(ra=current_run.ra_cent, dec=current_run.dec_cent,
                                                                                     ra_ul=current_run.ra_ul, dec_ul=current_run.dec_ul, ra_ur=current_run.ra_ur, dec_ur=current_run.dec_ur,
                                                                                     ra_lr=current_run.ra_lr, dec_lr=current_run.dec_lr, ra_ll=current_run.ra_ll, dec_ll=current_run.dec_ll)

            # TODO REMOVER
            current_run.status = 'pending'
            current_run.save()


            t1 = datetime.now()
            tdelta = t1 - t0
            self.logger.info("Done in %s" % humanize.naturaldelta(tdelta))

        except Exception as e:
            # TODO REMOVER
            current_run.status = 'pending'
            current_run.save()



# select expnum, band, date_obs, radeg, decdeg
# from tno_pointing
# where expnum = 149267
# group by expnum, date_obs, radeg, decdeg
# order by expnum


# select * from tno_skybotoutput where expnum=149267
# select * from tno_skybotoutput where expnum=149267 and num='81793'
# select * from tno_skybotoutput where expnum=149267 and num='77962'
