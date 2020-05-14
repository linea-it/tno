from django.core.management.base import BaseCommand, CommandError
from django.db import connection
from tno.models import Pointing, SkybotOutput
from des.models import Exposure, Ccd

class Command(BaseCommand):
    help = 'Table preparation for Q3C.'


    def handle(self, *args, **options):

        # Criar index para tabela Pointing
        self.create_index_poiting()

        # Criar index para tabela Skybotoutput
        self.create_index_skybotoutput()

        # Criar index para tabela des/Exposure
        self.create_index_des_exposure()

        # Criar index para tabela des/Cccd
        self.create_index_des_ccd()


        self.stdout.write("Done!")

    def create_index_poiting(self):

        tbl = Pointing._meta.db_table

        with connection.cursor() as cursor:

            self.stdout.write("Q3C Table Peparation for [ %s ]" % tbl)

            cursor.execute("CREATE INDEX ON %s (q3c_ang2ipix(radeg, decdeg))" % tbl)

            cursor.execute("CLUSTER %s_q3c_ang2ipix_idx ON %s" % (tbl, tbl))

            cursor.execute("ANALYZE %s" % tbl)

            self.stdout.write("Created Index q3c_ang2ipix for [ %s ]" % tbl)

    def create_index_skybotoutput(self):

        tbl = SkybotOutput._meta.db_table

        with connection.cursor() as cursor:

            self.stdout.write("Q3C Table Peparation for [ %s ]" % tbl)

            cursor.execute("CREATE INDEX ON %s (q3c_ang2ipix(raj2000, decj2000))" % tbl)

            cursor.execute("CLUSTER %s_q3c_ang2ipix_idx ON %s" % (tbl, tbl))

            cursor.execute("ANALYZE %s" % tbl)

            self.stdout.write("Created Index q3c_ang2ipix for [ %s ]" % tbl)

    def create_index_des_exposure(self):

        tbl = Exposure._meta.db_table

        with connection.cursor() as cursor:

            self.stdout.write("Q3C Table Peparation for [ %s ]" % tbl)

            cursor.execute("CREATE INDEX ON %s (q3c_ang2ipix(radeg, decdeg))" % tbl)

            cursor.execute("CLUSTER %s_q3c_ang2ipix_idx ON %s" % (tbl, tbl))

            cursor.execute("ANALYZE %s" % tbl)

            self.stdout.write("Created Index q3c_ang2ipix for [ %s ]" % tbl)            

    def create_index_des_ccd(self):

        tbl = Ccd._meta.db_table

        with connection.cursor() as cursor:

            self.stdout.write("Q3C Table Peparation for [ %s ]" % tbl)

            cursor.execute("CREATE INDEX ON %s (q3c_ang2ipix(ra_cent, dec_cent))" % tbl)

            cursor.execute("CLUSTER %s_q3c_ang2ipix_idx ON %s" % (tbl, tbl))

            cursor.execute("ANALYZE %s" % tbl)

            self.stdout.write("Created Index q3c_ang2ipix for [ %s ]" % tbl)                        