import logging
import os
import pathlib
import shutil
import traceback
from datetime import datetime, timedelta

import humanize
import pandas as pd
from django.conf import settings

from des.dao import ExposureDao
from des.models import SkybotJob
from des.skybot.load_data import DESImportSkybotPositions
from des.skybot.skybot_server import SkybotServer


class DesSkybotPipeline():

    def __init__(self):
        self.logger = logging.getLogger("skybot")
        self.logger_import = logging.getLogger("skybot_load_data")

        # Diretorio onde ficam os csv baixados do skybot
        self.base_path = settings.SKYBOT_OUTPUT

        # Radius usado na query do skybot com tamanho suficiente para a exposição do des.
        # Cone search radius in Degres
        self.radius = 1.2

        # Observer Code for Cerro Tololo-DECam
        self.observer_location = 'w84'

        # Filter to retrieve only objects with a position error lesser than the given value
        self.position_error = 0

    def get_base_path(self):
        return self.base_path

    def get_job_path(self, job_id):
        output_path = os.path.join(
            self.get_base_path(), "des_skybot_%s" % str(job_id))
        return output_path

    def create_job_dir(self, job_id):
        path = self.get_job_path(job_id)
        if not os.path.exists(path):
            os.mkdir(path)
            self.logger.info("A directory has been created for the job.")

        return path

    def delete_job_dir(self, job_id):
        path = self.get_job_path(job_id)
        if os.path.exists(path) and os.path.isdir(path):
            shutil.rmtree(path)
            self.logger.debug("Job directory has been deleted.")

    def query_exposures_by_period(self, start, end):
        db = ExposureDao()
        rows = db.exposures_by_period(start, end)

        self.logger.info(
            "[%s] Exposures for the period were found." % len(rows))
        return rows

    def get_expouses_filepath(self, job_id):
        filepath = os.path.join(self.get_job_path(job_id), 'exposures.csv')
        return filepath

    def get_exposures(self, job_id, start, end):

        # Verifica se já existe um arquivo com as exposições criado.
        filepath = self.get_expouses_filepath(job_id)

        if not os.path.exists(filepath):
            # Se não existir faz a query, cria um pandas dataframe e salva em arquivo.

            # Executa a query para saber todas as exposições para este periodo.
            rows = self.query_exposures_by_period(start, end)

            # Cria um pandas dataframe com as exposições.
            df = self.create_exposure_dataframe(rows, filepath)

        else:
            # Se existir le o arquivo e retorna o pandas dataframe.
            df = self.read_exposure_dataframe(filepath)

        return df

    def create_exposure_dataframe(self, rows, filepath):

        df = pd.DataFrame(rows, columns=['id', 'date_obs', 'radeg', 'decdeg'])

        # Escreve o dataframe em arquivo.
        df.to_csv(filepath, sep=';', header=True)

        self.logger.info("An archive was created with the Exposures.")
        self.logger.debug("Exposures File: [%s]" % filepath)

        return df

    def read_exposure_dataframe(self, filepath):
        df = pd.read_csv(filepath, delimiter=';')

        return df

    def create_request_dataframe(self, rows, filepath):

        df = pd.DataFrame(rows, columns=[
            'exposure', 'success', 'ticket', 'positions', 'start',
            'finish', 'execution_time', 'output', 'filename', 'file_size',
            'skybot_url', 'error'])

        # Escreve o dataframe em arquivo.
        df.to_csv(filepath, sep=';', header=True)

        self.logger.info("An archive was created with the Skybot Requests.")
        self.logger.debug("Requests File: [%s]" % filepath)

        return df

    def run_job(self, job_id):
        try:
            t0 = datetime.now()

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
            job.path = job_path
            self.logger.debug("Job Path: [%s]" % job_path)

            # Criar um dataframe com as exposições a serem executadas.
            # este dataframe vai guardar também as estatisticas de cada execução.
            df_exposures = self.get_exposures(
                job_id, job.date_initial, job.date_final)

            # Guarda o total de exposures
            t_exposures = df_exposures.shape[0]

            job.exposures = t_exposures
            job.save()

            # Aqui inicia as requisições para o serviço do Skybot.

            # Instancia da classe SkybotServer para fazer as requisições.
            # A url para o serviço do skybot fica na settings.SKYBOT_SERVER
            self.logger.debug("Skybot Server: [%s]" % settings.SKYBOT_SERVER)
            ss = SkybotServer(url=settings.SKYBOT_SERVER)

            # Para cada exposição faz a requisição no serviço do Skybot.
            requests = list([])
            for exp in df_exposures.to_dict('records', )[0:3]:

                # caminho para o arquivo com os resultados retornados pelo skyubot.
                filename = "%s.temp" % exp['id']
                output = os.path.join(job_path, filename)

                # Executa o consulta usando a função cone_search.
                result = ss.cone_search(
                    date=exp['date_obs'],
                    ra=exp['radeg'],
                    dec=exp['decdeg'],
                    radius=self.radius,
                    observer_location=self.observer_location,
                    position_error=self.position_error,
                    output=output
                )

                # Adiciona o id da exposição ao resultado.
                result.update({'exposure': exp['id']})

                if result['success']:
                    # o Nome do arquivo agora é composto por exposure_id + ticket.
                    # e a extensão passa a ser .csv, mudando o nome do arquivo depois que ele
                    # já foi escrito eu garanto que ele está pronto para ser importado.
                    filename = "%s_%s.csv" % (exp['id'], result['ticket'])
                    filepath = os.path.join(job_path, filename)

                    # renomea o arquivo
                    os.rename(output, filepath)

                    # guarda o novo filepath e filename
                    result.update({
                        'output': filepath,
                        'filename': filename
                    })

                    self.logger.info("Exposure [%s] returned [%s] positions in %s." % (
                        result['exposure'], result['positions'], humanize.naturaldelta(
                            timedelta(seconds=result['execution_time']), minimum_unit="milliseconds")
                    ))
                else:
                    self.logger.warning("Exposure [%s]: %s" % (
                        result['exposure'], result['error']))

                # guarda o resultado do dataframe de requisições.
                requests.append(result)

                # self.logger.debug(result)

            # Criar um dataframe para guardar as estatisticas de cada requisição.
            requests_csv = os.path.join(job_path, "requests.csv")
            df_requests = self.create_request_dataframe(requests, requests_csv)

            # Totais de sucesso e falha.
            t_requests = df_requests.shape[0]
            t_success = df_requests.success.sum()
            t_failure = t_requests - t_success

            # tempo de execução
            t1 = datetime.now()
            tdelta = t1 - t0

            self.logger.info("Exposures: [%s] Requests: [%s] Success: [%s] Failure: [%s] in %s" % (
                t_exposures, t_requests, t_success, t_failure, humanize.naturaldelta(tdelta, minimum_unit="seconds")))

        except Exception as e:
            trace = traceback.format_exc()
            self.logger.error(trace)
            self.logger.error(e)

            #  TODO: tratar os erros e alterar o status do job
            raise(e)

        self.logger.debug("Fim do Teste")

        # self.reset_job_for_test(job_id)

    def reset_job_for_test(self, job_id):
        job = SkybotJob.objects.get(pk=job_id)

        # Exclui o diretório do job.
        self.delete_job_dir(job_id)

        job.status = 1
        job.save()

    def check_execution_queue(self):
        """Verifica a fila de jobs, se tiver algum job com status idle. 
        inicia a execução do job.

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

    def check_load_data_queue(self):

        # Verificar se já existe algum job com status Running.
        running = SkybotJob.objects.filter(status=2).order_by('-start').first()

        # Se tiver algum job executando, verifica se tem arquivos
        # a serem importados no banco de dados.
        if running:
            self.logger_import.info("Tem um job executando.")

            # de uma vez ao mesmo tempo.
            if self.check_lock_load_data(running.path):
                self.logger_import.info("Não está importando dados.")
                # Se não exisitir arquivo de lock
                # significa que não tem nenhum importação acontecendo
                try:
                    self.run_import_positions(running.id)
                except Exception as e:
                    self.logger_import.error(e)
                    raise(e)
            else:
                # Já existe um arquivo de lock não faz nada.
                # por que não pode haver 2 importações simultaneas.
                self.logger_import.info("Já Está importando dados.")

        else:
            # Se não tiver nenhum job executando.
            # TODO este print vai sair
            self.logger_import.info("Não tem nenhum job executando")

    def check_lock_load_data(self, job_path):

        # Verificar se existe um arquivo de lock para a taks de load data.
        filepath = os.path.join(job_path, 'load_data.lock')
        if os.path.exists(filepath):
            return False
        else:
            # Cria um arquivo de Lock caso não exista
            open(filepath, 'x').close()
            self.logger_import.debug("Lock file created.")
            return True

    def run_import_positions(self, job_id):

        t0 = datetime.now()

        # Lista de arquivos csv que podem estar no mesmo diretório mais que não são outputs do skybot.
        ignore_list = ['exposures.csv', 'requests.csv']

        # Recupera o Model pelo ID
        try:
            job = SkybotJob.objects.get(pk=job_id)
        except Exception as e:
            self.logger_import.error(e)
            raise(e)

        try:
            # Instancia da Classe de Importação.
            loaddata = DESImportSkybotPositions()

            # Varre o diretório, lista todos os arquivos de posições 
            # gerados pelo skybot. 
            # para cada arquivo executa o metodo de importação. 
            for pos_file in pathlib.Path(job.path).glob('*.csv'):
                # self.logger_import.debug(pos_file)
                if pos_file.name not in ignore_list:

                    # Nome do arquivo é composto por ExposureId_Ticket.csv
                    # Recuperar o Exposure id 
                    exposure_id = pos_file.name.split("_")[0].strip()
                    # Recuperar o Ticket
                    ticket = pos_file.name.split("_")[1].split(".")[0].strip()

                    # self.logger_import.debug("Exposure: [%s] Ticket: [%s] Filepath: [%s]" % (exposure_id, ticket, pos_file))
                    loaddata.import_des_skybot_positions(exposure_id, ticket, pos_file)

                    # TODO: guardar os resultados
                    # TODO: Mover os arquivos para outro diretório.

        except Exception as e:
            trace = traceback.format_exc()
            self.logger_import.error(trace)
            self.logger_import.error(e)

            #  TODO: tratar os erros e alterar o status do job
            raise(e)

        finally:
            # Apagar o arquivo de lock
            filepath = os.path.join(job.path, 'load_data.lock')
            os.remove(filepath)
            self.logger_import.debug("Lock file removed.")
