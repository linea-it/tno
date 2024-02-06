import requests
import os
import logging
import time
import pandas as pd
import numpy as np
from datetime import datetime, timezone
from tno.dao import AsteroidDao, AsteroidJobDao
from io import StringIO
from pathlib import Path
import traceback
import humanize
import colorlog

from tno.asteroid_table.asteroid_table_build import asteroid_table_build, import_asteroid_table
import sys
class AsteroidTableManager():

    def __init__(self, stdout=False):
        
        # self.log = logging.getLogger("asteroids")
        self.log = colorlog.getLogger('asteroids')
        if stdout:
            # consoleFormatter = logging.Formatter("[%(levelname)s] %(message)s")
            # consoleHandler = logging.StreamHandler(sys.stdout)
            consoleFormatter = colorlog.ColoredFormatter('%(log_color)s%(message)s')
            consoleHandler = colorlog.StreamHandler(sys.stdout)
            consoleHandler.setFormatter(consoleFormatter)
            self.log.addHandler(consoleHandler)

        self.job_dao = AsteroidJobDao()
        self.ast_dao = AsteroidDao()

        self.csv_filename = "asteroid_table_build.csv"
        self.path = Path("/archive/asteroid_table/")
        self.filepath = self.path.joinpath(self.csv_filename)

        self.job_id = None
        self.asteroids_before = 0
        self.asteroids_after = 0


    def run_update_asteroid_table(self):
        start = datetime.now(tz=timezone.utc)
        try:
            self.log.info("-------< New asteroid table build execution >-------")

            # Count how many asteroids are in the table
            self.asteroids_before = self.count_asteroids()
            
            # Create new job in database           
            self.job_id = self.create_job()
            
            self.log.debug(f"Asteroids before the update: [{self.asteroids_before}]")        
            
            # Create path for input and outputs files.
            self.path.mkdir(parents=True, exist_ok=True)

            # Create dataframe with asteroids
            df = asteroid_table_build(str(self.path), self.log)

            # Write the dataframe to csv file as a debug file.
            df.to_csv(self.path.joinpath("asteroid_table_debug.csv"), index=False)

            # Import dataframe to database
            self.asteroids_after = import_asteroid_table(df, self.log)

            # Write the dataframe to csv file as a backup.
            # This csv will be used by the rollback function if the next execution fails.
            df.to_csv(self.filepath, index=False)

            self.on_success()
        except Exception as e:
            self.on_failure(e)
        finally:
            self.on_complete(start)

    def count_asteroids(self):
        try:
            # Getting the number of asteroids before the update.
            count_before = self.ast_dao.count()
            
            return count_before
        except Exception as e:
            raise Exception(f"Failed to get the number of asteroids in the table. {e}")

    def create_job(self):
        try:
            job_id =  self.job_dao.insert(
                self.asteroids_before,
                str(self.filepath)
            )
            self.log.debug(f"Asteroid Job ID: [{job_id}]")
            return job_id
        except Exception as e:
            raise Exception(f"Failed to create the record in the asteroid job table. {e}")        

    def on_success(self):
        try:
            self.job_dao.update(
                self.job_id,
                status=3,
                asteroids_after=self.asteroids_after
            )
        except Exception as e:
            raise Exception(f"Failed to update the record in the asteroid job table.. {e}")    

    def on_failure(self, e):       
        trace = traceback.format_exc()        
        self.log.error(trace)

        msg = f"Asteroid table update failed. {e}"
        self.log.error(msg)

        self.job_dao.update(
            self.job_id,
            status=4,
            error=msg,
            traceback=trace
        )

        self.rollback()
        raise Exception(msg)
    
    def on_complete(self, start):
        try:
            end = datetime.now(tz=timezone.utc)
            tdelta = end - start


            new_records = self.asteroids_after - self.asteroids_before
            self.job_dao.update(
                self.job_id,
                end = end,
                exec_time = tdelta,
                new_records=new_records
            )

            self.log.info(f"Asteroid table update completed successfully.")
            self.log.info(f"Records Before Update: [{self.asteroids_before}]")
            self.log.info(f"Records After  Update: [{self.asteroids_after}]")
            self.log.info(f"New Records: [{new_records}]")

            self.log.info("Job complete in %s" %
                humanize.naturaldelta(tdelta, minimum_unit="milliseconds"))
            
        except Exception as e:
            raise Exception(f"Failed to record the end of the job in the asteroid job table. {e}")
        

    def rollback(self):
        try:
            start = datetime.now(tz=timezone.utc)
            if not self.filepath.exists():
                msg = f"Unable to perform rollback, backup file {self.filepath} does not exist."
                self.log.error(msg)
                raise Exception(msg)

            df = pd.read_csv(self.filepath)  
            rows = import_asteroid_table(df, self.log)

            end = datetime.now(tz=timezone.utc)
            tdelta = end - start

            self.log.warning("The asteroid table was recreated with data from previous runs.")
            self.log.warning("Rollback successful with %s rows affected in %s." %(rows, humanize.naturaldelta(tdelta, minimum_unit="milliseconds")))

        except Exception as e:
            raise Exception(f"Failed to rollback asteroid job table. {e}")
