from flask_sqlalchemy import SQLAlchemy
from sqlalchemy.dialects import postgresql
from sqlalchemy import select, create_engine, inspect, MetaData, func, Table, Column, Integer, String, Float, Boolean
import collections
import os
class DBBase(SQLAlchemy):

    def get_db_uri(self):
        db_uri = ""

        if 'DB_NAME' in os.environ:
            # postgresql+psycopg2
            db_uri = "postgresql+psycopg2://%s:%s@%s:%s/%s" % (
                os.environ['DB_USER'], os.environ['DB_PASS'], 
                os.environ['DB_HOST'], os.environ['DB_PORT'], os.environ['DB_NAME'])


        else:
            # Use Sqlite
            db_uri = ""

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