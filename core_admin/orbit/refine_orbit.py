import os, errno
import logging
from sqlalchemy.sql import select, or_, func, text, case
from sqlalchemy.sql.expression import literal_column
from tno.db import DBBase
import csv
from .bsp_jpl import BSPJPL
from orbit.observations import GetObservations
from orbit.orbital_parameters import GetOrbitalParameters
from common.jsonfile import JsonFile
from datetime import datetime
import humanize

class RefineOrbit():
    def __init__(self):
        self.logger = logging.getLogger("refine_orbit")

        self.bsp_jpl_input_file = None
        self.observations_input_file = None

    def startRefineOrbitRun(self, instance):
        self.logger.debug("ORBIT RUN: %s" % instance.id)

        # Recuperar a Instancia do processo
        proccess = instance.proccess

        self.logger.debug("PROCCESS: %s" % proccess.id)
        self.logger.debug("PROCCESS DIR: %s" % proccess.relative_path)

        # recuperar a Custom List usada como input
        customlist = instance.input_list
        self.logger.debug("CUSTOM LIST: %s - %s" % (customlist.id, customlist.displayname))

        instance.status = 'running'
        instance.save()
        self.logger.info("Status changed to Running")

        # Criar um diretorio para os arquivos do NIMA
        instance = RefineOrbit().createRefienOrbitDirectory(instance)

        # Json file with step states:
        self.logger.info("Writing status file")
        steps = dict({
            "observations": False,
            "orbital_parameters": False,
            "bsp_jpl": False
        })
        steps_file = os.path.join(instance.relative_path, 'steps.json')
        JsonFile().write(steps, steps_file)

        # Tempo maximo de validade para os arquivos baixados em dias.
        # TODO: pode vir como parametro da interface, None para atualizar todos.
        max_age = 30

        self.logger.info("Starting Download")

        t0 = datetime.now()
        # ---------------------- Observations ----------------------
        # Pesquisando as observacoes que precisam ser baixadas
        observations = RefineOrbitDB().get_observations(customlist.tablename, customlist.schema, max_age)

        self.observations_input_file = os.path.join(instance.relative_path, 'observations.csv')
        RefineOrbit().writer_refine_orbit_file_list(self.observations_input_file, observations)

        # Download das Observations
        self.getObservations(instance, self.observations_input_file, steps_file)

        # ---------------------- Orbital Parameters ----------------------
        # Pesquisando os parametros orbitais que precisam ser baixadas
        orbital_parameters = RefineOrbitDB().get_orbital_parameters(customlist.tablename, customlist.schema, max_age)

        self.orbital_parameters_input_file = os.path.join(instance.relative_path, 'orbital_parameters.csv')
        self.writer_refine_orbit_file_list(self.orbital_parameters_input_file, orbital_parameters)

        # Download dos parametros Orbitais
        self.getOrbitalParameters(instance, self.orbital_parameters_input_file, steps_file)


        # ---------------------- BSPs ----------------------
        # Pesquisando os bsp_jpl que precisam ser baixadas
        bsp_jpl = RefineOrbitDB().get_bsp_jpl(customlist.tablename, customlist.schema, max_age)

        self.bsp_jpl_input_file = os.path.join(instance.relative_path, 'bsp_jpl.csv')
        RefineOrbit().writer_refine_orbit_file_list(self.bsp_jpl_input_file, bsp_jpl)

        # Download dos BSP JPL
        self.getBspJplFiles(instance, self.bsp_jpl_input_file, steps_file)


        t1 = datetime.now()
        tdelta = t1 - t0
        self.logger.info("Download Finish in %s" % humanize.naturaldelta(tdelta))


    def getObservations(self, instance, input_file, step_file):
        """
            Executa a etapa de download dos arquivos Observations vindo do AstDys ou MPC,
            essa etapa verifica quantos arquivos precisam ser baixados, faz o download
            e os arquivos ficam disponiveis no diretorio externo ao processo.

        :param instance:
        """

        GetObservations().run(input_file=input_file, output_path=instance.relative_path, step_file=step_file)


    def getOrbitalParameters(self, instance, input_file, step_file):
        """
            Executa a etapa de download dos arquivos Orbital Parametros vindo do AstDys ou MPC,
            essa etapa verifica quantos arquivos precisam ser baixados, faz o download
            e os arquivos ficam disponiveis no diretorio externo ao processo.

        :param instance:
        """

        GetOrbitalParameters().run(input_file=input_file, output_path=instance.relative_path, step_file=step_file)


    def getBspJplFiles(self, instance, input_file, step_file):
        """
            Executa a etapa de download dos arquivos bsp vindo do JPL,
            essa etapa verifica quantos arquivos precisam ser baixados, faz o download
            e os arquivos ficam disponiveis no diretorio externo ao processo.

        :param instance:
        """

        BSPJPL().run(input_file=input_file, output_path=instance.relative_path, step_file=step_file)


    def createRefienOrbitDirectory(self, instance):

        proccess = instance.proccess
        # Criar um diretorio para o Refine Orbit
        directory_name = "refine_orbit_%s" % instance.id
        directory = os.path.join(proccess.relative_path, directory_name)

        try:
            # Criar o Diretorio
            os.makedirs(directory)

            if os.path.exists(directory):
                # Alterar a Permissao do Diretorio
                os.chmod(directory, 0o775)

                self.logger.info("Refine Orbit directory created")
                self.logger.debug("Directory: %s" % directory)

                instance.relative_path = directory
                instance.save()

                return instance
            else:
                instance.status = 'error'
                instance.save()
                msg = "Failed to create refine orbit directory [ %s ]" % directory
                self.logger.error(msg)
                raise Exception(msg)


        except OSError as e:
            instance.status = 'error'
            instance.save()
            self.logger.error("Failed to create refine orbit directory [ %s ]" % directory)
            if e.errno != errno.EEXIST:
                self.logger.error(e)
                raise

    def writer_refine_orbit_file_list(self, file_path, records):
        """

        """
        self.logger.info("Writing Input File")
        self.logger.debug("Input File: %s" % file_path)

        header_orb_param = ["name", "num", "filename", "need_download"]

        with open(file_path, 'w') as csvfile:
            fieldnames = header_orb_param
            writer = csv.DictWriter(csvfile, fieldnames=fieldnames, delimiter=';', extrasaction='ignore')

            writer.writeheader()

            # Fix boolean field
            for row in records:
                row.update({
                    "need_download": bool(row.get("need_download"))
                })

                writer.writerow(row)

        return file_path


class RefineOrbitDB(DBBase):
    def get_observations(self, tablename, schema=None, max_age=None):
        """
            SELECT a.name, a.num, b.download_finish_time, CASE WHEN (b.download_finish_time < now() - INTERVAL '30 DAY') THEN true ELSE false END AS need_download  FROM martin_test_list AS a LEFT OUTER JOIN orbit_observationfile AS b ON a.name = b.name GROUP BY a.name, a.num, b.download_finish_time ORDER BY a.name
        """

        table = self.get_table_observations_file()

        stm = self._get_stm_download_tables_record(tablename, table, schema, max_age)

        rows = self.fetch_all_dict(stm)

        return rows

    def get_orbital_parameters(self, tablename, schema=None, max_age=None):
        """
        """
        table = self.get_table_orbital_parameters_file()

        stm = self._get_stm_download_tables_record(tablename, table, schema, max_age)

        rows = self.fetch_all_dict(stm)

        return rows

    def get_bsp_jpl(self, tablename, schema=None, max_age=None):
        """
        """

        table = self.get_table_bsp_jpl_file()

        stm = self._get_stm_download_tables_record(tablename, table, schema, max_age)

        rows = self.fetch_all_dict(stm)

        return rows

    def _get_stm_download_tables_record(self, tablename, join_table, schema=None, max_age=None):

        tbl = self.get_table(tablename, schema).alias('a')
        tbl2 = join_table.alias('b')

        stm_join = tbl.join(
            tbl2, tbl.c.name == tbl2.c.name, isouter=True)

        cols = [
            tbl.c.name,
            tbl.c.num,
            tbl2.c.filename,
            tbl2.c.download_finish_time,
        ]

        if max_age is None:
            cols.append(
                literal_column('True').label('need_download')
            )
        else:
            cols.append(
                case(
                    [
                        (tbl2.c.download_finish_time < (
                            func.now() - text('INTERVAL \'%s DAY\'' % int(max_age))), True),
                        (tbl2.c.download_finish_time.is_(None), True)
                    ],
                    else_=False
                ).label('need_download'),
            )

        stm = select(cols).select_from(stm_join)

        # Agrupamento
        stm = stm.group_by(
            tbl.c.name,
            tbl.c.num,
            tbl2.c.filename,
            tbl2.c.download_finish_time)

        # Ordenacao
        stm = stm.order_by(tbl.c.name)

        return stm
