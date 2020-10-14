import logging
import traceback
from datetime import datetime, timedelta, timezone
from io import StringIO

import humanize
import pandas as pd

from des.dao import CcdDao, DesSkybotPositionDao
from skybot.dao import SkybotPositionsDao
from skybot.import_positions import ImportSkybotPositions


class DESImportSkybotPositions(ImportSkybotPositions):

    def __init__(self):

        super(DESImportSkybotPositions, self).__init__()

        self.logger = logging.getLogger("skybot_load_data")

        # Abre conexão com o banco de dados usando a Classe Pointing
        self.ccd_dao = CcdDao(pool=False)

        # Abre conexão com o banco usando sqlAlchemy
        self.des_sp_dao = DesSkybotPositionDao(pool=False)

        self.skybot_pos_dao = SkybotPositionsDao(pool=False)

    def import_des_skybot_positions_q3c(self, exposure_id, ticket, filepath):

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
                self.logger.info("Exposure: [%s] Positions [ %s ]" % (
                    exposure_id, str(total_position)))

            else:
                # Aqui inicia a fase de associação com os CCDS
                # Recupera os CCDs da exposição
                ccds = self.ccds_by_exposure_id(exposure_id)

                self.logger.debug(
                    "CCDs: [%s] for Exposure: [%s]" % (len(ccds), exposure_id))
                # Total de posições que estão dentro de algum CCD.
                total_inside_ccd = 0

                # tempo total da associação.
                t0_ccds = datetime.now(timezone.utc)

                # Para cada CCD associa as posições do skybot com os apontamentos do DES.
                for ccd in ccds:
                    try:
                        t0 = datetime.now(timezone.utc)

                        count = self.associate_position_ccd_q3c(
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
                    humanize.naturaldelta(
                        tdelta_ccds, minimum_unit="milliseconds")
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
            self.logger.error(trace)
            self.logger.error(e)
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
            # Faz a query de todos os CCDs por pfw_attempt_id
            rows = self.ccd_dao.ccds_by_exposure(exposure_id)

            return rows

        except Exception as e:
            raise Exception(
                "Failed to retrieve CCDs for exposure with exposure_id=%s. Error: [%s]" % (exposure_id, e))

    def associate_position_ccd_q3c(self, ticket, exposure_id, ccd):
        """Faz a associação das posições com um Des/CCD  Usando Q3C
        executa a função de insert/select cada posição que cair
        dentro do ccd sera inserida na tabela DES/SkybotPositions.

        Arguments:
            ticket {int} -- Id que identifica a requisição feita no skybot
            exposure_id {[type]} -- [description]
            ccd {[type]} -- [description]

        Returns:
            [type] -- [description]
        """
        try:
            # Faz um Insert/Select, na tabela DES/skybot_positons
            # Inserindo uma linha para cada posição que esta dentro do ccd.
            count = self.des_sp_dao.insert_positions_by_ccd(
                ticket,
                exposure_id,
                ccd['id'],
                [ccd['rac1'], ccd['decc1'], ccd['rac2'], ccd['decc2'],
                    ccd['rac3'], ccd['decc3'], ccd['rac4'], ccd['decc4']]
            )

            return count

        except Exception as e:
            raise (e)

    def import_des_skybot_positions(self, exposure_id, ticket, filepath):

        result = dict({
            'success': False,
            'exposure': exposure_id,
            'ticket': ticket,
            'positions': 0,
            'ccds': 0,
            'ccds_with_asteroids': 0,
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

            self.import_output_file(filepath)

            t1_copy = datetime.now(timezone.utc)
            tdelta_copy = t1_copy - t0_copy

            # Ler as posições para o ticket, necessário ler da tabela para ter os ids.
            positions = self.skybot_pos_dao.positions_by_ticket(ticket)
            # Total de posições que foram importadas na tabela skybot
            total_position = len(positions)

            if total_position == 0:
                #  Se não tiver posições ignora a etapa de ccds.
                result.update({
                    'success': True,
                })
                self.logger.info("Exposure: [%s] Positions [ %s ]" % (
                    exposure_id, str(total_position)))

            else:

                # Aqui inicia a fase de associação com os CCDS
                # Recupera os CCDs da exposição
                ccds = self.ccds_by_exposure_id(exposure_id)

                self.logger.debug("CCDs: [%s] for Exposure: [%s]" %
                                  (len(ccds), exposure_id))

                # Total de posições que estão dentro de algum CCD.
                total_inside_ccd = 0

                # tempo total da associação.
                t0_ccds = datetime.now(timezone.utc)

                # Cria um dataframe com as posições
                df_positions = pd.DataFrame(
                    positions, columns=['id', 'raj2000', 'decj2000'])

                # Adiciona uma coluna ccd_id com valor default 0
                df_positions['ccd_id'] = 0

                # Para cada CCD associa as posições do skybot com os apontamentos do DES.
                # é feito um teste antes de verificar a posição. se o ccd já tiver sido identificado
                # é ignorado diminuindo assim as iterações do loop.
                for ccd in ccds:

                    df_positions['ccd_id'] = df_positions.apply(
                        lambda row: row['ccd_id'] if row['ccd_id'] != 0 else self.in_ccd(ccd, row['raj2000'], row['decj2000']), axis=1)

                # Depois de associar cada CCD, faz um filtro no dataframe pegando apenas os que estão dentro de um ccd
                # Filtra as posições que estão dentro de um ccd.
                df_inside = df_positions[df_positions['ccd_id'] > 0]

                # Total de posições que estão dentro de algum CCD.
                total_inside_ccd = df_inside.shape[0]

                df_inside = pd.DataFrame(df_inside)

                ccds_with_asteroids = df_inside['ccd_id'].nunique()
                self.logger.debug(
                    "CCDS With Asteroids: %s" % ccds_with_asteroids)

                # Só faz insert se ouver pelo menos uma posição dentro de algum ccd.
                if total_inside_ccd > 0:
                    # Adiciona a coluna exposure id
                    df_inside['exposure_id'] = int(exposure_id)
                    # Remove as colunas ra e dec
                    df_inside.drop(
                        columns=['raj2000', 'decj2000'], inplace=True)
                    # Renomeia a coluna id para position_id
                    df_inside.rename(
                        columns={'id': 'position_id'}, inplace=True)
                    # Adiciona uma coluna Ticket
                    df_inside['ticket'] = ticket
                    # Ordena as colunas na mesma ordem que a tabela des/skybot_positions
                    df_inside = df_inside.reindex(
                        columns=['ccd_id', 'exposure_id', 'position_id', 'ticket'])
                    # Convert todas as colunas para inteiro
                    df_inside = df_inside.astype(int)

                    # Importa o dataframe no banco de dados usando COPY
                    total_imported = self.import_positions_inside_ccd(
                        df_inside)
                    self.logger.debug("Rows Imported: %s" % total_imported)

                # Total de  posições fora do CCD mas dentro da area da exposição.
                total_outside_ccd = total_position - total_inside_ccd

                t1_ccds = datetime.now(timezone.utc)
                tdelta_ccds = t1_ccds - t0_ccds

                result.update({
                    'success': True,
                    'positions': int(total_position),
                    'ccds': int(len(ccds)),
                    'ccds_with_asteroids': int(ccds_with_asteroids),
                    'inside_ccd': int(total_inside_ccd),
                    'outside_ccd': int(total_outside_ccd),
                    'import_pos_exec_time': tdelta_copy.total_seconds(),
                    'ccd_assoc_exec_time': tdelta_ccds.total_seconds()
                })

        except Exception as e:
            trace = traceback.format_exc()

            result.update({
                'success': False,
                'error': str(e),
                'traceback': trace
            })
            self.logger.error(trace)
            self.logger.error(e)

        finally:
            a_t1 = datetime.now(timezone.utc)
            a_tdelta = a_t1 - a_t0

            self.logger.info("Exposure: [%s] Positions [ %s ] Inside CCDs: [ %s ] Outside: [ %s ] in %s" % (
                exposure_id,
                str(result['positions']),
                str(result['inside_ccd']),
                str(result['outside_ccd']),
                humanize.naturaldelta(
                    a_tdelta, minimum_unit="milliseconds")
            ))

            result.update({
                'start': a_t0.strftime("%Y-%m-%d %H:%M:%S"),
                'finish': a_t1.strftime("%Y-%m-%d %H:%M:%S"),
                'execution_time': a_tdelta.total_seconds(),
            })

            return result

    def import_positions_inside_ccd(self, dataframe):
        """
            Convert the dataframe to csv, and import it into the database.

            Parameters:
                dataframe (dataframe): Pandas Dataframe with the information to be imported.

            Returns:
                rowcount (int):  the number of rows imported.

            Example SQL Copy:
                COPY tno_skybotoutput (num, name, dynclass, ra, dec, raj2000, decj2000, mv, errpos, d, dracosdec, ddec, dgeo, dhelio, phase, solelong, px, py, pz, vx, vy, vz, jdref) FROM '/data/teste.csv' with (FORMAT CSV, DELIMITER ';', HEADER);

        """
        # Converte o Data frame para csv e depois para arquivo em memória.
        # Mantem o header do csv para que seja possivel escolher na query COPY quais colunas
        # serão importadas.
        # Desabilita o index para o pandas não criar uma coluna a mais com id que não corresponde a tabela.
        self.logger.debug("Converting the pandas dataframe to csv")
        data = StringIO()
        dataframe.to_csv(
            data,
            sep="|",
            header=True,
            index=False,
        )
        data.seek(0)

        try:
            self.logger.debug("Executing the import function on the database.")

            # Recupera o nome da tabela des/skybot_positions
            table = self.des_sp_dao.get_tablename()
            # Sql Copy com todas as colunas que vão ser importadas e o formato do csv.
            sql = "COPY %s (ccd_id, exposure_id, position_id, ticket) FROM STDIN with (FORMAT CSV, DELIMITER '|', HEADER);" % table

            # Executa o metodo que importa o arquivo csv na tabela.
            rowcount = self.des_sp_dao.import_with_copy_expert(sql, data)

            self.logger.debug("Successfully imported")

            # Retorna a quantidade de linhas que foram inseridas.
            return rowcount

        except Exception as e:
            raise Exception("Failed to import data. Error: [%s]" % e)

    def in_ccd(self, ccd, ra, dec):
        # self.logger.debug("CCD: %s RA: %s Dec: %s" % (ccd['ccdnum'], ra, dec))

        ra = float(ra)
        dec = float(dec)

        ra = (ra - 360) if ra > 180 else ra

        # Lower Left
        rall = float(ccd['rac2'])
        rall = (rall - 360) if rall > 180 else rall

        decll = float(ccd['decc2'])

        # Upper Right
        raur = float(ccd['rac4'])
        raur = (raur - 360) if raur > 180 else raur

        decur = float(ccd['decc4'])
        if (rall < ra and decll < dec) and (raur > ra and decur > dec):
            # Esta dentro do CCD
            # self.logger.debug("RA: %s Dec: %s inside CCD: %s " % (ra, dec, ccd['id']))
            return int(ccd['id'])
        else:
            return 0
