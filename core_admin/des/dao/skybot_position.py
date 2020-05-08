from sqlalchemy import column, literal, literal_column, text
from sqlalchemy.sql import and_, select

from tno.db import DBBase
from tno.skybotoutput import SkybotOutput as SkybotOutputDao


class SkybotPositionDao(DBBase):
    def __init__(self):
        super(SkybotPositionDao, self).__init__()

        schema = self.get_base_schema()
        self.tablename = 'des_skybotposition'
        self.tbl = self.get_table(self.tablename, schema)

    # TODO: Mover esses metodos get para a DBBase.
    def get_tablename(self):
        return self.tablename

    def get_table_skybot_position(self):
        return self.tbl

    # TODO: Mover esse metodo para DBBase.
    def count_ccds(self):
        return self.get_count(self.get_table_skybot_position())

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
            tbl = self.get_table_skybot_position()

            # Recupera a tabela do skubot
            tbl_skybot = SkybotOutputDao().get_table_skybot()

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
