from tno.db import DBBase


class DesObservationDao(DBBase):
    def __init__(self, pool=True):
        super(DesObservationDao, self).__init__(pool)

        schema = self.get_base_schema()
        self.tablename = 'des_observation'
        self.tbl = self.get_table(self.tablename, schema)

    # TODO: Mover esses metodos get para a DBBase.
    def get_tablename(self):
        return self.tablename
