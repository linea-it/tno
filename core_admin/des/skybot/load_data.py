from datetime import datetime, timedelta, timezone

import humanize

from des.dao import CcdDao, SkybotPositionDao
from tno.skybot.new_load_data import ImportSkybotPositions
import pandas 

class DESImportSkybotPositions(ImportSkybotPositions):

    def teste(self):
        self.logger.info("TESTE DES Import Skybot Positions")

    def import_des_skybot_positions(self, exposure_id, ticket, filepath):

        # Inicio da Associação com CCDs
        a_t0 = datetime.now(timezone.utc)

        df = self.import_output_file(filepath)

        # Recupera os CCDs da exposição
        ccds = self.ccds_by_exposure_id(exposure_id)

        # Para cada CCD associa as posições do skybot com os apontamentos do DES.
        self.logger.info(
            "Making the association for CCDs: [ %s ]" % str(len(ccds)).ljust(2, ' '))

        # Total de posições retornadas pelo Skybot
        total_position = df.shape[0]

        # Total de posições que estão dentro de algum CCD.
        total_inside_ccd = 0

        for ccd in ccds:
            # for idx, ccd in enumerate(ccds[0:1], start=1):
            try:
                t0 = datetime.now(timezone.utc)

                count = self.associate_position_ccd(
                    ticket, exposure_id, ccd)

                total_inside_ccd += count

                t1 = datetime.now(timezone.utc)
                tdelta = t1 - t0

                self.logger.debug(
                    "CCD NUM: [ %s ] had [ %s ] positions associated in %s" % (
                        str(ccd['ccdnum']).rjust(2, ' '),
                        str(count).rjust(4, ' '),
                        humanize.naturaldelta(tdelta, minimum_unit="milliseconds")))

            except Exception as e:
                msg = "Failed to make ccd association CCD ID: [%s] CCD Num: [%s] Error: %s" % (
                    ccd['id'], ccd['ccdnum'], e)
                raise Exception(msg)

        # Total de  posições fora do CCD mas dentro da area da exposição.
        total_outside_ccd = total_position - total_inside_ccd

        self.logger.info("Positions inside the CCDs:[ %s ] Positions outside: [ %s ] Total positions: [ %s ]" % (
            str(total_inside_ccd).rjust(4, ' '),
            str(total_outside_ccd).rjust(4, ' '),
            str(total_position).rjust(4, ' '),
        ))

        a_t1 = datetime.now(timezone.utc)
        a_tdelta = a_t1 - a_t0

        self.logger.info("CCD association completed in %s" % humanize.naturaldelta(
            a_tdelta, minimum_unit="milliseconds"))

        # TODO retornar um dict com os resultados da importação.

    def ccds_by_exposure_id(self, exposure_id):
        """
            Retorna todos os ccds de uma exposição. 
            uma exposição é igual N ccds normalmente 61. 

            Parameters:
                exposure_id (int): primary key from des_exposure table. 

            Returns:
                rows (array): An array with all the ccds of the exhibition 
                    following the structure of the table des_ccds            
        """
        self.logger.debug("Retrieving the CCDs. Exposure ID[%s]" % exposure_id)

        try:
            # Abre conexão com o banco de dados usando a Classe Pointing
            db = CcdDao()
            # Faz a query de todos os CCDs por pfw_attempt_id
            rows = db.ccds_by_exposure(exposure_id)

            self.logger.debug("CCDs [%s]" % len(rows))

            return rows

        except Exception as e:
            raise Exception(
                "Failed to retrieve CCDs for exposure with exposure_id=%s. Error: [%s]" % (exposure_id, e))

    def associate_position_ccd(self, ticket, exposure_id, ccd):
        try:
            # Abre conexão com o banco usando da DAO SkybotPosition
            db = SkybotPositionDao()

            # Faz um Insert/Select, na tabela DES/skybot_positons
            # Inserindo uma linha para cada posição que esta dentro do ccd.
            count = db.insert_positions_by_ccd(
                ticket,
                exposure_id,
                ccd['id'],
                [ccd['rac1'], ccd['decc1'], ccd['rac2'], ccd['decc2'],
                    ccd['rac3'], ccd['decc3'], ccd['rac4'], ccd['decc4']]
            )

            return count

        except Exception as e:
            raise (e)
