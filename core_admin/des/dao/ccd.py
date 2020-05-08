from sqlalchemy.sql import and_, select

from tno.db import DBBase


class CcdDao(DBBase):
    def __init__(self):
        super(CcdDao, self).__init__()

        schema = self.get_base_schema()
        self.tablename = 'des_ccd'
        self.tbl = self.get_table(self.tablename, schema)

    def get_tablename(self):
        return self.tablename

    def get_table_ccd(self):
        return self.tbl

    def count_ccds(self):
        return self.get_count(self.get_table_ccd())

    def ccds_by_exposure(self, exposure_id):
        """
            Retorna todos os CCDs que compoem uma mesma exposição. 
            Uma exposição é composta por N CCDs normalmente 61 ccds 
            possuem a mesma date_obs, band, expnum mas com ccdnum diferentes.
            o id da Exposição no DES é o pfw_attempt_id.
            o id do CCD no DES é o desfile_id.

            Parameters:
                exposure_id (int): primary key from des_exposure table. 

            Returns:
                rows (array): Array with ccds that belong to the exposure

        """
        tbl = self.get_table_ccd()

        stm = select(tbl.c).where(and_(tbl.c.exposure_id ==
                                       int(exposure_id))).order_by(tbl.c.ccdnum)

        self.debug_query(stm, True)

        rows = self.fetch_all_dict(stm)

        return rows
