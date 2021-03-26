from datetime import datetime
from io import StringIO

from sqlalchemy import Date, cast, desc, func
from sqlalchemy.sql import and_, select, text

from tno.db import DBBase


class DesSkybotJobResultDao(DBBase):
    def __init__(self, pool=True):
        super(DesSkybotJobResultDao, self).__init__(pool)

        schema = self.get_base_schema()
        self.tablename = 'des_skybotjobresult'
        self.tbl = self.get_table(self.tablename, schema)

    def import_data(self, dataframe):
        """
            Convert the dataframe to csv, and import it into the database.

            Parameters:
                dataframe (dataframe): Pandas Dataframe with the information to be imported.

            Returns:
                rowcount (int):  the number of rows imported.

            Example SQL Copy:
                COPY des_skybotjobresult (ticket, success, error, execution_time, positions, inside_ccd, outside_ccd, filename, exposure_id, job_id, ccds_with_asteroids) FROM '/data/teste.csv' with (FORMAT CSV, DELIMITER ';', HEADER);

        """
        # Converte o Data frame para csv e depois para arquivo em memória.
        # Mantem o header do csv para que seja possivel escolher na query COPY quais colunas
        # serão importadas.
        # Desabilita o index para o pandas não criar uma coluna a mais com id que não corresponde a tabela.
        data = StringIO()
        dataframe.to_csv(
            data,
            sep="|",
            header=True,
            index=False,
        )
        data.seek(0)

        try:
            # Recupera o nome da tabela skybot output
            table = str(self.tbl)

            # Sql Copy com todas as colunas que vão ser importadas e o formato do csv.
            sql = "COPY %s (ticket, success, error, execution_time, positions, inside_ccd, outside_ccd, filename, exposure_id, job_id, ccds_with_asteroids) FROM STDIN with (FORMAT CSV, DELIMITER '|', HEADER);" % table

            # Executa o metodo que importa o arquivo csv na tabela.
            rowcount = self.import_with_copy_expert(sql, data)

            # Retorna a quantidade de linhas que foram inseridas.
            return rowcount

        except Exception as e:
            raise Exception("Failed to import data. Error: [%s]" % e)

    def count_exec_by_period(self, start, end):
        """
            Esta query retorna o total de exposições executadas dentro do periodo. agrupadas por data.
            Faz um left join com a tabela de exposições para retornar todas as datas que tem exposição,
            mas a contagem e feita na tabela skybot_job_result que são as exposições que já foram executadas.

            select
                distinct date(de.date_obs),
                count(ds.exposure_id) as count
            from
                des_exposure de
            left join des_skybotjobresult ds on
                (de.id = ds.exposure_id )
            where
                de.date_obs between '2019-01-01 00:00:00' and '2019-01-31 23:59:50'
            group by
                date(de.date_obs)
            order by
                date(de.date_obs);
        """
        # des_exposure
        de_tbl = self.get_table('des_exposure', self.get_base_schema())

        # des_skybotjobresult
        ds_tbl = self.tbl

        stm_join = de_tbl.join(ds_tbl, de_tbl.c.id ==
                               ds_tbl.c.exposure_id, isouter=True)

        stm = select([
            cast(de_tbl.c.date_obs, Date).distinct().label('date'),
            func.count(ds_tbl.c.exposure_id).label('count')]).\
            select_from(stm_join).\
            where(and_(de_tbl.c.date_obs.between(str(start), str(end)))).\
            group_by(cast(de_tbl.c.date_obs, Date)).\
            order_by(cast(de_tbl.c.date_obs, Date))

        self.debug_query(stm, True)

        rows = self.fetch_all_dict(stm)

        return rows

    def not_exec_by_period(self, start, end):
        """
            Retorna todas as exposições que não foram executadas pelo skybot
            para um periodo.

            Parameters:
                start (datetime): Periodo inicial que sera usado na seleção.

                end (datetime): Periodo final que sera usado na seleção.

            Returns:
                rows (array) Exposições que ainda não foram executadas pelo skybot.


        select
            de.*
        from
            des_exposure de
        where
            de.date_obs between '2019-01-01 00:00:00' and '2019-01-31 23:59:50'
            and de.id not in (
            select
                ds.exposure_id
            from
                des_skybotjobresult ds)

        """
        # des_exposure
        de_tbl = self.get_table('des_exposure', self.get_base_schema())

        # des_skybotjobresult
        ds_tbl = self.tbl

        stm = select(de_tbl.c).\
            where(
                and_(
                    de_tbl.c.date_obs.between(str(start), str(end)),
                    de_tbl.c.id.notin_(
                        select([ds_tbl.c.exposure_id])
                    )
                )
        ).\
            order_by(de_tbl.c.date_obs)

        self.debug_query(stm, True)

        rows = self.fetch_all_dict(stm)

        return rows

    def count_not_exec_by_period(self, start, end):
        """
            Retorna o Total de exposições que não foram executadas pelo skybot
            para um periodo.

            Parameters:
                start (datetime): Periodo inicial que sera usado na seleção.

                end (datetime): Periodo final que sera usado na seleção.

            Returns:
                rows (array) Exposições que ainda não foram executadas pelo skybot.


        select
            count(de.id) as total
        from
            des_exposure de
        where
            de.date_obs between '2019-01-01 00:00:00' and '2019-01-31 23:59:50'
            and de.id not in (
            select
                ds.exposure_id
            from
                des_skybotjobresult ds)

        """
        # des_exposure
        de_tbl = self.get_table('des_exposure', self.get_base_schema())

        # des_skybotjobresult
        ds_tbl = self.tbl

        stm = select([func.count(de_tbl.c.id).label('total')]).\
            where(
                and_(
                    de_tbl.c.date_obs.between(str(start), str(end)),
                    de_tbl.c.id.notin_(
                        select([ds_tbl.c.exposure_id])
                    )
                )
        )

        self.debug_query(stm, True)

        rows = self.fetch_scalar(stm)

        return rows

    def count_not_exec_nights_by_period(self, start, end):
        """
            Retorna o Total de exposições que não foram executadas pelo skybot
            para um periodo.

            Parameters:
                start (datetime): Periodo inicial que sera usado na seleção.

                end (datetime): Periodo final que sera usado na seleção.

            Returns:
                rows (array) Exposições que ainda não foram executadas pelo skybot.


        select
            count(de.id) as total
        from
            des_exposure de
        where
            de.date_obs between '2019-01-01 00:00:00' and '2019-01-31 23:59:50'
            and de.id not in (
            select
                ds.exposure_id
            from
                des_skybotjobresult ds)

        """
        # des_exposure
        de_tbl = self.get_table('des_exposure', self.get_base_schema())

        # des_skybotjobresult
        ds_tbl = self.tbl

        stm = select([func.count(cast(de_tbl.c.date_obs, Date).distinct())]).\
            where(
                and_(
                    de_tbl.c.date_obs.between(str(start), str(end)),
                    de_tbl.c.id.notin_(
                        select([ds_tbl.c.exposure_id])
                    )
                )
        )

        self.debug_query(stm, True)

        rows = self.fetch_scalar(stm)

        return rows

    def count_not_exec_ccds_by_period(self, start, end):
        """
            Retorna o Total de exposições que não foram executadas pelo skybot
            para um periodo.

            Parameters:
                start (datetime): Periodo inicial que sera usado na seleção.

                end (datetime): Periodo final que sera usado na seleção.

            Returns:
                rows (array) Exposições que ainda não foram executadas pelo skybot.


        select
            count(de.id) as total
        from
            des_exposure de
        where
            de.date_obs between '2019-01-01 00:00:00' and '2019-01-31 23:59:50'
            and de.id not in (
            select
                ds.exposure_id
            from
                des_skybotjobresult ds)

        """

        # des_ccd
        dc_tbl = self.get_table('des_ccd', self.get_base_schema())

        # des_exposure
        de_tbl = self.get_table('des_exposure', self.get_base_schema())

        # des_skybotjobresult
        ds_tbl = self.tbl

        stm = select([func.count(dc_tbl.c.id)]).\
            select_from(
                dc_tbl.join(
                    de_tbl, dc_tbl.c.exposure_id == de_tbl.c.id
                )).\
            where(
                and_(
                    de_tbl.c.date_obs.between(str(start), str(end)),
                    de_tbl.c.id.notin_(
                        select([ds_tbl.c.exposure_id])
                    )
                )
        )

        self.debug_query(stm, True)

        rows = self.fetch_scalar(stm)

        return rows

    def t_positions_des_by_job(self, job_id):
        """Retorna o Total de posições
        retornadas pelo skybot que estão em ccds do DES para um Job especifico.

        select
            count(sp.id)
        from
            skybot_position sp
        inner join des_skybotjobresult ds on
            sp.ticket = ds.ticket
        where
            ds.job_id = 72;

        Args:
            job_id ([type]): [description]

        Returns:
            [type]: [description]
        """

        # des_skybotjobresult
        ds = self.tbl

        # skybot_position
        sp = self.get_table('skybot_position', self.get_base_schema())

        stm = select([func.count(sp.c.id).label('count')]).\
            select_from(sp.join(ds,  sp.c.ticket == ds.c.ticket)).\
            where(and_(ds.c.job_id == int(job_id)))

        rows = self.fetch_scalar(stm)

        return rows

    def t_unique_objects_by_job(self, job_id):
        """Total de Objetos unicos que estão no DES,
        retornados pelo skybot para um Job especifico.

        select
            count(distinct(sp.name))
        from
            skybot_position sp
        inner join des_skybotjobresult ds on
            sp.ticket = ds.ticket
        where
            ds.job_id = 72;

        Args:
            job_id ([type]): [description]

        Returns:
            [type]: [description]
        """

        # des_skybotjobresult
        ds = self.tbl

        # skybot_position
        sp = self.get_table('skybot_position', self.get_base_schema())

        stm = select([func.count(sp.c.name.distinct()).label('count')]).\
            select_from(sp.join(ds,  sp.c.ticket == ds.c.ticket)).\
            where(and_(ds.c.job_id == int(job_id)))

        rows = self.fetch_scalar(stm)

        return rows

    def t_exposures_with_objects_by_job(self, job_id):
        """Total de Exposições do DES
        que tem pelo menos 1 objeto pelo skybot para um Job especifico.

        select
            count(distinct(dsp.exposure_id))
        from
            des_skybotposition dsp
        inner join des_skybotjobresult ds on
            dsp.ticket = ds.ticket
        where
            ds.job_id = 72;

        Args:
            job_id ([type]): [description]

        Returns:
            [type]: [description]
        """

        # des_skybotjobresult
        ds = self.tbl

        # des_skybotposition
        dsp = self.get_table('des_skybotposition', self.get_base_schema())

        stm = select([func.count(dsp.c.exposure_id.distinct()).label('count')]).\
            select_from(dsp.join(ds,  dsp.c.ticket == ds.c.ticket)).\
            where(and_(ds.c.job_id == int(job_id)))

        rows = self.fetch_scalar(stm)

        return rows

    def t_ccds_with_objects_by_job(self, job_id):
        """Total de CCDs do DES
        que tem pelo menos 1 objeto pelo skybot para um Job especifico.

        select
            count(distinct(dsp.ccd_id))
        from
            des_skybotposition dsp
        inner join des_skybotjobresult ds on
            dsp.ticket = ds.ticket
        where
            ds.job_id = 72;

        Args:
            job_id ([type]): [description]

        Returns:
            [type]: [description]
        """

        # des_skybotjobresult
        ds = self.tbl

        # des_skybotposition
        dsp = self.get_table('des_skybotposition', self.get_base_schema())

        stm = select([func.count(dsp.c.ccd_id.distinct()).label('count')]).\
            select_from(dsp.join(ds,  dsp.c.ticket == ds.c.ticket)).\
            where(and_(ds.c.job_id == int(job_id)))

        rows = self.fetch_scalar(stm)

        return rows

    def dynclass_asteroids_by_job(self, job_id):
        """Total de objetos unicos por classe para um Job especifico

        OBS: Está query não foi possivel fazer usando sqlalchemy.

        select
            split_part(dynclass, '>', 1) as dynclass,
            count(distinct(sp.name)) as asteroids
        from skybot_position sp
        inner join des_skybotposition dsp on
            sp.id = dsp.position_id
        inner join des_skybotjobresult ds on
            sp.ticket = ds.ticket
        where
            ds.job_id = 109
        group by
            split_part(dynclass, '>', 1)
        order by
            split_part(dynclass, '>', 1);

        Args:
            job_id ([type]): [description]

        Returns:
            [type]: [description]
        """

        stm = text("""select split_part(dynclass, '>', 1) as dynclass, count(distinct(sp.name)) as asteroids from skybot_position sp inner join des_skybotposition dsp on	sp.id = dsp.position_id inner join des_skybotjobresult ds on sp.ticket = ds.ticket where ds.job_id = %s group by split_part(dynclass, '>', 1) order by split_part(dynclass, '>', 1);""" % int(job_id))

        self.debug_query(stm, True)

        rows = self.fetch_all_dict(stm)

        return rows

    def dynclass_ccds_by_job(self, job_id):
        """Total de CCDs unicos por classe para um Job especifico

        OBS: Está query não foi possivel fazer usando sqlalchemy.

        select
            split_part(dynclass, '>', 1) as dynclass,
            count(distinct(dsp.ccd_id)) as ccds
        from skybot_position sp
        inner join des_skybotjobresult ds on
            sp.ticket = ds.ticket
        inner join des_skybotposition dsp on sp.id = dsp.position_id
        where
            ds.job_id = 91
        group by
            split_part(dynclass, '>', 1)
        order by
            split_part(dynclass, '>', 1);

        Args:
            job_id ([type]): [description]

        Returns:
            [type]: [description]
        """

        stm = text("""select split_part(dynclass, '>', 1) as dynclass, count(distinct(dsp.ccd_id)) as ccds from skybot_position sp inner join des_skybotjobresult ds on sp.ticket = ds.ticket inner join des_skybotposition dsp on sp.id = dsp.position_id where ds.job_id = %s group by split_part(dynclass, '>', 1) order by split_part(dynclass, '>', 1);""" % int(job_id))

        self.debug_query(stm, True)

        rows = self.fetch_all_dict(stm)

        return rows

    def dynclass_positions_by_job(self, job_id):
        """Total de Posicoes unicas por classe para um Job especifico

        OBS: Está query não foi possivel fazer usando sqlalchemy.

        select
            split_part(dynclass, '>', 1) as dynclass,
            count(dsp.id) as positions
        from
            skybot_position sp
        inner join des_skybotjobresult ds on
            sp.ticket = ds.ticket
        inner join des_skybotposition dsp on
            dsp.position_id = sp.id
        where
            ds.job_id = 94
        group by
            split_part(dynclass, '>', 1)
        order by
            split_part(dynclass, '>', 1);


        Args:
            job_id ([type]): [description]

        Returns:
            [type]: [description]
        """

        stm = text("""select split_part(dynclass, '>', 1) as dynclass, count(dsp.id) as positions from skybot_position sp inner join des_skybotjobresult ds on sp.ticket = ds.ticket inner join des_skybotposition dsp on dsp.position_id = sp.id where ds.job_id = %s group by split_part(dynclass, '>', 1) order by split_part(dynclass, '>', 1);""" % int(job_id))

        self.debug_query(stm, True)

        rows = self.fetch_all_dict(stm)

        return rows

    def dynclass_band_by_job(self, job_id, dynclass):
        """Total de Posicoes por banda para um Job e classe especifico

        OBS: Está query não foi possivel fazer usando sqlalchemy.

        select
            de.band,
            count(sp.id) as positions
        from
            des_exposure de
        inner join des_skybotposition dsp on
            dsp.exposure_id = de.id
        inner join des_skybotjobresult ds on
            ds.exposure_id = dsp.exposure_id
        inner join skybot_position sp on
            dsp.position_id = sp.id
        where
            ds.job_id = 94
            and split_part(dynclass, '>', 1) = 'KBO'
        group by
            de.band

        Args:
            job_id ([type]): [description]
            dynclass ([type]): [description]

        Returns:
            [type]: [description]
        """

        stm = text("select de.band, count(sp.id) as positions from des_exposure de inner join des_skybotposition dsp on dsp.exposure_id = de.id inner join des_skybotjobresult ds on ds.exposure_id = dsp.exposure_id inner join skybot_position sp on dsp.position_id = sp.id where ds.job_id = %s and split_part(dynclass, '>', 1) = '%s' group by de.band;" % (int(job_id), dynclass))

        self.debug_query(stm, True)

        rows = self.fetch_all_dict(stm)

        return rows

    def t_ccds_with_objects_by_id(self, id):
        """Total de CCDs com pelo menos 1 asteroid para uma exposição, query pelo id da des_skybotjobresult.

        select
            count(distinct(dsp.ccd_id)) as ccds
        from
            des_skybotposition dsp
        inner join des_skybotjobresult ds on
            ds.exposure_id = dsp.exposure_id
        where
            ds.id = 7643;

        Args:
            id ([type]): [description]

        Returns:
            [type]: [description]
        """

        ds = self.tbl

        # des_skybotposition
        dsp = self.get_table('des_skybotposition', self.get_base_schema())

        stm = select([func.count(dsp.c.ccd_id.distinct()).label('count')]).\
            select_from(dsp.join(ds,  dsp.c.exposure_id == ds.c.exposure_id)).\
            where(and_(ds.c.id == int(id)))

        rows = self.fetch_scalar(stm)

        return rows

    def dynclass_asteroids_by_id(self, id):
        """ Total de Objetos por classe para uma exposição, query pelo id da des_skybotjobresult.

        select
            split_part(sp.dynclass, '>', 1) as dynclass,
            count(distinct(sp.name)) as asteroids,
            count(distinct(dsp.ccd_id)) as ccds
        from
            des_skybotposition dsp
        inner join des_skybotjobresult ds on
            ds.exposure_id = dsp.exposure_id
        inner join skybot_position sp on
            sp.id = dsp.position_id
        where
            ds.id = 7643
        group by
            split_part(dynclass, '>', 1)
        order by
            split_part(dynclass, '>', 1);

        Args:
            id ([type]): [description]

        Returns:
            [type]: [description]
        """

        stm = text("select split_part(sp.dynclass, '>', 1) as dynclass, count(distinct(sp.name)) as asteroids, count(distinct(dsp.ccd_id)) as ccds from des_skybotposition dsp inner join des_skybotjobresult ds on ds.exposure_id = dsp.exposure_id inner join skybot_position sp on sp.id = dsp.position_id where ds.id = %s group by split_part(dynclass, '>', 1) order by split_part(dynclass, '>', 1);" % int(id))

        self.debug_query(stm, True)

        rows = self.fetch_all_dict(stm)

        return rows

    def skybot_estimate(self):

        stm = select([
            func.sum(self.tbl.c.execution_time).label('t_exec_time'),
            func.count(self.tbl.c.exposure_id).label('total'),
        ])

        self.debug_query(stm, True)

        row = self.fetch_one_dict(stm)

        return row

    def count_nights_analyzed_by_period(self, start, end):
        """
            Esta query retorna o total de noites analisadas por um período.

            select
                count(distinct cast(des_exposure.date_obs as DATE))
            from
                des_skybotjobresult
            left outer join des_exposure on
                des_exposure.id = des_skybotjobresult.exposure_id
            where
                des_exposure.date_obs between '2019-01-01 00:00:00' and '2019-12-31 23:59:59';
        """

        de_tbl = self.get_table('des_exposure', self.get_base_schema())

        # des_skybotjobresult
        ds_tbl = self.tbl

        stm = select([func.count(cast(de_tbl.c.date_obs, Date).distinct())]).\
            select_from(
                ds_tbl.join(de_tbl, de_tbl.c.id ==
                            ds_tbl.c.exposure_id, isouter=True)).\
            where(and_(de_tbl.c.date_obs.between(str(start), str(end))))

        self.debug_query(stm, True)

        rows = self.fetch_scalar(stm)

        return rows

    def count_exposures_analyzed_by_period(self, start, end):
        """
            Esta query retorna o total de exposições analisadas por um período.

            select
                count(de.id)
            from
                des_skybotjobresult ds
            left join des_exposure de on
                ds.exposure_id = de.id
            where
                de.date_obs between '2012-01-01 00:00:00' and '2012-12-31 23:59:59';
        """

        de_tbl = self.get_table('des_exposure', self.get_base_schema())

        # des_skybotjobresult
        ds_tbl = self.tbl

        stm = select([func.count(de_tbl.c.id)]).\
            select_from(
                ds_tbl.join(de_tbl, de_tbl.c.id ==
                            ds_tbl.c.exposure_id, isouter=True)).\
            where(and_(de_tbl.c.date_obs.between(str(start), str(end))))

        self.debug_query(stm, True)

        rows = self.fetch_scalar(stm)

        return rows

    def count_ccds_analyzed_by_period(self, start, end):
        """
            Esta query retorna o total de ccds analisadas por um período.

            select
                count(des_ccd.id)
            from
                des_skybotjobresult
            left outer join des_exposure on
                des_exposure.id = des_skybotjobresult.exposure_id
            left outer join des_ccd on
                des_ccd.exposure_id = des_skybotjobresult.exposure_id
            where
                des_exposure.date_obs between '2012-01-01 00:00:00' and '2012-12-31 23:59:59';
        """

        de_tbl = self.get_table('des_exposure', self.get_base_schema())
        dc_tbl = self.get_table('des_ccd', self.get_base_schema())

        # des_skybotjobresult
        ds_tbl = self.tbl

        stm = select([func.count(dc_tbl.c.id)]).\
            select_from(
                ds_tbl.join(
                    de_tbl, de_tbl.c.id == ds_tbl.c.exposure_id,
                    isouter=True
                ).join(
                    dc_tbl, dc_tbl.c.exposure_id == ds_tbl.c.exposure_id,
                    isouter=True
                )).where(and_(de_tbl.c.date_obs.between(str(start), str(end))))

        self.debug_query(stm, True)

        rows = self.fetch_scalar(stm)

        return rows
