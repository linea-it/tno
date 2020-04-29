import collections
import logging
import os

from django.conf import settings
from sqlalchemy import (Boolean, Column, Float, Integer, MetaData, String,
                        Table, create_engine)
from sqlalchemy import exc as sa_exc
from sqlalchemy import func, inspect
# from sqlalchemy.dialects import oracle
from sqlalchemy.dialects import postgresql, sqlite
from sqlalchemy.ext.compiler import compiles
from sqlalchemy.schema import Sequence
from sqlalchemy.sql import and_, select, text
from sqlalchemy.sql.expression import (ClauseElement, Executable, between,
                                       literal_column)


class DBBase():
    def __init__(self):

        self.engine = create_engine(self.get_db_uri(), use_batch_mode=True)

        self.current_dialect = None

        self.inspect = inspect(self.engine)

        self.logger = logging.getLogger('django')

    def get_db_uri(self):
        db_uri = ""

        if 'DB_NAME' in os.environ:
            # postgresql+psycopg2
            db_uri = "postgresql+psycopg2://%s:%s@%s:%s/%s" % (
                os.environ['DB_USER'], os.environ['DB_PASS'],
                os.environ['DB_HOST'], os.environ['DB_PORT'], os.environ['DB_NAME'])

            self.current_dialect = postgresql.dialect()

        return db_uri

    def get_database(self):
        if 'DB_NAME' in os.environ:
            return os.environ['DB_NAME']
        else:
            return None

    def get_base_schema(self):
        schema = None
        if 'DB_SCHEMA' in os.environ:
            schema = os.environ['DB_SCHEMA']

        return schema

    def get_engine(self):
        return self.engine

    def get_table(self, tablename, schema=None):
        tbl = Table(
            tablename, MetaData(self.engine), autoload=True, schema=schema)

        return tbl

    def to_dict(self, row):
        return dict(collections.OrderedDict(row))

    def fetch_all_dict(self, stm):
        if settings.DEBUG:
            self.debug_query(stm, True)

        queryset = self.engine.execute(stm)

        rows = list()
        for row in queryset:
            rows.append(self.to_dict(row))

        return rows

    def fetch_one_dict(self, stm):
        if settings.DEBUG:
            self.debug_query(stm, True)

        queryset = self.engine.execute(stm).fetchone()

        if queryset is not None:
            return self.to_dict(queryset)
        else:
            return None

    def fetch_scalar(self, stm):
        if settings.DEBUG:
            self.debug_query(stm, True)

        with self.engine.connect() as con:
            return con.execute(stm).scalar()

    def stm_count(self, stm):
        with self.engine.connect() as con:
            # Over para que a contagem seja feita no final da query em casos
            # que tenham counts ou distincts
            stm_count = stm.with_only_columns(
                [func.count().over().label('totalCount')]).limit(None).offset(None)
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
            stm = select([func.count('*')]).select_from(table)

            self.debug_query(stm, True)

            return con.scalar(stm)

    def get_table_columns(self, tablename, schema):
        """
            Args:
                tablename (string): Nome da tabela sem schema.
                schema (string): Nome do schema ou None quando nao houver.
            Returns:
                columns (list): Colunas disponiveis na tabela
        """
        return [value['name'] for value in self.inspect.get_columns(tablename, schema)]

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
        and_schema = ''
        if schema is not None:
            and_schema = "AND nspname = %s" % schema

        stm = text(str(
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
        ))

        return self.fetch_one_dict(stm)

    def debug_query(self, stm, with_parameters=False):
        if settings.DEBUG:
            sql = self.stm_to_str(stm, with_parameters)

            print(sql)
            self.logger.info(sql)

    def stm_to_str(self, stm, with_parameters=False):
        sql = str(stm.compile(
            dialect=self.current_dialect,
            compile_kwargs={"literal_binds": with_parameters}))

        # Remove new lines
        sql = sql.replace('\n', ' ').replace('\r', '')

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
            element.query.compile(dialect=element.dialect, compile_kwargs={
                                  "literal_binds": True})
        )

    def create_table_as(self, table, stm, schema=None):
        """
        Use this method to Create a new table in the database using a query statement.
        """
        tablename = table

        if schema is not None and schema is not "":
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
        self.tbl_pointing = self.get_table('tno_pointing', schema)

        return self.tbl_pointing

    def get_table_skybot(self):
        schema = self.get_base_schema()
        self.tbl_skybot = self.get_table('tno_skybotoutput', schema)

        return self.tbl_skybot

    def get_table_ccdimage(self):
        schema = self.get_base_schema()
        self.tbl_ccdimage = self.get_table('tno_ccdimage', schema)

        return self.tbl_ccdimage

    def get_table_observations_file(self):
        schema = self.get_base_schema()
        self.table_observations_file = self.get_table(
            'orbit_observationfile', schema)

        return self.table_observations_file

    def get_table_orbital_parameters_file(self):
        schema = self.get_base_schema()
        self.table_orbital_parameters_file = self.get_table(
            'orbit_orbitalparameterfile', schema)

        return self.table_orbital_parameters_file

    def get_table_bsp_jpl_file(self):
        schema = self.get_base_schema()
        self.table_bsp_jpl_file = self.get_table('orbit_bspjplfile', schema)

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
            with connection.cursor() as cursor:
                cursor.copy_expert(sql, data)
                connection.commit()

            return cursor.rowcount
        except Exception as e:
            connection.rollback()
            raise (e)


class CatalogDB(DBBase):
    def __init__(self):
        self.engine = create_engine(self.get_db_uri(), use_batch_mode=True)

        self.current_dialect = None

        self.inspect = inspect(self.engine)

        self.logger = logging.getLogger('django')

    def get_db_uri(self):
        db_uri = ""

        if 'CATALOG_DB_NAME' in os.environ:
            # postgresql+psycopg2
            db_uri = "postgresql+psycopg2://%s:%s@%s:%s/%s" % (
                os.environ['CATALOG_DB_USER'], os.environ['CATALOG_DB_PASS'],
                os.environ['CATALOG_DB_HOST'], os.environ['CATALOG_DB_PORT'], os.environ['CATALOG_DB_NAME'])

            self.current_dialect = postgresql.dialect()

        return db_uri

    def radial_query(self, tablename, ra_property, dec_property, ra, dec, radius, schema=None, columns=None, limit=None):

        s_columns = '*'
        if columns is not None and len(columns) > 0:
            s_columns = ', '.join(columns)

        if schema is not None:
            tablename = "%s.%s" % (schema, tablename)

        s_limit = ''
        if limit is not None:
            s_limit = 'LIMIT %s' % limit

        stm = """SELECT %s FROM %s WHERE q3c_radial_query("%s", "%s", %s, %s, %s) %s """ % (s_columns, tablename, ra_property,
                                                                                            dec_property, ra, dec, radius, s_limit)

        return self.fetch_all_dict(text(stm))

    def poly_query(self, tablename, ra_property, dec_property, positions, schema=None, columns=None, limit=None):

        s_columns = '*'
        if columns is not None and len(columns) > 0:
            s_columns = ', '.join(columns)

        if schema is not None:
            tablename = "%s.%s" % (schema, tablename)

        s_limit = ''
        if limit is not None:
            s_limit = 'LIMIT %s' % limit

        stm = """SELECT %s FROM %s WHERE q3c_poly_query("%s", "%s", '{%s}') %s """ % (s_columns, tablename, ra_property,
                                                                                      dec_property, ", ".join(positions), s_limit)
        return self.fetch_all_dict(text(stm))
