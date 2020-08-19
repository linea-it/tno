from sqlalchemy import Date, cast, func
from sqlalchemy.sql import and_, select

from tno.db import DBBase


class ExposureDao(DBBase):
    def __init__(self, pool=True):
        super(ExposureDao, self).__init__(pool)

        schema = self.get_base_schema()
        self.tablename = 'des_exposure'
        self.tbl = self.get_table(self.tablename, schema)

    # TODO: Mover esse metodo get para a DBBase.
    def get_tablename(self):
        return self.tablename

    # TODO: Mover esse metodo DBBase.
    def count_ccds(self):
        return self.get_count(self.tbl)

    def exposures_by_period(self, start, end):
        """
            Retorna todas as exposições com data de observação 
            para um periodo.

            Parameters:
                start (datetime): Periodo inicial que sera usado na seleção.

                end (datetime): Periodo final que sera usado na seleção.

            Returns:
                rows (array) Exposições com data de observação entre o periodo.

        """
        tbl = self.tbl

        stm = select(tbl.c).\
            where(and_(tbl.c.date_obs.between(str(start), str(end)))).\
            order_by(tbl.c.date_obs)

        self.debug_query(stm, True)

        rows = self.fetch_all_dict(stm)

        return rows

    def count_by_period(self, start, end):

        tbl = self.tbl

        stm = select([cast(tbl.c.date_obs, Date).label('date'), func.count('*').label('count')]).\
            where(and_(tbl.c.date_obs.between(str(start), str(end)))).\
            group_by(cast(tbl.c.date_obs, Date)).\
            order_by(cast(tbl.c.date_obs, Date))

        self.debug_query(stm, True)

        rows = self.fetch_all_dict(stm)

        return rows

    def count_nights_by_period(self, start, end):
        """
            Retorna a quantidade de noites com exposição no periodo
            Parameters:
                start (datetime): Periodo inicial que sera usado na seleção.

                end (datetime): Periodo final que sera usado na seleção.

            Returns:
                count (int) Quantidade de noites com exposição

            select
                count(distinct date(de.date_obs))
            from
                des_exposure de
            where
                de.date_obs between '2019-01-01 00:00:00' and '2019-01-31 23:59:50'

        """

        tbl = self.tbl

        stm = select([func.count(cast(tbl.c.date_obs, Date).distinct())]).\
            where(and_(tbl.c.date_obs.between(str(start), str(end))))

        self.debug_query(stm, True)

        rows = self.fetch_scalar(stm)

        return rows
