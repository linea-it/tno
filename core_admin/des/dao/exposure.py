from sqlalchemy.sql import and_, select

from tno.db import DBBase


class ExposureDao(DBBase):
    def __init__(self):
        super(ExposureDao, self).__init__()

        schema = self.get_base_schema()
        self.tablename = 'des_exposure'
        self.tbl = self.get_table(self.tablename, schema)

    # TODO: Mover esse metodo get para a DBBase.
    def get_tablename(self):
        return self.tablename

    # TODO: Mover esse metodo get para a DBBase.
    def get_table_ccd(self):
        return self.tbl

    # TODO: Mover esse metodo DBBase.
    def count_ccds(self):
        return self.get_count(self.get_table_ccd())

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
        tbl = self.get_table_ccd()

        stm = select(tbl.c).\
            where(and_(tbl.c.date_obs.between(str(start), str(end)))).\
            order_by(tbl.c.date_obs)

        self.debug_query(stm, True)

        rows = self.fetch_all_dict(stm)

        return rows