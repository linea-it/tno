from django.core.management.base import BaseCommand, CommandError
from tno.dao.asteroids import AsteroidDao
import pandas as pd

class Command(BaseCommand):
    help = 'Teste'

    def handle(self, *args, **options):

        self.stdout.write("Testing")
         
        db = AsteroidDao(pool=False)
        result = db.reset_table()
        print(result)


        df = pd.read_csv('/archive/asteroid_table/teste.csv')

        # df = pd.read_csv('/archive/asteroid_table/asteroid_table_build.csv')
        print(df.head())

        print(df.columns.values.tolist())

        for row_dict in df.to_dict(orient="records"):
            print(row_dict)