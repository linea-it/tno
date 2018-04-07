from flask_sqlalchemy import SQLAlchemy
from sqlalchemy.dialects import postgresql
from sqlalchemy import select, create_engine, inspect, MetaData, func, Table, Column, Integer, String, Float, Boolean
import collections

class DBBase(SQLAlchemy):

    def to_dict(self, queryset):
        rows = list()
        for row in queryset:
            rows.append(dict(collections.OrderedDict(row)))

        return rows


    def fetch_all_dict(self, stm):
        queryset = self.engine.execute(stm)
        return self.to_dict(queryset)

    def get_table_skybot(self):

        self.tbl_skybot = Table(
            "skybot_output", MetaData(self.engine), autoload=True, schema="tno")

        return self.tbl_skybot
