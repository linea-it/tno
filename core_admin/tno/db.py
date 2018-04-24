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

        self.engine = create_engine(self.get_db_uri())

        self.current_dialect = None


    def get_db_uri(self):
        db_uri = ""

        if 'DB_NAME' in os.environ:
            # postgresql+psycopg2
            db_uri = "postgresql+psycopg2://%s:%s@%s:%s/%s" % (
                os.environ['DB_USER'], os.environ['DB_PASS'],
                os.environ['DB_HOST'], os.environ['DB_PORT'], os.environ['DB_NAME'])

            self.current_dialect = postgresql.dialect()

        else:
            # Use Sqlite
            sqlite_database = settings.SQLITE_DATABASE
            db_uri = "sqlite:///%s" % sqlite_database

            self.current_dialect = sqlite.dialect()

        print(db_uri)
        return db_uri

    def to_dict(self, queryset):
        rows = list()
        for row in queryset:
            rows.append(dict(collections.OrderedDict(row)))

        return rows


    def fetch_all_dict(self, stm):
        queryset = self.engine.execute(stm)

        if settings.DEBUG:
            self.debug_query(stm, True)

        return self.to_dict(queryset)

    def stm_count(self, stm):
        with self.engine.connect() as con:
            # Over para que a contagem seja feita no final da query em casos
            # que tenham counts ou distincts
            stm_count = stm.with_only_columns([func.count().over().label('totalCount')]).limit(None).offset(None)
            count = con.execute(stm_count).scalar()

            if settings.DEBUG:
                self.debug_query(stm_count, True)

            return count


    def debug_query(self, stm, with_parameters=False):
        # TODO send debug to Log
        print(str(stm.compile(
            dialect=self.current_dialect,
            compile_kwargs={"literal_binds": with_parameters})))

    def get_table_skybot(self):
        schema = None
        if 'DB_SCHEMA' in os.environ:
            schema = os.environ['DB_SCHEMA']

        self.tbl_skybot = Table(
            "tno_skybotoutput", MetaData(self.engine), autoload=True, schema=schema)

        return self.tbl_skybot
