from django.core.management.base import BaseCommand, CommandError
from tno.dao import AsteroidDao, AsteroidJobDao
import pandas as pd
from io import StringIO
from datetime import datetime, timezone

from tno.asteroid_table.asteroid_table_build import asteroid_table_build
from tno.asteroid_table.asteroid_table_manager import AsteroidTableManager
class Command(BaseCommand):
    help = 'Teste'

    def handle(self, *args, **options):

        # start = datetime.now(tz=timezone.utc)
        self.stdout.write("Downloading and create data csv.")

        atm = AsteroidTableManager()
        atm.run_update_asteroid_table()

        # asteroid_table_build()
        # ast_dao = AsteroidDao(False)
        # count_before = ast_dao.count()
        # print(f"Count Before: {count_before}")


        # job_dao = AsteroidJobDao(False)
        # job_id = job_dao.insert(
        #     count_before,
        #     "/teste"
        # )
        # print(f"Job ID: {job_id}")
        # end = datetime.now(tz=timezone.utc)
        # dt = end - start
        # job_dao.update(
        #     job_id,
        #     status=4,
        #     end=end,
        #     asteroids_after=10,
        #     exec_time=dt,
        #     error="djisjdiasjdi",
        #     traceback="jdjijksjdkskdasjk"
        # )


        # # self.stdout.write("Deleting all records in asteroid table.")
        # db = AsteroidDao(pool=False)
        # db.reset_table()

        # f = open("/archive/asteroid_table/asteroid_table_build.csv", "r")
        # data = StringIO(f.read())
        # data.seek(0)
        # rows = db.import_asteroids(data, delimiter=",")
        # print(f"Rows imported: {rows}")
