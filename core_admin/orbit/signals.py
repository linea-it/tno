from django.db.models.signals import post_save
from django.dispatch import receiver
from orbit.models import OrbitRun
from tno.models import Proccess
import os, errno
import logging
from random import randrange
import time
from orbit.refine_orbit import RefineOrbit, RefineOrbitDB


@receiver(post_save, sender=OrbitRun)
def on_create_orbit_run(sender, instance, signal, created, **kwargs):
    """

    """
    logger = logging.getLogger("refine_orbit")

    if created:
        logger.info("Was Created a new record of Refine Orbit Run")

        RefineOrbit().startRefineOrbitRun(instance)

        # logger.debug("ORBIT RUN: %s" % instance.id)
        #
        # # Recuperar a Instancia do processo
        # proccess = instance.proccess
        #
        # logger.debug("PROCCESS: %s" % proccess.id)
        # logger.debug("PROCCESS DIR: %s" % proccess.relative_path)
        #
        # # recuperar a Custom List usada como input
        # customlist = instance.input_list
        # logger.debug("CUSTOM LIST: %s - %s" % (customlist.id, customlist.displayname))
        #
        # # Criar um diretorio para os arquivos do NIMA
        # instance = RefineOrbit().createRefienOrbitDirectory(instance)
        #
        # # Tempo maximo de validade para os arquivos baixados em dias.
        # # TODO: pode vir como parametro da interface, None para atualizar todos.
        # max_age = 30
        #
        # refine_orbit_db = RefineOrbitDB()
        #
        # # Pesquisando as observacoes que precisam ser baixadas
        # observations = RefineOrbitDB().get_observations(customlist.tablename, customlist.schema, max_age)
        #
        # observations_csv = os.path.join(instance.relative_path, 'observations.csv')
        # RefineOrbit().writer_refine_orbit_file_list(observations_csv, observations)
        #
        #
        # # # Pesquisando os parametros orbitais que precisam ser baixadas
        # orbital_parameters = RefineOrbitDB().get_orbital_parameters(customlist.tablename, customlist.schema, max_age)
        #
        # orbital_parameters_csv = os.path.join(instance.relative_path, 'orbital_parameters.csv')
        # RefineOrbit().writer_refine_orbit_file_list(orbital_parameters_csv, orbital_parameters)
        #
        # # Pesquisando os bsp_jpl que precisam ser baixadas
        # bsp_jpl = RefineOrbitDB().get_bsp_jpl(customlist.tablename, customlist.schema, max_age)
        #
        # bsp_jpl_csv = os.path.join(instance.relative_path, 'bsp_jpl.csv')
        # RefineOrbit().writer_refine_orbit_file_list(bsp_jpl_csv, bsp_jpl)


        # instance.status = 'running'
        # instance.save()
        # logger.info("Status changed to Running")

        # time.sleep(randrange(15))
        #
        # # TODO: Importar a Classe responsavel por rodar a ASTROMETRIA
        #
        # # Encerrar a Rodada do praia
        # instance.status = 'success'
        # instance.save()
        # logger.info("Status changed to Success")
