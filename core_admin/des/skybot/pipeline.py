import logging
import os
import shutil

import pandas as pd
from django.conf import settings

from des.dao import ExposureDao
from des.models import SkybotJob


class DesSkybotPipeline():

    def __init__(self):
        self.logger = logging.getLogger("skybot")

        # Diretorio onde ficam os csv baixados do skybot
        self.base_path = settings.SKYBOT_OUTPUT

    def get_base_path(self):
        return self.base_path

    def get_job_path(self, job_id):
        output_path = os.path.join(
            self.get_base_path(), "des_skybot_%s" % str(job_id))
        return output_path

    def create_job_dir(self, job_id):
        """
        """
        path = self.get_job_path(job_id)
        if not os.path.exists(path):
            os.mkdir(path)
            self.logger.info("A directory has been created for the job.")

        return path

    def delete_job_dir(self, job_id):
        """
        """
        path = self.get_job_path(job_id)
        if os.path.exists(path) and os.path.isdir(path):
            shutil.rmtree(path)
            self.logger.debug("Job directory has been deleted.")

    def query_exposures_by_period(self, start, end):
        """

        """
        db = ExposureDao()
        rows = db.exposures_by_period(start, end)

        self.logger.info(
            "[%s] Exposures for the period were found." % len(rows))
        return rows

    def get_expouses_filepath(self, job_id):
        """
        """
        filepath = os.path.join(self.get_job_path(job_id), 'exposures.csv')
        return filepath

    def get_exposures(self, job_id, start, end):
        """

        """

        # Verifica se já existe um arquivo com as exposições criado.
        filepath = self.get_expouses_filepath(job_id)

        if not os.path.exists(filepath):
            # Se não existir faz a query, cria um pandas dataframe e salva em arquivo.

            rows = self.query_exposures_by_period(start, end)

            df = self.create_exposure_dataframe(rows, filepath)

        else:
            # Se existir le o arquivo e retorna o pandas dataframe.
            df = self.read_exposure_dataframe(filepath)

        return df

    def create_exposure_dataframe(self, rows, filepath):
        """

        """
        df = pd.DataFrame(rows, columns=['id', 'date_obs', 'radeg', 'decdeg'])
        df = df.set_index('id')
        # TODO: Adicionar ao dataframe as colunas para guardar as estatisticas.

        # Escreve o dataframe em arquivo.
        df.to_csv(filepath, sep=';', header=True)

        self.logger.info("An archive was created with the Exposures.")
        self.logger.debug("Exposures File: [%s]" % filepath)

        return df

    def read_exposure_dataframe(self, filepath):
        """
        """
        df = pd.read_csv(filepath, delimiter=';')

        return df

    def run_job(self, job_id):
        """

        """
        # Recupera o Model pelo ID
        job = SkybotJob.objects.get(pk=job_id)

        self.logger.info("".ljust(50, '-'))
        self.logger.info("Stating DES Skybot Job ID: [%s]" % job.id)
        self.logger.info("Period Start: [%s] End: [%s]" % (
            job.date_initial, job.date_final))

        # Altera o Status do Job para Running
        job.status = 2
        job.save()

        # Cria o diretório onde o job será executado e onde ficaram os outputs.
        job_path = self.create_job_dir(job_id)
        self.logger.debug("Job Path: [%s]" % job_path)

        # Executa a query para saber todas as exposições para este periodo.
        exposures = self.query_exposures_by_period(
            job.date_initial, job.date_final)

        self.logger.debug(exposures[0:1])

        # Criar um dataframe com as exposições a serem executadas.
        # este dataframe vai guardar também as estatisticas de cada execução.
        self.get_exposures(job_id, job.date_initial, job.date_final)

        self.reset_job_for_test(job_id)

    def reset_job_for_test(self, job_id):
        job = SkybotJob.objects.get(pk=job_id)

        # Exclui o diretório do job.
        self.delete_job_dir(job_id)

        job.status = 1
        job.save()

    def check_execution_queue(self):
        """
            Verifica a fila de jobs, 
            se tiver algum job com status idle. inicia o job. 

        """

        # Verificar se já existe algum job com status Running.
        running = SkybotJob.objects.filter(status=2)

        if len(running) == 0:
            # Se nao tiver nenhum job executando verifica se tem jobs com status Idle
            # esperando para serem executados.
            idle = running = SkybotJob.objects.filter(status=1)
            if idle.count() > 0:
                self.logger.info(
                    "There are %s jobs waiting to run" % idle.count())

                # Recupera o job mais antigo na fila.
                to_run = idle.order_by('-start')[0]
                self.logger.info("Starting the job with id %s" % to_run.id)

                self.run_job(to_run.id)

        else:
            # Se já existir um job executando não faz nada
            # TODO este print vai sair
            self.logger.info("Já existe um job executando")
