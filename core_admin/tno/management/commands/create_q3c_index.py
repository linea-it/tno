from django.core.management.base import BaseCommand, CommandError
from django.db import connection
from des.models import Exposure, Ccd
from skybot.models import Position

class Command(BaseCommand):
    help = 'Table preparation for Q3C.'


    def handle(self, *args, **options):

        # Drop todos os index q3c 
        self.clear_all_q3c_index()

        # # Criar index para tabela Pointing
        # self.create_index_poiting()

        # Criar index para tabela Skybot Positions
        self.create_index_skybot_position()

        # Criar index para tabela des/Exposure
        self.create_index_des_exposure()

        # Criar index para tabela des/Cccd
        self.create_index_des_ccd()


        self.stdout.write("Done!")


    def clear_all_q3c_index(self):
        """Apaga todos os index de q3c que tenham sido criado usando por esta classe. 
        usa o suffixo da get_indes_name como condição.
        """
        with connection.cursor() as cursor:

            sql = "SELECT c.relname FROM pg_class c JOIN pg_namespace n ON n.oid = c.relnamespace WHERE c.relname like '%_q3c_ang2ipix_idx%'"

            cursor.execute(sql)
            for idx in cursor.fetchall():
                cursor.execute("DROP INDEX IF EXISTS %s;" % idx)
                self.stdout.write("DROPED Index [ %s ]" % idx)


    def get_index_name(self, table):
        return "%s_q3c_ang2ipix_idx" % table


    # def create_index_poiting(self):

    #     tbl = Pointing._meta.db_table
    #     idx_name = self.get_index_name(tbl)

    #     with connection.cursor() as cursor:
            
    #         self.stdout.write("Q3C Table Preparation for [ %s ]" % tbl)

    #         cursor.execute("CREATE INDEX %s ON %s (q3c_ang2ipix(radeg, decdeg))" % (idx_name, tbl))

    #         cursor.execute("CLUSTER %s ON %s" % (idx_name, tbl))

    #         cursor.execute("ANALYZE %s" % tbl)

    #         self.stdout.write("Created Index q3c_ang2ipix for [ %s ]" % tbl)

    def create_index_skybot_position(self):

        tbl = Position._meta.db_table
        idx_name = self.get_index_name(tbl)

        with connection.cursor() as cursor:

            self.stdout.write("Q3C Table Preparation for [ %s ]" % tbl)

            cursor.execute("CREATE INDEX %s ON %s (q3c_ang2ipix(raj2000, decj2000))" % (idx_name, tbl))

            cursor.execute("CLUSTER %s ON %s" % (idx_name, tbl))

            cursor.execute("ANALYZE %s" % tbl)

            self.stdout.write("Created Index q3c_ang2ipix for [ %s ]" % tbl)

    def create_index_des_exposure(self):

        tbl = Exposure._meta.db_table
        idx_name = self.get_index_name(tbl)

        with connection.cursor() as cursor:

            self.stdout.write("Q3C Table Preparation for [ %s ]" % tbl)

            cursor.execute("CREATE INDEX %s ON %s (q3c_ang2ipix(radeg, decdeg))" % (idx_name, tbl))

            cursor.execute("CLUSTER %s ON %s" % (idx_name, tbl))

            cursor.execute("ANALYZE %s" % tbl)

            self.stdout.write("Created Index q3c_ang2ipix for [ %s ]" % tbl)            

    def create_index_des_ccd(self):

        tbl = Ccd._meta.db_table
        idx_name = self.get_index_name(tbl)

        with connection.cursor() as cursor:

            self.stdout.write("Q3C Table Preparation for [ %s ]" % tbl)

            cursor.execute("CREATE INDEX %s ON %s (q3c_ang2ipix(ra_cent, dec_cent))" % (idx_name, tbl))

            cursor.execute("CLUSTER %s ON %s" % (idx_name, tbl))

            cursor.execute("ANALYZE %s" % tbl)

            self.stdout.write("Created Index q3c_ang2ipix for [ %s ]" % tbl)                        