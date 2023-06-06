from django.core.management.base import BaseCommand, CommandError
from django.db import connection
from des.models import Exposure, Ccd
from skybot.models import Position
from tno.models import Occultation


class Command(BaseCommand):
    help = "Table preparation for Q3C."

    def add_arguments(self, parser):
        # Named (optional) arguments
        parser.add_argument(
            "--table",
            # action='store_true',
            help="Create index only for this table",
        )

    def handle(self, *args, **options):

        if options["table"]:
            if options["table"] == "occultation":
                # Criar index para tabela tno_occultation
                self.create_index_occultation()

        else:
            # Cria index em todas as tabelas

            # Drop todos os index q3c
            self.clear_all_q3c_index()

            # Criar index para tabela Skybot Positions
            self.create_index_skybot_position()

            # Criar index para tabela des/Exposure
            self.create_index_des_exposure()

            # Criar index para tabela des/Cccd
            self.create_index_des_ccd()

            # Criar index para tabela tno_occultation
            self.create_index_occultation()

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

    def create_index_skybot_position(self):

        tbl = Position._meta.db_table
        idx_name = self.get_index_name(tbl)

        with connection.cursor() as cursor:

            self.stdout.write("Q3C Table Preparation for [ %s ]" % tbl)

            cursor.execute(
                "CREATE INDEX %s ON %s (q3c_ang2ipix(raj2000, decj2000))"
                % (idx_name, tbl)
            )

            cursor.execute("CLUSTER %s ON %s" % (idx_name, tbl))

            cursor.execute("ANALYZE %s" % tbl)

            self.stdout.write("Created Index q3c_ang2ipix for [ %s ]" % tbl)

    def create_index_des_exposure(self):

        tbl = Exposure._meta.db_table
        idx_name = self.get_index_name(tbl)

        with connection.cursor() as cursor:

            self.stdout.write("Q3C Table Preparation for [ %s ]" % tbl)

            cursor.execute(
                "CREATE INDEX %s ON %s (q3c_ang2ipix(radeg, decdeg))" % (idx_name, tbl)
            )

            cursor.execute("CLUSTER %s ON %s" % (idx_name, tbl))

            cursor.execute("ANALYZE %s" % tbl)

            self.stdout.write("Created Index q3c_ang2ipix for [ %s ]" % tbl)

    def create_index_des_ccd(self):

        tbl = Ccd._meta.db_table
        idx_name = self.get_index_name(tbl)

        with connection.cursor() as cursor:

            self.stdout.write("Q3C Table Preparation for [ %s ]" % tbl)

            cursor.execute(
                "CREATE INDEX %s ON %s (q3c_ang2ipix(ra_cent, dec_cent))"
                % (idx_name, tbl)
            )

            cursor.execute("CLUSTER %s ON %s" % (idx_name, tbl))

            cursor.execute("ANALYZE %s" % tbl)

            self.stdout.write("Created Index q3c_ang2ipix for [ %s ]" % tbl)

    def create_index_occultation(self):

        tbl = Occultation._meta.db_table
        idx_name = self.get_index_name(tbl)

        idx_name_1 = idx_name + "_1"

        with connection.cursor() as cursor:

            self.stdout.write("Q3C Table Preparation for [ %s ]" % tbl)

            cursor.execute(
                "CREATE INDEX %s ON %s (q3c_ang2ipix(ra_star_deg, dec_star_deg))"
                % (idx_name, tbl)
            )

            cursor.execute("CLUSTER %s ON %s" % (idx_name, tbl))

            cursor.execute(
                "CREATE INDEX %s ON %s (q3c_ang2ipix(ra_target_deg, dec_target_deg))"
                % (idx_name_1, tbl)
            )
            cursor.execute("CLUSTER %s ON %s" % (idx_name_1, tbl))

            cursor.execute("ANALYZE %s" % tbl)

            self.stdout.write("Created Index q3c_ang2ipix for [ %s ]" % tbl)
