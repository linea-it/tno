from django.core.management.base import BaseCommand, CommandError
from tno.dao.asteroids import AsteroidDao
import pandas as pd
from tno.asteroid_table_build import asteroid_table_build
from io import StringIO

class Command(BaseCommand):
    help = 'Teste'

    def handle(self, *args, **options):

        # self.stdout.write("Downloading and create data csv.")
        asteroid_table_build()

        # # self.stdout.write("Deleting all records in asteroid table.")
        # db = AsteroidDao(pool=False)
        # db.reset_table()

        # f = open("/archive/asteroid_table/asteroid_table_build.csv", "r")
        # data = StringIO(f.read())
        # data.seek(0)
        # rows = db.import_asteroids(data, delimiter=",")
        # print(f"Rows imported: {rows}")
