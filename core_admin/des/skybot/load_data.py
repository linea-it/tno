import traceback
from datetime import datetime, timedelta, timezone

import humanize
import pandas

from des.dao import CcdDao, SkybotPositionDao
from tno.skybot.new_load_data import ImportSkybotPositions


class DESImportSkybotPositions(ImportSkybotPositions):

    def import_des_skybot_positions(self, exposure_id, ticket, filepath):

        result = dict({
            'success': False,
            'exposure': exposure_id,
            'ticket': ticket,
            'positions': 0,
            'ccds': 0,
            'inside_ccd': 0,
            'outside_ccd': 0,
            'start': None,
            'finish': None,
            'execution_time': None,
            'import_pos_exec_time': None,
            'ccd_assoc_exec_time': None,
            'error': None,
            'traceback': None
        })

        a_t0 = datetime.now(timezone.utc)

        try:
            # Importa as posições no Skybot
            t0_copy = datetime.now(timezone.utc)

            df = self.import_output_file(filepath)

            t1_copy = datetime.now(timezone.utc)
            tdelta_copy = t1_copy - t0_copy

            # Total de posições importadas na tabela skybot
            total_position = df.shape[0]

            if total_position == 0:
                #  Se não tiver posições ignora a etapa de ccds.
                result.update({
                    'success': True,
                })
                self.logger.info("Exposure: [%s] Positions [ %s ]" % (exposure_id, str(total_position)))            

            else :
                # Aqui inicia a fase de associação com os CCDS
                # Recupera os CCDs da exposição
                ccds = self.ccds_by_exposure_id(exposure_id)

                # Total de posições que estão dentro de algum CCD.
                total_inside_ccd = 0

                # tempo total da associação.
                t0_ccds = datetime.now(timezone.utc)

                # TODO:  Se não tiver nenhuma posição não fazer associação por cccd.

                # Para cada CCD associa as posições do skybot com os apontamentos do DES.
                for ccd in ccds:
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

                t1_ccds = datetime.now(timezone.utc)
                tdelta_ccds = t1_ccds - t0_ccds

                self.logger.info("Exposure: [%s] Positions [ %s ] Inside CCDs: [ %s ] Outside: [ %s ] in %s" % (
                    exposure_id,
                    str(total_position),
                    str(total_inside_ccd),
                    str(total_outside_ccd),
                    humanize.naturaldelta(tdelta_ccds, minimum_unit="milliseconds")
                ))            

                result.update({
                    'success': True,
                    'positions': total_position,
                    'ccds': len(ccds),
                    'inside_ccd': total_inside_ccd,
                    'outside_ccd': total_outside_ccd,
                    'import_pos_exec_time': tdelta_copy.total_seconds(),
                    'ccd_assoc_exec_time': tdelta_ccds.total_seconds()
                })

        except Exception as e:
            trace = traceback.format_exc()
            result.update({
                'error': str(e),
                'traceback': trace
            })
        finally:
            a_t1 = datetime.now(timezone.utc)
            a_tdelta = a_t1 - a_t0

            self.logger.debug("Completed data import for exposure [%s] in %s" % (exposure_id, humanize.naturaldelta(
                a_tdelta, minimum_unit="milliseconds")))

            result.update({
                'start': a_t0.strftime("%Y-%m-%d %H:%M:%S"),
                'finish': a_t1.strftime("%Y-%m-%d %H:%M:%S"),
                'execution_time': a_tdelta.total_seconds(),
            })

            return result

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
