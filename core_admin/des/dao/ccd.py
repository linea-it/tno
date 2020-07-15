from sqlalchemy import Date, cast, func
from sqlalchemy.sql import and_, select

from tno.db import DBBase


class CcdDao(DBBase):
    def __init__(self, pool=True):
        super(CcdDao, self).__init__(pool)

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

    def count_ccds_by_period(self, start, end):
        """
            Retorna a quantidade de ccds dentro do periodo
            Parameters:
                start (datetime): Periodo inicial que sera usado na seleção.

                end (datetime): Periodo final que sera usado na seleção.

            Returns:
                count (int) Quantidade de ccds no periodo

            select
                count(dc.id)
            from
                des_ccd dc
            inner join des_exposure de on
                (dc.exposure_id = de.id)
            where
                de.date_obs between '2019-01-01 00:00:00' and '2019-01-31 23:59:50'

        """
        # des_ccd
        dc_tbl = self.tbl

        # des_exposure
        de_tbl = self.get_table('des_exposure', self.get_base_schema())

        stm = select([func.count(dc_tbl.c.id)]).\
            select_from(
                dc_tbl.join(
                    de_tbl, dc_tbl.c.exposure_id == de_tbl.c.id
                )).\
            where(and_(de_tbl.c.date_obs.between(str(start), str(end))))

        self.debug_query(stm, True)

        rows = self.fetch_scalar(stm)

        return rows

    def ccds_by_period(self, start, end):
        """
            Retorna os ccds dentro do periodo
            Parameters:
                start (datetime): Periodo inicial que sera usado na seleção.

                end (datetime): Periodo final que sera usado na seleção.

            Returns:
                count (int) Quantidade de ccds no periodo

            select
                *
            from
                des_ccd dc
            inner join des_exposure de on
                (dc.exposure_id = de.id)
            where
                de.date_obs between '2019-01-01 00:00:00' and '2019-01-31 23:59:50'

        """
        # des_ccd
        dc_tbl = self.tbl

        # des_exposure
        de_tbl = self.get_table('des_exposure', self.get_base_schema())

        stm = select(dc_tbl.c).\
            select_from(
                dc_tbl.join(
                    de_tbl, dc_tbl.c.exposure_id == de_tbl.c.id
                )).\
            where(and_(de_tbl.c.date_obs.between(str(start), str(end))))

        self.debug_query(stm, True)

        rows = self.fetch_all_dict(stm)

        return rows

    def count_by_period(self, start, end, dynclass=None, name=None):
        """Retorna o total de ccds agrupados por data e o total de ccds já baixados. 

        Args:
            start (datetime): Periodo inicial que sera usado na seleção.
            end (datetime): Periodo final que sera usado na seleção.
            dynclass (str, optional): Classe dinamica do objeto a query é feita com like dynclass%. Defaults to None.
            name (str, optional): Nome do objeto como está na tabela skybot_position. Defaults to None.

        Query de exemplo:
            select
                distinct date(de.date_obs),
                count(distinct (dc.id)) as count,
                count(distinct (dd.id)) as downloaded
            from
                des_ccd dc
            inner join des_exposure de on
                dc.exposure_id = de.id
            inner join des_skybotposition ds on
                dc.id = ds.ccd_id
            inner join skybot_position sp on
                ds.position_id = sp.id
            left join des_downloadccdjobresult dd on
                dc.id = dd.ccd_id
            where
                sp.dynclass like 'KBO%'
                and de.date_obs between '2019-01-01 00:00:00' and '2019-01-31 23:59:50'
            group by
                date(de.date_obs)
            order by
                date(de.date_obs);	        

        Returns:
            [array]: Lista de datas com os totais de ccds e qtd ccds downloaded. 

        """
        # des_ccd
        dc = self.tbl
        # des_exposure
        de = self.get_table('des_exposure', self.get_base_schema())
        # Des skybot position
        ds = self.get_table('des_skybotposition', self.get_base_schema())
        # Skybot Position
        sp = self.get_table('skybot_position', self.get_base_schema())
        # Des Downloaded CCD Job Result
        dd = self.get_table('des_downloadccdjobresult', self.get_base_schema())

       # Clausula where pelo periodo que é obrigatório
        clause = list([de.c.date_obs.between(str(start), str(end))])

        # Clausula where pela classe dos objetos.
        if dynclass is not None:
            clause.append(sp.c.dynclass.ilike(dynclass + '%'))

        # Clausula where pelo nome dos objetos.
        if name is not None:
            clause.append(sp.c.name == name)

        stm = select([
            cast(de.c.date_obs, Date).label('date'),
            func.count(dc.c.id).label('count'),
            func.count(dd.c.id).label('downloaded')
        ]).\
            select_from(
            dc.join(
                de, dc.c.exposure_id == de.c.id
            ).join(
                ds, dc.c.id == ds.c.ccd_id
            ).join(
                sp, ds.c.position_id == sp.c.id
            ).join(
                dd, dc.c.id == dd.c.ccd_id, isouter=True
            )
        ).\
            where(and_(and_(*clause))).\
            group_by(cast(de.c.date_obs, Date)).\
            order_by(cast(de.c.date_obs, Date))

        self.debug_query(stm, True)

        rows = self.fetch_all_dict(stm)

        return rows