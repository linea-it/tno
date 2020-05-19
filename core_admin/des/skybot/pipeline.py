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

    def create_skybot_log(self, job_path):
        # Adiciona um Log Handle para fazer uma copia do log no diretório do processo.
        fh = logging.FileHandler(os.path.join(job_path, 'skybot_requests.log'))
        formatter = logging.Formatter(
            '%(asctime)s [%(levelname)s] %(message)s')
        fh.setFormatter(formatter)
        # TODO: Duvida se não setar o Level será que herda o level do logger primario do Django?
        # fh.setLevel(logging.DEBUG)
        self.logger.addHandler(fh)

    def create_loaddata_log(self, job_path):
        # Adiciona um Log Handle para fazer uma copia do log no diretório do processo.
        fh = logging.FileHandler(os.path.join(job_path, 'skybot_loaddata.log'))
        formatter = logging.Formatter(
            '%(asctime)s [%(levelname)s] %(message)s')
        fh.setFormatter(formatter)
        # fh.setLevel(logging.DEBUG)
        self.logger_import.addHandler(fh)

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

    def get_positions_path(self, job_id):
        return os.path.join(self.get_job_path(job_id), 'outputs')

    def create_positions_path(self, job_id):
        path = self.get_positions_path(job_id)
        if not os.path.exists(path):
            os.mkdir(path)
            self.logger.info("A directory has been created for the Outputs.")

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

            # Altera o Status do Job para Running
            job.status = 2
            job.save()

            # Cria o diretório onde o job será executado e onde ficaram os outputs.
            job_path = self.create_job_dir(job_id)
            job.path = job_path
            self.logger.debug("Job Path: [%s]" % job_path)

            positions_path = self.create_positions_path(job_id)
            self.logger.debug("Positions Path: [%s]" % positions_path)

            # Adiciona um Log handler a mais, duplicando o log no diretório do processo.
            # ATENÇÂO: Os handles de logs devem ser criados no inicio do job em uma fase que não se repita.
            self.create_skybot_log(job_path)
            self.create_loaddata_log(job.path)

            self.logger.info("".ljust(50, '-'))
            self.logger.info("Stating DES Skybot Job ID: [%s]" % job.id)
            self.logger.info("Period Start: [%s] End: [%s]" % (
                job.date_initial, job.date_final))

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
            for exp in df_exposures.to_dict('records', )[0:100]:
                # for exp in df_exposures.to_dict('records', ):

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

            self.on_error(job_id, e)

        # self.reset_job_for_test(job_id)

    def reset_job_for_test(self, job_id):
        job = SkybotJob.objects.get(pk=job_id)

        # Exclui o diretório do job.
        self.delete_job_dir(job_id)

        job.status = 1
        job.error = None
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

        # else:
        #     # Se já existir um job executando não faz nada
        #     # TODO este print vai sair
        #     self.logger.info("Já existe um job executando")

    def check_load_data_queue(self):

        # Verificar se já existe algum job com status Running.
        running = SkybotJob.objects.filter(status=2).order_by('-start').first()

        # Se tiver algum job executando, verifica se tem arquivos
        # a serem importados no banco de dados.
        if running:
            self.logger_import.info("Tem um job executando.")

            if self.check_lock_load_data(running.path):
                self.logger_import.info("Não está importando dados.")
                # Se não exisitir arquivo de lock
                # significa que não tem nenhum importação acontecendo
                self.run_import_positions(running.id)

            else:
                # Já existe um arquivo de lock não faz nada.
                # por que não pode haver 2 importações simultaneas.
                self.logger_import.info("Já Está importando dados.")

        else:
            # Se não tiver nenhum job executando.
            self.logger_import.info("Não tem nenhum job executando")

    def check_lock_load_data(self, job_path):
        """Verificar se existe um arquivo de lock para a taks de load data.
        Se exisir retorna False, se não existir cria o arquivo de lock e retorna True.

        True nesta função significa que o job pode ser executado.

        Arguments:
            job_path {string} -- Diretório onde o job esta sendo executado.

        Returns:
            Bool -- True se o lock não existir e False se existir.
        """
        #
        filepath = os.path.join(job_path, 'load_data.lock')
        if os.path.exists(filepath):
            return False
        else:
            # Cria um arquivo de Lock caso não exista
            open(filepath, 'x').close()
            self.logger_import.debug("Lock file created.")
            return True

    def get_files_to_import(self, job_path):
        # Lista de arquivos csv que podem estar no mesmo diretório mais que não são outputs do skybot.
        ignore_list = ['exposures.csv', 'requests.csv', 'loaddata.csv']

        a_files = []
        for f in pathlib.Path(job_path).glob('*.csv'):
            if f.name not in ignore_list:
                a_files.append(f)

        return a_files

    def run_import_positions(self, job_id):

        t0 = datetime.now()

        # Recupera o Model pelo ID
        try:
            job = SkybotJob.objects.get(pk=job_id)
        except Exception as e:
            self.logger_import.error(e)
            raise(e)

        # Diretório onde vão ficar os arquivos de posição que foram importados corretamente.
        positions_path = self.get_positions_path(job_id)

        try:
            self.logger_import.info(
                "----------------------------------------------")
            # Instancia da Classe de Importação.
            loaddata = DESImportSkybotPositions()

            # Varre o diretório, lista todos os arquivos de posições
            # gerados pelo skybot.
            # para cada arquivo executa o metodo de importação.
            results = list([])

            # Esta funcao get_files poderia ser um unico loop,
            # escolhi fazer separado, para ter acesso ao total de arquivos no inicio da iteração.
            # este array a_files já ignora os outros arquivos csv no diretório.
            a_files = self.get_files_to_import(job.path)
            # a_files = a_files[0:20]  # TODO: Testando de um em um
            to_import = len(a_files)
            self.logger_import.debug(
                "Number of files to be imported [%s]." % to_import)

            # Para cada arquivo a ser importado executa o metodo de importação
            # guarda o resultado no dataframe e move o arquivo para o diretório de outputs.
            for idx, pos_file in enumerate(a_files, start=1):
                self.logger_import.debug("Importing file [%s] of [%s]  Filename: [%s]" % (
                    idx, to_import, pos_file.name))

                # Nome do arquivo é composto por ExposureId_Ticket.csv
                # Recupera o Exposure id
                exposure_id = pos_file.name.split("_")[0].strip()
                # Recupera o Ticket
                ticket = pos_file.name.split("_")[1].split(".")[0].strip()

                # Executa o Metódo de importação.
                result = loaddata.import_des_skybot_positions(
                    exposure_id, ticket, pos_file)

                # Mover os arquivos para diretório de outputs.
                if result['success']:
                    # Em caso de sucesso o nome do arquivo permanece o mesmo.
                    new_filepath = os.path.join(
                        positions_path, pos_file.name)
                else:
                    # Em caso de falha o arquivo recebe a extensão .err
                    new_filepath = os.path.join(
                        positions_path, pos_file.name.replace('.csv', '.err'))

                # Move para o diretório de outputs
                shutil.move(pos_file, new_filepath)

                self.logger_import.debug(
                    "File moved to: [%s]" % new_filepath)

                result.update({'output': str(new_filepath)})
                results.append(result)

                self.logger_import.debug("Exposure: [%s] Success: [%s] Filepath: [%s]" % (
                    exposure_id, result['success'], result['output']))

            filepath = os.path.join(job.path, 'loaddata.csv')
            df_loaddata = self.create_loaddata_dataframe(results, filepath)

            # Totais de sucesso e falha.
            t_files = len(results)
            t_success = df_loaddata.success.sum()
            t_failure = t_files - t_success

            # tempo de execução
            t1 = datetime.now()
            tdelta = t1 - t0

            self.logger_import.info("Total files to be imported: [%s] Success: [%s] Failure: [%s] in %s" % (
                t_files, t_success, t_failure, humanize.naturaldelta(tdelta, minimum_unit="seconds")))

        except IndexError:
            self.logger_import.info("No files to import.")

        except Exception as e:
            trace = traceback.format_exc()
            self.logger_import.error(trace)
            self.logger_import.error(e)

            self.on_error(job_id, e)

        finally:
            # Apagar o arquivo de lock
            filepath = os.path.join(job.path, 'load_data.lock')
            os.remove(filepath)
            self.logger_import.debug("Lock file removed.")

    def create_loaddata_dataframe(self, rows, filepath):

        df = pd.DataFrame(rows, columns=[
            'exposure', 'success', 'ticket', 'positions', 'ccds', 'inside_ccd', 'outside_ccd',
            'output', 'start', 'finish', 'execution_time', 'import_pos_exec_time', 'ccd_assoc_exec_time',
            'error', 'tracebak'])

        if not os.path.exists(filepath):
            # Escreve o dataframe em arquivo.
            df.to_csv(filepath, sep=';', header=True)

            self.logger_import.info(
                "An archive was created with the Load Data Statistics.")
            self.logger_import.debug("Load Data File: [%s]" % filepath)

            return df
        else:
            # TODO: aqui pode haver um erro, caso o seja executado mais de uma vez pode duplicar linhas.
            # o ideal seria juntar os dataframes usando como index o exposure.
            # Se o Dataframe já existir apenas inclui as linhas.
            df.to_csv(filepath, sep=';', header=False, mode='a')

            self.logger_import.debug(
                "Import data has been updated in the Load Data file.")

            return df


    def on_error(self, job_id, e):
        # TODO mudar o status do job e o tempo de execução
        pass
