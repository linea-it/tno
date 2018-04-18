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


    def get_db_uri(self):
        db_uri = ""

        if 'DB_NAME' in os.environ:
            # postgresql+psycopg2
            db_uri = "postgresql+psycopg2://%s:%s@%s:%s/%s" % (
                os.environ['DB_USER'], os.environ['DB_PASS'], 
                os.environ['DB_HOST'], os.environ['DB_PORT'], os.environ['DB_NAME'])

        else:
            # Use Sqlite
            sqlite_database = settings.SQLITE_DATABASE
            db_uri = "sqlite:///%s" % sqlite_database

        print(db_uri)
        return db_uri

    def to_dict(self, queryset):
        rows = list()
        for row in queryset:
            rows.append(dict(collections.OrderedDict(row)))

        return rows


    def fetch_all_dict(self, stm):
        queryset = self.engine.execute(stm)
        return self.to_dict(queryset)


    def get_table_skybot(self):
        schema = None 
        if 'DB_SCHEMA' in os.environ:
            schema = os.environ['DB_SCHEMA']

        self.tbl_skybot = Table(
            "tno_skybotoutput", MetaData(self.engine), autoload=True, schema=schema)

        return self.tbl_skybot