from sqlalchemy import create_engine, Table, MetaData
from sqlalchemy.sql import select, delete, update, and_
import collections
from config import *
import datetime


class Dao:

    con = None

    def get_db_engine(self):

        engine = create_engine(
            "postgresql+psycopg2://%s:%s@%s:%s/%s"
            % (DB_USER, DB_PASS, DB_HOST, DB_PORT, DB_NAME)
        )

        return engine

    def get_con(self):
        if self.con is None:
            engine = self.get_db_engine()
            self.con = engine.connect()

        return self.con

    def get_table(self, tablename, schema=None):
        engine = self.get_db_engine()
        tbl = Table(tablename, MetaData(engine), autoload=True, schema=schema)
        return tbl

    def fetch_all_dict(self, stm):
        engine = self.get_db_engine()
        with engine.connect() as con:

            queryset = con.execute(stm)

            rows = list()
            for row in queryset:
                d = dict(collections.OrderedDict(row))
                rows.append(d)

            return rows

    def fetch_one_dict(self, stm):
        engine = self.get_db_engine()
        with engine.connect() as con:

            queryset = con.execute(stm).fetchone()

            if queryset is not None:
                d = dict(collections.OrderedDict(queryset))
                return d
            else:
                return None

    def get_job_by_id(self, id):

        tbl = self.get_table(tablename="des_astrometryjob")
        stm = select(tbl.c).where(and_(tbl.c.id == int(id)))

        return self.fetch_one_dict(stm)

    def import_with_copy_expert(self, sql, data):
        """
            This method is recommended for importing large volumes of data. using the postgresql COPY method.

            The method is useful to handle all the parameters that PostgreSQL makes available
            in COPY statement: https://www.postgresql.org/docs/current/sql-copy.html

            it is necessary that the from clause is reading from STDIN.

            example:
            sql = COPY <table> (<columns) FROM STDIN with (FORMAT CSV, DELIMITER '|', HEADER);

            Parameters:
                sql (str): The sql statement should be in the form COPY table '.
                data (file-like ): a file-like object to read or write
            Returns:
                rowcount (int):  the number of rows that the last execute*() produced (for DQL statements like SELECT) or affected (for DML statements like UPDATE or INSERT)

        References:
            https://www.psycopg.org/docs/cursor.html#cursor.copy_from
            https://stackoverflow.com/questions/30050097/copy-data-from-csv-to-postgresql-using-python
            https://stackoverflow.com/questions/13125236/sqlalchemy-psycopg2-and-postgresql-copy
        """
        connection = self.get_db_engine().raw_connection()
        try:
            cursor = connection.cursor()
            cursor.copy_expert(sql, data)
            connection.commit()

            cursor.close()
            return cursor.rowcount
        except Exception as e:
            connection.rollback()
            raise (e)
        finally:
            connection.close()


class AsteroidDao(Dao):
    def __init__(self):
        super(AsteroidDao, self).__init__()

        self.tbl = self.get_table("tno_asteroid")

    def get_asteroids_by_names(self, names):

        stm = select(self.tbl.c).where(and_(self.tbl.c.name.in_(names)))

        rows = self.fetch_all_dict(stm)

        return rows

    def get_asteroids_by_dynclass(self, dynclass):

        stm = select(self.tbl.c).where(and_(self.tbl.c.base_dynclass == dynclass))

        rows = self.fetch_all_dict(stm)

        return rows

    def ccds_by_asteroid(self, asteroid_name):

        # des_exposure
        de = self.get_table("des_exposure")
        # des_ccd
        dc = self.get_table("des_ccd")
        # Des skybot position
        ds = self.get_table("des_skybotposition")
        # Skybot Position
        sp = self.get_table("skybot_position")

        # Clausula where pelo nome do objeto OBRIGATORIO.
        clause = list([sp.c.name == asteroid_name])

        columns = [dc.c.id, de.c.date_obs, de.c.exptime, dc.c.path, dc.c.filename]

        stm = (
            select(columns)
            .select_from(
                ds.join(sp, ds.c.position_id == sp.c.id)
                .join(dc, ds.c.ccd_id == dc.c.id)
                .join(de, ds.c.exposure_id == de.c.id)
            )
            .where(and_(and_(*clause)))
        )

        rows = self.fetch_all_dict(stm)

        return rows


class ObservationDao(Dao):
    def __init__(self):
        super(ObservationDao, self).__init__()

        self.tbl = self.get_table("des_observation")

    def delete_by_asteroid_name(self, name):

        stm = delete(self.tbl).where(and_(self.tbl.c.name == name))

        engine = self.get_db_engine()
        with engine.connect() as con:
            rows = con.execute(stm)

            return rows


class AstrometryJobDao(Dao):
    def __init__(self):
        super(AstrometryJobDao, self).__init__()

        self.tbl = self.get_table("des_astrometryjob")

    def get_job_by_id(self, id):

        stm = select(self.tbl.c).where(and_(tbl.c.id == int(id)))

        return self.fetch_one_dict(stm)

    def update_job(self, job):

        stm = (
            update(self.tbl)
            .where(and_(self.tbl.c.id == int(job["id"])))
            .values(
                status=job["status"],
                start=job["start"],
                finish=job["end"],
                execution_time=datetime.timedelta(seconds=job["exec_time"]),
                error=job["error"],
                traceback=job["traceback"],
            )
        )

        engine = self.get_db_engine()
        with engine.connect() as con:
            return con.execute(stm)
