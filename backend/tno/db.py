import collections
import logging
import os
import warnings

from django.conf import settings
from sqlalchemy import (
    Boolean,
    Column,
    Float,
    Integer,
    MetaData,
    String,
    Table,
    create_engine,
)
from sqlalchemy import exc as sa_exc
from sqlalchemy import func, inspect

# from sqlalchemy.dialects import oracle
from sqlalchemy.dialects import postgresql, sqlite
from sqlalchemy.ext.compiler import compiles
from sqlalchemy.pool import NullPool
from sqlalchemy.schema import Sequence
from sqlalchemy.sql import and_, select, text
from sqlalchemy.sql.expression import ClauseElement, Executable, between, literal_column


class DBBase:

    def __init__(
        self,
        pool=False,
        db_name="default",
    ):
        self.db_name = db_name

        with warnings.catch_warnings():
            warnings.simplefilter("ignore", category=sa_exc.SAWarning)
            if pool is False:
                self.engine = create_engine(self.get_db_uri(), poolclass=NullPool)
            else:
                self.engine = create_engine(
                    self.get_db_uri(), connect_args={"options": "-c timezone=utc"}
                )

        self.current_dialect = None

        self.inspect = inspect(self.engine)

        self.logger = logging.getLogger("django")

    def get_db_uri(self):
        db_admin = settings.DATABASES[self.db_name]

        # postgresql+psycopg2
        db_uri = "postgresql+psycopg2://%s:%s@%s:%s/%s" % (
            db_admin["USER"],
            db_admin["PASSWORD"],
            db_admin["HOST"],
            db_admin["PORT"],
            db_admin["NAME"],
        )

        self.current_dialect = postgresql.dialect()

        return db_uri

    def get_database(self):
        if "NAME" in settings.DATABASES[self.db_name]:
            return settings.DATABASES[self.db_name]["NAME"]
        else:
            return None

    def get_base_schema(self):
        schema = None
        # Considerando esse parametro em Settings DATABASES
        # "OPTIONS": {"options": "-c search_path=<DB_SCHEMA>,public"},
        if "options" in settings.DATABASES[self.db_name]["OPTIONS"]:
            options = settings.DATABASES[self.db_name]["OPTIONS"]["options"]
            schema = options[options.find("=") + 1 : options.rfind(",")]

        return schema

    def get_engine(self):
        return self.engine

    def get_table(self, tablename, schema=None):
        with warnings.catch_warnings():
            warnings.simplefilter("ignore")
            tbl = Table(tablename, MetaData(self.engine), autoload=True, schema=schema)

            return tbl

    def to_dict(self, row):
        return dict(collections.OrderedDict(row))

    def execute(self, stm):
        with warnings.catch_warnings():
            warnings.simplefilter("ignore", category=sa_exc.SAWarning)
            with self.engine.connect() as con:
                return con.execute(stm)

    def fetch_all_dict(self, stm, log=True):

        with self.engine.connect() as con:
            queryset = con.execute(stm)

            if settings.DEBUG is True and log is True:
                self.debug_query(stm, True)

            rows = []
            for row in queryset:
                rows.append(self.to_dict(row))

            return rows

    def fetch_one_dict(self, stm):
        with self.engine.connect() as con:
            queryset = con.execute(stm).fetchone()

            if settings.DEBUG:
                self.debug_query(stm, True)

            if queryset != None:
                return self.to_dict(queryset)
            else:
                return None

    def fetch_scalar(self, stm):
        if settings.DEBUG:
            self.debug_query(stm, True)

        with self.engine.connect() as con:
            return con.execute(stm).scalar()

    def fetch_scalars(self, stm, log=True):
        if settings.DEBUG is True and log is True:
            self.debug_query(stm, True)

        with self.engine.connect() as con:
            return list(con.execute(stm).scalars())

    def stm_count(self, stm):
        with self.engine.connect() as con:
            # Over para que a contagem seja feita no final da query em casos
            # que tenham counts ou distincts
            stm_count = (
                stm.with_only_columns([func.count().over().label("totalCount")])
                .limit(None)
                .offset(None)
            )
            count = con.execute(stm_count).scalar()

            if settings.DEBUG:
                self.debug_query(stm_count, True)

            return count

    def get_count(self, table):
        """
        Args:
            table (Object): instancia de SqlAchemy Table.
        Returns:
            count (int): Total de registros na tabela.
        """
        with self.engine.connect() as con:
            stm = select([func.count("*")]).select_from(table)

            self.debug_query(stm, True)

            return con.scalar(stm)

    def get_user(self, user_id):

        # select au.username from auth_user au where id = 1;
        au = self.get_table("auth_user", self.get_base_schema())

        stm = select([au.c.username, au.c.email]).where(and_(au.c.id == int(user_id)))

        value = self.fetch_one_dict(stm)

        return value

    def histogram(self, column, bin):
        """

        :param column: Nome da coluna
        :param bin: Intervalo que sera criado os grupos
        :return:
        """

        stm = select(
            [
                (func.floor(self.tbl.c[column] / bin) * bin).label("bin"),
                func.count("*").label("count"),
            ]
        ).group_by("1")

        return self.fetch_all_dict(stm)

    def get_table_columns(self, tablename, schema):
        """
        Args:
            tablename (string): Nome da tabela sem schema.
            schema (string): Nome do schema ou None quando nao houver.
        Returns:
            columns (list): Colunas disponiveis na tabela
        """
        return [value["name"] for value in self.inspect.get_columns(tablename, schema)]

    def get_table_status(self, tablename, schema):
        """
        This will return size information for table, in both raw bytes and "pretty" form.

        Args:
            tablename (string): Nome da tabela sem schema.
            schema (string): Nome do schema ou None quando nao houver.

        Returns:
            status (Dict): {
                'oid': 16855,
                'table_schema': 'public',
                'table_name': 'test',
                'row_estimate': 0.0,
                'total_bytes': 425984,
                'index_bytes': 0,
                'toast_bytes': None,
                'table_bytes': 425984,
                'total': '416 kB',
                'index': '0 bytes',
                'toast': None,
                'table': '416 kB'
            }
        """
        and_schema = ""
        if schema != None:
            and_schema = "AND nspname = %s" % schema

        stm = text(
            str(
                "SELECT *, pg_size_pretty(total_bytes) AS total"
                " , pg_size_pretty(index_bytes) AS INDEX"
                " , pg_size_pretty(toast_bytes) AS toast"
                " , pg_size_pretty(table_bytes) AS TABLE"
                " FROM ("
                " SELECT *, total_bytes-index_bytes-COALESCE(toast_bytes,0) AS table_bytes FROM ("
                " SELECT c.oid,nspname AS table_schema, relname AS TABLE_NAME"
                " , c.reltuples AS row_estimate"
                " , pg_total_relation_size(c.oid) AS total_bytes"
                " , pg_indexes_size(c.oid) AS index_bytes"
                " , pg_total_relation_size(reltoastrelid) AS toast_bytes"
                " FROM pg_class c"
                " LEFT JOIN pg_namespace n ON n.oid = c.relnamespace"
                " WHERE relkind = 'r'"
                " %s AND relname = '%s'"
                " ) a"
                " ) a;" % (and_schema, tablename)
            )
        )

        return self.fetch_one_dict(stm)

    def debug_query(self, stm, with_parameters=False):
        if settings.DEBUG:
            sql = self.stm_to_str(stm, with_parameters)

            # print(sql)
            self.logger.info(sql)

    def stm_to_str(self, stm, with_parameters=False):
        sql = str(
            stm.compile(
                dialect=self.current_dialect,
                compile_kwargs={"literal_binds": with_parameters},
            )
        )

        # Remove new lines
        sql = sql.replace("\n", " ").replace("\r", "")

        return sql

    # --------------------- Create Table As ------------------------- #
    class CreateTableAs(Executable, ClauseElement):
        def __init__(self, name, query, dialect):
            self.name = name
            self.query = query
            self.dialect = dialect

    @compiles(CreateTableAs)
    def _create_table_as(element, compiler, **kw):
        return "CREATE TABLE %s AS %s" % (
            element.name,
            element.query.compile(
                dialect=element.dialect, compile_kwargs={"literal_binds": True}
            ),
        )

    def create_table_as(self, table, stm, schema=None):
        """
        Use this method to Create a new table in the database using a query statement.
        """
        tablename = table

        if schema != None and schema != "":
            tablename = "%s.%s" % (schema, table)

        create_stm = self.CreateTableAs(tablename, stm, self.current_dialect)

        self.debug_query(create_stm, True)

        with self.engine.connect() as con:
            # Start transaction
            trans = con.begin()
            try:
                con.execute(create_stm)

                trans.commit()

                trans.close()
                return self.stm_to_str(create_stm, True)

            except Exception as e:
                trans.rollback()
                trans.close()
                raise (e)

    # Tabelas principais gerenciadas pelo Django Models mais que eventualmente e necessario acessalas
    # pelo sqlAlchemy
    def get_table_pointing(self):
        schema = self.get_base_schema()
        self.tbl_pointing = self.get_table("tno_pointing", schema)

        return self.tbl_pointing

    def get_table_skybot(self):
        schema = self.get_base_schema()
        self.tbl_skybot = self.get_table("skybot_position", schema)

        return self.tbl_skybot

    def get_table_ccdimage(self):
        schema = self.get_base_schema()
        self.tbl_ccdimage = self.get_table("tno_ccdimage", schema)

        return self.tbl_ccdimage

    def get_table_observations_file(self):
        schema = self.get_base_schema()
        self.table_observations_file = self.get_table("orbit_observationfile", schema)

        return self.table_observations_file

    def get_table_orbital_parameters_file(self):
        schema = self.get_base_schema()
        self.table_orbital_parameters_file = self.get_table(
            "orbit_orbitalparameterfile", schema
        )

        return self.table_orbital_parameters_file

    def get_table_bsp_jpl_file(self):
        schema = self.get_base_schema()
        self.table_bsp_jpl_file = self.get_table("orbit_bspjplfile", schema)

        return self.table_bsp_jpl_file

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
        connection = self.engine.raw_connection()
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


class CatalogDB(DBBase):
    def get_db_uri(self):

        db_admin = settings.DATABASES["catalog"]
        # postgresql+psycopg2
        db_uri = "postgresql+psycopg2://%s:%s@%s:%s/%s" % (
            db_admin["USER"],
            db_admin["PASSWORD"],
            db_admin["HOST"],
            db_admin["PORT"],
            db_admin["NAME"],
        )

        self.current_dialect = postgresql.dialect()

        return db_uri

    def radial_query(
        self,
        tablename,
        ra_property,
        dec_property,
        ra,
        dec,
        radius,
        schema=None,
        columns=None,
        limit=None,
        source_id=None,
    ):
        s_columns = "*"
        if columns != None and len(columns) > 0:
            s_columns = ", ".join(columns)

        if schema != None:
            tablename = "%s.%s" % (schema, tablename)

        s_limit = ""
        if limit != None:
            s_limit = "LIMIT %s" % limit

        if source_id != None:
            stm = f"SELECT {s_columns} FROM {tablename} WHERE source_id = {source_id}"
        else:
            stm = (
                """SELECT %s FROM %s WHERE q3c_radial_query("%s", "%s", %s, %s, %s) %s """
                % (
                    s_columns,
                    tablename,
                    ra_property,
                    dec_property,
                    ra,
                    dec,
                    radius,
                    s_limit,
                )
            )

        return self.fetch_all_dict(text(stm))


#     def poly_query(
#         self,
#         tablename,
#         ra_property,
#         dec_property,
#         positions,
#         schema=None,
#         columns=None,
#         limit=None,
#     ):

#         s_columns = "*"
#         if columns != None and len(columns) > 0:
#             s_columns = ", ".join(columns)

#         if schema != None:
#             tablename = "%s.%s" % (schema, tablename)

#         s_limit = ""
#         if limit != None:
#             s_limit = "LIMIT %s" % limit

#         stm = """SELECT %s FROM %s WHERE q3c_poly_query("%s", "%s", '{%s}') %s """ % (
#             s_columns,
#             tablename,
#             ra_property,
#             dec_property,
#             ", ".join(positions),
#             s_limit,
#         )
#         return self.fetch_all_dict(text(stm))
