from sqlalchemy import Date, cast, column, literal, literal_column, text, func
from sqlalchemy.sql import and_, select

from skybot.dao.skybot_positions import SkybotPositionsDao
from tno.db import DBBase


class DesSkybotPositionDao(DBBase):
    def __init__(self, pool=True):
        super(DesSkybotPositionDao, self).__init__(pool)

        schema = self.get_base_schema()
        self.tablename = 'des_skybotposition'
        self.tbl = self.get_table(self.tablename, schema)

    # TODO: Mover esses metodos get para a DBBase.
    def get_tablename(self):
        return self.tablename

    # TODO: Criar um metodo que retorne todas as posições para uma exposição

    # TODO: Criar um metodo que retorne todas as posições para um ccd.

    def insert_positions_by_ccd(self, ticket, exposure_id, ccd_id, corners):
        """
            Insere as posições do skybot output que caem dentro de um dos CCDs do des.
            Utiliza o Ticket da requisição do skybot, para agilizar a query, fazendo que leia só os objetos de interesse e não a tabela toda.
            O Select é feito usando Q3C Poly query com as posições dos 4 cantos do CCD.
            A estrátegia é: Insere nesta tabela apenas as posições do skybot_output que caem dentro de um ccd.

            Parameters:
                ticket (int): Skybot ticket number example: 166515392791779001

                exposure_id (int): primary key from des_exposure table.

                ccd_id (int): primary key from des_ccd table.

                corners (array): An array with the positions of the corners of the ccd,
                    in the following order: [ccd['rac1'], ccd['decc1'], ccd['rac2'], ccd['decc2'], ccd['rac3'], ccd['decc3'],ccd['rac4'], ccd['decc4']]
            Returns:
                rowcount (int): Total rows inserted
        """
        try:
            # tabela Des Skybot Position
            tbl = self.tbl

            # Recupera a tabela do skubot
            tbl_skybot = SkybotPositionsDao().get_tbl()

            # ATENÇÃO: A ordem das colunas no select e no insert deve ser a mesma
            # que está na tabela fisica do banco de dados neste caso:
            # ccd_id, exposure_id, position_id

            # Select na tabela de outputs do skybot
            # usando Q3C para recuperar as posições que estão dentro do ccd.
            # Este statement gera uma query como esta
            # select
            #     1415975651 as ccd_id,
            #     2450858 as exposure_id,
            #     tno_skybotoutput.id as position_id
            # from
            #     tno_skybotoutput
            # where
            #     q3c_poly_query("raj2000",
            #     "decj2000",
            #     '{359.540844, 0.976806, 359.540543, 0.827607, 359.83968, 0.827596, 359.839912, 0.976657}')
            #     and tno_skybotoutput.ticket = 166515392791779001

            stm_sel = select([
                column(str(ccd_id), is_literal=True).label('ccd_id'),
                column(str(exposure_id), is_literal=True).label('exposure_id'),
                tbl_skybot.c.id.label('position_id')
            ]).where(and_(
                tbl_skybot.c.ticket == ticket,
                text("q3c_poly_query(\"raj2000\", \"decj2000\", '{%s, %s, %s, %s, %s, %s, %s, %s}')" % (
                    corners[0], corners[1], corners[2], corners[3], corners[4], corners[5], corners[6], corners[7]))
            ))

            # Executa a query de Inserção/Select na tabela Des/Skybot Positions.
            # este statement gera uma query como está:
            # insert
            #     into
            #     des_skybotposition (ccd_id,
            #     exposure_id,
            #     position_id)
            # select
            #     1415975625 as ccd_id,
            #     2450858 as exposure_id,
            #     tno_skybotoutput.id as position_id
            # from
            #     tno_skybotoutput
            # where
            #     tno_skybotoutput.ticket = 166515392791779001
            #     and q3c_poly_query("raj2000",
            #     "decj2000",
            #     '{0.160099, -0.831899, 0.159831, -0.980955, 0.458933, -0.981232, 0.459265, -0.832037}')

            stm_insert = tbl.insert().from_select(
                ['ccd_id', 'exposure_id', 'position_id'],
                stm_sel
            )

            self.debug_query(stm_insert, True)

            with self.engine.connect() as con:
                result = con.execute(stm_insert)

                return result.rowcount

        except Exception as e:
            raise(e)

    def ccds_for_position(self, start, end, dynclass=None, name=None):
        """Retorna os DES/CCDs  relacionados as posições filtrados por tipo de objeto nome do objeto e periodo.
        O filtro por periodo é obrigatório, classe e nome são opcionais e podem ser combinados.
        Args:
            start (datetime): Periodo inicial que sera usado na seleção.
            end (datetime): Periodo final que sera usado na seleção.
            dynclass (str, optional): Classe dinamica do objeto a query é feita com like dynclass%. Defaults to None.
            name (str, optional): Nome do objeto como está na tabela skybot_position. Defaults to None.


        Query de exemplo:

            select
                dc.*, date(de.date_obs) as date_obs
            from
                des_ccd dc
            inner join des_exposure de on
                dc.exposure_id = de.id
            inner join des_skybotposition ds on
                dc.id = ds.ccd_id
            inner join skybot_position sp on ds.position_id = sp.id
            where
                dc.id not in (select dd.ccd_id from des_downloadccdjobresult dd ) and
                sp.dynclass like 'KBO%' and
            --    sp.name = '1999 RG215' and
                de.date_obs between '2012-11-10 00:00:00' and '2012-11-11 23:59:50'
            group by dc.id, date(de.date_obs)
            order by
                date(de.date_obs);

        Returns:
            [array]: com o conteudo da tabela des_ccd com as linhas que atendem aos critérios.
        """
        # des_ccd
        dc = self.get_table('des_ccd', self.get_base_schema())

        # des_exposure
        de = self.get_table('des_exposure', self.get_base_schema())

        # Des skybot position
        ds = self.tbl

        # Skybot Position
        sp = self.get_table('skybot_position', self.get_base_schema())

        # Des Download CCD Job Result
        dd = self.get_table('des_downloadccdjobresult', self.get_base_schema())

        # Clausula where pelo periodo que é obrigatório
        clause = list([
            dc.c.id.notin_(select([dd.c.ccd_id])),
            de.c.date_obs.between(str(start), str(end))
        ])

        # Clausula where pela classe dos objetos.
        if dynclass is not None:
            clause.append(sp.c.dynclass.ilike(dynclass + '%'))

        # Clausula where pelo nome dos objetos.
        if name is not None:
            clause.append(sp.c.name == name)

        columns = list(dc.c)
        columns.append(cast(de.c.date_obs, Date).label('date_obs'))

        stm = select(columns).\
            select_from(
            dc.join(
                de, dc.c.exposure_id == de.c.id
            ).join(
                ds, dc.c.id == ds.c.ccd_id
            ).join(
                sp, ds.c.position_id == sp.c.id
            )).\
            where(and_(and_(*clause))).\
            group_by(dc.c.id, cast(de.c.date_obs, Date)).\
            order_by(cast(de.c.date_obs, Date))

        self.debug_query(stm, True)

        rows = self.fetch_all_dict(stm)

        return rows

    def count_asteroids_by_dynclass(self, dynclass, start=None, end=None):
        """Retorna o total de Asteroids unicos em um periodo pela dynclass

        Args:
            dynclass ([type]): [description]
            start ([type], optional): [description]. Defaults to None.
            end ([type], optional): [description]. Defaults to None.

        select
            count(distinct(sp.name)) as asteroids
        from
            des_skybotposition ds
        inner join skybot_position sp on
            ds.position_id = sp.id
        inner join des_exposure de on
            ds.exposure_id = de.id
        where
            sp.dynclass like 'KBO%'
            and de.date_obs between '2012-11-01 00:00:00' and '2012-11-30 23:59:50'

        Returns:
            int: Total de Asteroids
        """

        # des_exposure
        de = self.get_table('des_exposure', self.get_base_schema())
        # Des skybot position
        ds = self.get_table('des_skybotposition', self.get_base_schema())
        # Skybot Position
        sp = self.get_table('skybot_position', self.get_base_schema())

        # Clausula where pela classe dos objetos OBRIGATORIO.
        clause = list([sp.c.dynclass.ilike(dynclass + '%')])

        # Clausula where pelo periodo que é opicional
        if start is not None and end is not None:
            clause.append(de.c.date_obs.between(str(start), str(end)))

        stm = select([func.count(sp.c.name.distinct()).label('asteroid')]).\
            select_from(
            ds.join(
                sp, ds.c.position_id == sp.c.id
            ).join(
                de, ds.c.exposure_id == de.c.id
            )
        ).\
            where(and_(and_(*clause)))

        self.debug_query(stm, True)

        rows = self.fetch_scalar(stm)

        return rows

    def count_ccds_by_dynclass(self, dynclass, start=None, end=None):
        """Retorna o total de CCDs unicos em um periodo pela dynclass

        Args:
            dynclass ([type]): [description]
            start ([type], optional): [description]. Defaults to None.
            end ([type], optional): [description]. Defaults to None.

        select
            count(distinct(ds.ccd_id)) as ccds
        from
            des_skybotposition ds
        inner join skybot_position sp on
            ds.position_id = sp.id
        inner join des_exposure de on
            ds.exposure_id = de.id
        where
            sp.dynclass like 'Centaur%'
            and de.date_obs between '2012-11-01 00:00:00' and '2012-11-30 23:59:50'

        Returns:
            int: Total de CCDs
        """

        # des_exposure
        de = self.get_table('des_exposure', self.get_base_schema())
        # Des skybot position
        ds = self.get_table('des_skybotposition', self.get_base_schema())
        # Skybot Position
        sp = self.get_table('skybot_position', self.get_base_schema())

        # Clausula where pela classe dos objetos OBRIGATORIO.
        clause = list([sp.c.dynclass.ilike(dynclass + '%')])

        # Clausula where pelo periodo que é opicional
        if start is not None and end is not None:
            clause.append(de.c.date_obs.between(str(start), str(end)))

        stm = select([func.count(ds.c.ccd_id.distinct()).label('ccds')]).\
            select_from(
            ds.join(
                sp, ds.c.position_id == sp.c.id
            ).join(
                de, ds.c.exposure_id == de.c.id
            )
        ).\
            where(and_(and_(*clause)))

        self.debug_query(stm, True)

        rows = self.fetch_scalar(stm)

        return rows

    def count_ccds_downloaded_by_dynclass(self, dynclass, start=None, end=None):
        """Retorna o total de CCDs que já foram baixados em um periodo pela dynclass

        Args:
            dynclass ([type]): [description]
            start ([type], optional): [description]. Defaults to None.
            end ([type], optional): [description]. Defaults to None.

            select
                count(distinct (dd.id)) as ccds_downloaded
            from
                des_skybotposition ds
            inner join skybot_position sp on
                ds.position_id = sp.id
            inner join des_exposure de on
                ds.exposure_id = de.id
            left join des_downloadccdjobresult dd on
                ds.ccd_id = dd.ccd_id
            where
                sp.dynclass like 'Centaur%'
                and de.date_obs between '2012-11-01 00:00:00' and '2012-11-30 23:59:50'

        Returns:
            int: Total de CCDs Downloaded
        """

        # des_exposure
        de = self.get_table('des_exposure', self.get_base_schema())
        # Des skybot position
        ds = self.get_table('des_skybotposition', self.get_base_schema())
        # Skybot Position
        sp = self.get_table('skybot_position', self.get_base_schema())
        # Des Downloaded CCD Job Result
        dd = self.get_table('des_downloadccdjobresult', self.get_base_schema())

        # Clausula where pela classe dos objetos OBRIGATORIO.
        clause = list([sp.c.dynclass.ilike(dynclass + '%')])

        # Clausula where pelo periodo que é opicional
        if start is not None and end is not None:
            clause.append(de.c.date_obs.between(str(start), str(end)))

        stm = select([func.count(dd.c.id.distinct()).label('ccds_downloaded')]).\
            select_from(
            ds.join(
                sp, ds.c.position_id == sp.c.id
            ).join(
                de, ds.c.exposure_id == de.c.id
            ).join(
                dd, ds.c.ccd_id == dd.c.ccd_id, isouter=True
            )
        ).\
            where(and_(and_(*clause)))

        self.debug_query(stm, True)

        rows = self.fetch_scalar(stm)

        return rows

    def count_nights_by_dynclass(self, dynclass, start=None, end=None):
        """Retorna o total de noites unicas em um periodo pela dynclass

        Args:
            dynclass ([type]): [description]
            start ([type], optional): [description]. Defaults to None.
            end ([type], optional): [description]. Defaults to None.

            select
                sp.dynclass,
                count(distinct date(de.date_obs)) as nights_analysed
            from
                des_skybotposition ds
            left join skybot_position sp on
                ds.position_id = sp.id
            inner join des_exposure de on
                ds.exposure_id = de.id
            group by
                sp.dynclass;

        Returns:
            int: Total de CCDs
        """

        # des_exposure
        de = self.get_table('des_exposure', self.get_base_schema())
        # Des skybot position
        ds = self.get_table('des_skybotposition', self.get_base_schema())
        # Skybot Position
        sp = self.get_table('skybot_position', self.get_base_schema())

        # Clausula where pela classe dos objetos OBRIGATORIO.
        clause = list([sp.c.dynclass.ilike(dynclass + '%')])

        # Clausula where pelo periodo que é opicional
        if start is not None and end is not None:
            clause.append(de.c.date_obs.between(str(start), str(end)))

        stm = select([func.count(cast(de.c.date_obs, Date).distinct())]).\
            select_from(
            ds.join(
                sp, ds.c.position_id == sp.c.id
            ).join(
                de, ds.c.exposure_id == de.c.id
            )
        ).\
            where(and_(and_(*clause)))

        self.debug_query(stm, True)

        rows = self.fetch_scalar(stm)

        return rows

    def count_positions_by_dynclass(self, dynclass, start=None, end=None):
        """Retorna o total de Asteroids unicos em um periodo pela dynclass

        Args:
            dynclass ([type]): [description]
            start ([type], optional): [description]. Defaults to None.
            end ([type], optional): [description]. Defaults to None.

        select
            count(distinct(sp.id)) as asteroids
        from
            des_skybotposition ds
        inner join skybot_position sp on
            ds.position_id = sp.id
        inner join des_exposure de on
            ds.exposure_id = de.id
        where
            sp.dynclass like 'KBO%'
            and de.date_obs between '2012-11-01 00:00:00' and '2012-11-30 23:59:50'

        Returns:
            int: Total de Asteroids
        """

        # des_exposure
        de = self.get_table('des_exposure', self.get_base_schema())
        # Des skybot position
        ds = self.get_table('des_skybotposition', self.get_base_schema())
        # Skybot Position
        sp = self.get_table('skybot_position', self.get_base_schema())

        # Clausula where pela classe dos objetos OBRIGATORIO.
        clause = list([sp.c.dynclass.ilike(dynclass + '%')])

        # Clausula where pelo periodo que é opicional
        if start is not None and end is not None:
            clause.append(de.c.date_obs.between(str(start), str(end)))

        stm = select([func.count(ds.c.id)]).\
            select_from(
            ds.join(
                sp, ds.c.position_id == sp.c.id
            ).join(
                de, ds.c.exposure_id == de.c.id
            )
        ).\
            where(and_(and_(*clause)))

        self.debug_query(stm, True)

        rows = self.fetch_scalar(stm)

        return rows

    def count_bands_by_dynclass(self, dynclass, start=None, end=None):
        """Retorna o total de asteroides para cada banda em um periodo pela dynclass

        Args:
            dynclass ([type]): [description]
            start ([type], optional): [description]. Defaults to None.
            end ([type], optional): [description]. Defaults to None.

        select
            count(distinct(sp.id)) as asteroids
        from
            des_skybotposition ds
        inner join skybot_position sp on
            ds.position_id = sp.id
        inner join des_exposure de on
            ds.exposure_id = de.id
        where
            sp.dynclass like 'KBO%'
            and de.date_obs between '2012-11-01 00:00:00' and '2012-11-30 23:59:50'

        Returns:
            int: Total de Asteroids
        """

        # des_exposure
        de = self.get_table('des_exposure', self.get_base_schema())
        # Des skybot position
        ds = self.get_table('des_skybotposition', self.get_base_schema())
        # Skybot Position
        sp = self.get_table('skybot_position', self.get_base_schema())

        # Clausula where pela classe dos objetos OBRIGATORIO.
        clause = list([sp.c.dynclass.ilike(dynclass + '%')])

        # Clausula where pelo periodo que é opicional
        if start is not None and end is not None:
            clause.append(de.c.date_obs.between(str(start), str(end)))

        stm = select([de.c.band, func.count(ds.c.id).label('asteroids')]).\
            select_from(
            ds.join(
                sp, ds.c.position_id == sp.c.id
            ).join(
                de, ds.c.exposure_id == de.c.id
            )
        ).\
            where(and_(and_(*clause))).\
            group_by(de.c.band)

        self.debug_query(stm, True)

        rows = self.fetch_all_dict(stm)

        return rows

    def ccds_by_asteroid(self, asteroid_name):

        # des_exposure
        de = self.get_table('des_exposure', self.get_base_schema())
        # des_ccd
        dc = self.get_table('des_ccd', self.get_base_schema())
        # Des skybot position
        ds = self.get_table('des_skybotposition', self.get_base_schema())
        # Skybot Position
        sp = self.get_table('skybot_position', self.get_base_schema())

        # Clausula where pelo nome do objeto OBRIGATORIO.
        clause = list([sp.c.name == asteroid_name])

        columns = dc.c + [de.c.id.label('expnum'),
                          de.c.date_obs, de.c.band, de.c.release]

        stm = select(columns).\
            select_from(
            ds.join(
                sp, ds.c.position_id == sp.c.id
            ).join(
                dc, ds.c.ccd_id == dc.c.id
            ).join(
                de, ds.c.exposure_id == de.c.id
            )
        ).\
            where(and_(and_(*clause)))

        self.debug_query(stm, True)

        rows = self.fetch_all_dict(stm)

        return rows
