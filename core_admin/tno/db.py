from sqlalchemy import create_engine, inspect, MetaData, func, Table, Column, Integer, String, Float, Boolean
from sqlalchemy import exc as sa_exc
# from sqlalchemy.dialects import oracle
from sqlalchemy.dialects import sqlite
from sqlalchemy.dialects import postgresql
from sqlalchemy.ext.compiler import compiles
from sqlalchemy.sql import select, and_, text
from sqlalchemy.sql.expression import Executable, ClauseElement
from sqlalchemy.sql.expression import literal_column, between
from sqlalchemy.schema import Sequence

import collections
import os
from django.conf import settings

class DBBase():

    def __init__(self):

        self.engine = create_engine(self.get_db_uri(), use_batch_mode=True)

        self.current_dialect = None

        self.inspect = inspect(self.engine)


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

        return self.to_dict(queryset)

    def fetch_scalar(self, stm):
        if settings.DEBUG:
            self.debug_query(stm, True)

        with self.engine.connect() as con:
            return con.execute(stm).scalar()

    def stm_count(self, stm):
        with self.engine.connect() as con:
            # Over para que a contagem seja feita no final da query em casos
            # que tenham counts ou distincts
            stm_count = stm.with_only_columns([func.count().over().label('totalCount')]).limit(None).offset(None)
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
            "SELECT *, pg_size_pretty(total_bytes) AS total" \
                " , pg_size_pretty(index_bytes) AS INDEX" \
                " , pg_size_pretty(toast_bytes) AS toast" \
                " , pg_size_pretty(table_bytes) AS TABLE" \
            " FROM (" \
                " SELECT *, total_bytes-index_bytes-COALESCE(toast_bytes,0) AS table_bytes FROM (" \
                " SELECT c.oid,nspname AS table_schema, relname AS TABLE_NAME" \
                    " , c.reltuples AS row_estimate" \
                    " , pg_total_relation_size(c.oid) AS total_bytes" \
                    " , pg_indexes_size(c.oid) AS index_bytes" \
                    " , pg_total_relation_size(reltoastrelid) AS toast_bytes" \
                " FROM pg_class c" \
                " LEFT JOIN pg_namespace n ON n.oid = c.relnamespace" \
                " WHERE relkind = 'r'" \
                    " %s AND relname = '%s'" \
            " ) a" \
            " ) a;" % (and_schema, tablename)
            ))

        return self.fetch_one_dict(stm)

    def debug_query(self, stm, with_parameters=False):
        # TODO send debug to Log

        print(self.stm_to_str(stm, with_parameters))


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
            element.query.compile(dialect=element.dialect, compile_kwargs={"literal_binds": True})
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
                raise(e)
