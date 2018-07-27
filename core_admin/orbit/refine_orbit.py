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
from tno.proccess import ProccessManager
import shutil
from praia.astrometry import Astrometry


class RefineOrbit():
    def __init__(self):
        self.logger = logging.getLogger("refine_orbit")

        self.bsp_jpl_input_file = None
        self.observations_input_file = None

        self.proccess = None
        self.input_list = None
        self.objects_dir = None

    def startRefineOrbitRun(self, instance):
        self.logger.debug("ORBIT RUN: %s" % instance.id)

        # Recuperar a Instancia do processo
        self.proccess = instance.proccess

        self.logger.debug("PROCCESS: %s" % self.proccess.id)
        self.logger.debug("PROCCESS DIR: %s" % self.proccess.relative_path)

        # Diretorio onde ficam os inputs e resultados separados por objetos.
        self.objects_dir = os.path.join(self.proccess.relative_path, "objects")

        # recuperar a Custom List usada como input
        self.input_list = instance.input_list
        self.logger.debug("CUSTOM LIST: %s - %s" % (self.input_list.id, self.input_list.displayname))

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
        # ---------------------- Observations --------------------------------------------------------------------------

        self.logger.debug("---------------------- Observations --------------------------------------------------------------------------")
        # Pesquisando as observacoes que precisam ser baixadas
        observations = RefineOrbitDB().get_observations(self.input_list.tablename, self.input_list.schema, max_age)

        self.observations_input_file = os.path.join(instance.relative_path, 'observations.csv')

        self.logger.info("Writing Observations Input File")
        RefineOrbit().writer_refine_orbit_file_list(self.observations_input_file, observations)

        # Download das Observations
        self.getObservations(instance, self.observations_input_file, steps_file)

        # ---------------------- Orbital Parameters --------------------------------------------------------------------
        self.logger.debug("---------------------- Orbital Parameters --------------------------------------------------------------------")
        # Pesquisando os parametros orbitais que precisam ser baixadas
        orbital_parameters = RefineOrbitDB().get_orbital_parameters(self.input_list.tablename, self.input_list.schema,
                                                                    max_age)

        self.orbital_parameters_input_file = os.path.join(instance.relative_path, 'orbital_parameters.csv')

        self.logger.info("Writing Orbital Parameters Input File")
        self.writer_refine_orbit_file_list(self.orbital_parameters_input_file, orbital_parameters)

        # Download dos parametros Orbitais
        self.getOrbitalParameters(instance, self.orbital_parameters_input_file, steps_file)

        # ---------------------- BSPs ----------------------------------------------------------------------------------
        self.logger.debug("---------------------- BSPs ----------------------------------------------------------------------------------")
        # Pesquisando os bsp_jpl que precisam ser baixadas
        bsp_jpl = RefineOrbitDB().get_bsp_jpl(self.input_list.tablename, self.input_list.schema, max_age)

        self.bsp_jpl_input_file = os.path.join(instance.relative_path, 'bsp_jpl.csv')

        self.logger.info("Writing BSP JPL Input File")
        RefineOrbit().writer_refine_orbit_file_list(self.bsp_jpl_input_file, bsp_jpl)

        # Download dos BSP JPL
        self.getBspJplFiles(instance, self.bsp_jpl_input_file, steps_file)

        t1 = datetime.now()
        tdelta = t1 - t0
        self.logger.info("Download Finish in %s" % humanize.naturaldelta(tdelta))

        # ---------------------- Objects -------------------------------------------------------------------------------

        # Recuperando os Objetos
        objects, obj_count = ProccessManager().get_objects(tablename=self.input_list.tablename,
                                                           schema=self.input_list.schema)

        self.logger.debug("Objects: %s" % obj_count)

        # # ---------------------- Inputs --------------------------------------------------------------------------------
        self.logger.info("Collect Inputs by Objects")

        self.logger.debug("Objects Dir: %s" % self.objects_dir)

        # Separa os inputs necessarios no diretorio individual de cada objeto.
        # TODO: Essa etapa pode ser paralelizada com Parsl
        self.collect_inputs_by_objects(objects, self.objects_dir)

    def getObservations(self, instance, input_file, step_file):
        """
            Executa a etapa de download dos arquivos Observations vindo do AstDys ou MPC,
            essa etapa verifica quantos arquivos precisam ser baixados, faz o download
            e os arquivos ficam disponiveis no diretorio externo ao processo.

        :param instance:
        """
        try:
            GetObservations().run(
                input_file=input_file,
                output_path=instance.relative_path,
                step_file=step_file)
        except Exception as e:
            self.logger.error(e)
            raise(e)            

    def getOrbitalParameters(self, instance, input_file, step_file):
        """
            Executa a etapa de download dos arquivos Orbital Parametros vindo do AstDys ou MPC,
            essa etapa verifica quantos arquivos precisam ser baixados, faz o download
            e os arquivos ficam disponiveis no diretorio externo ao processo.

        :param instance:
        """
        try:
            GetOrbitalParameters().run(input_file=input_file, output_path=instance.relative_path, step_file=step_file)
        except Exception as e:
            self.logger.error(e)
            raise(e)            

    def getBspJplFiles(self, instance, input_file, step_file):
        """
            Executa a etapa de download dos arquivos bsp vindo do JPL,
            essa etapa verifica quantos arquivos precisam ser baixados, faz o download
            e os arquivos ficam disponiveis no diretorio externo ao processo.

        :param instance:
        """
        try:
            BSPJPL().run(input_file=input_file, output_path=instance.relative_path, step_file=step_file)
        except Exception as e:
            self.logger.error(e)
            raise(e)
         

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

    def collect_inputs_by_objects(self, objects, objects_path):

        for obj in objects:
            obj_name = obj.get("name").replace(" ", "_")

            obj_dir = os.path.join(objects_path, obj_name)

            self.logger.debug("Object Dir: %s" % obj_dir)
            # TODO: Essa etapa pode ser paralelizada com Parsl
            # Copiar os Arquivos de Observacoes
            observations_file = self.copy_observation_file(obj, obj_dir)

            # Copiar os Arquivos de Orbital Parameters
            orbital_parameters_file = self.copy_orbital_parameters_file(obj, obj_dir)

            # Copiar os Arquivos de BSP_JPL
            bsp_jpl_file = self.copy_bsp_jpl_file(obj, obj_dir)

            # Verificar se o Arquivo do PRAIA (Astrometry position) existe no diretorio do objeto.
            astrometry_position_file = self.verify_astrometry_position_file(obj, obj_dir)

            self.logger.debug("TESTE: %s" % astrometry_position_file)


    def copy_observation_file(self, obj, obj_dir):
        # Copiar arquivo de Observacoes do Objeto.
        original_observation_file = GetObservations().get_file_path(obj.get("name"), obj.get("number"))

        if original_observation_file is not None:
            filename = os.path.basename(original_observation_file)
            new_file_path = os.path.join(obj_dir, filename)

            shutil.copy2(original_observation_file, new_file_path)

            if os.path.exists(new_file_path):
                self.logger.debug("Object [ %s ] Observation File: %s" % (obj.get("name"), new_file_path))

                return new_file_path
            else:
                self.logger.error(
                    "Failed to copy Observations File: %s -> %s" % (original_observation_file, obj_dir))
                return None
        else:
            self.logger.warning("Object [ %s ] has no Observations File" % obj.get("name"))
            return None

    def copy_orbital_parameters_file(self, obj, obj_dir):

        original_file = GetOrbitalParameters().get_file_path(obj.get("name"), obj.get("number"))

        if original_file is not None:
            filename = os.path.basename(original_file)
            new_file_path = os.path.join(obj_dir, filename)

            shutil.copy2(original_file, new_file_path)

            if os.path.exists(new_file_path):
                self.logger.debug("Object [ %s ] Orbital Parameters File: %s" % (obj.get("name"), new_file_path))

                return new_file_path
            else:
                self.logger.error(
                    "Failed to copy Orbital Parameters File: %s -> %s" % (original_file, obj_dir))
                return None
        else:
            self.logger.warning("Object [ %s ] has no Orbital Parameters File" % obj.get("name"))
            return None

    def copy_bsp_jpl_file(self, obj, obj_dir):

        original_file = BSPJPL().get_file_path(obj.get("name"), obj.get("number"))

        if original_file is not None:
            filename = os.path.basename(original_file)
            new_file_path = os.path.join(obj_dir, filename)

            shutil.copy2(original_file, new_file_path)

            if os.path.exists(new_file_path):
                self.logger.debug("Object [ %s ] BSP_JPL File: %s" % (obj.get("name"), new_file_path))

                return new_file_path
            else:
                self.logger.error(
                    "Failed to copy BSP_JPL File: %s -> %s" % (original_file, obj_dir))
                return None
        else:
            self.logger.warning("Object [ %s ] has no BSP_JPL File" % obj.get("name"))
            return None

    def verify_astrometry_position_file(self, obj, obj_dir):
        """
            Verifica se o Arquivo de Astrometric observed ICRF positions
        gerado pela etapa de Astrometria esta disponivel no Diretorio do Objeto
        :param obj:
        :param obj_dir:
        :return: File path do arquivo ou None caso nao exista.
        """

        # TODO: este metodo deveria estar dentro da classe de Astrometria

        filename = Astrometry().get_astrometry_position_filename(obj.get("name"))

        self.logger.debug("TESTE FILENAME: %s" % filename)

        file_path = os.path.join(obj_dir, filename)

        self.logger.debug("TESTE FILE_PATH: %s" % file_path)

        if not os.path.exists(file_path):
            file_path = None

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
