import os
import csv
from django.conf import settings
import parsl
from parsl import *
from subprocess import DEVNULL, STDOUT, check_call, CalledProcessError
from datetime import datetime
import humanize
import subprocess
import time
from random import randrange
from orbit.models import BspJplFile
import logging
from common.jsonfile import JsonFile
from .download_parameters import DownloadParameters


class BSPJPL(DownloadParameters):
    """
        Esta classe contem os metodos para baixar os arquivos BSP do JPL.
        O Download e feito usando um script disponibilizado pelo JPL,
        esse script tem depencia da lib expect.
        o script foi disponibilizado neste diret
    """

    def __init__(self, debug_mode=False):

        self.logger = logging.getLogger("refine_orbit")

        # Verifica se o script small_body_spk esta disponivel no diretorio bin e se tem permissao de execucao
        self.small_body_spk = os.path.join(settings.BIN_DIR, 'small_body_spk')
        if not os.path.exists(self.small_body_spk) or not os.access(self.small_body_spk, os.X_OK):
            raise Exception("Script small_body_spk does not exist or does not have execute permission")

        if settings.EMAIL_NOTIFICATIONS is None:
            raise Exception("you must have a valid email set in the EMAIL_NOTIFICATION environment variable.")

        if settings.BSP_JPL_DIR is None:
            raise Exception("it is necessary to have a valid path defined in the BSP_JPL_DIR settings variable.")

        self.bsp_jpl_dir = settings.BSP_JPL_DIR

        self.debug_mode = debug_mode

        self.input_records = []

        self.downloaded = []

        self.need_download = 0
        self.not_need_download = 0

        self.bsp_jpl_extension = ".bsp"

    def download(self, name, filename, output_path, logger):

        start = datetime.now()
        try:
            # Os arquivo baixados ficam no diretorio setado na variavel BSP_JPL.
            file_path = os.path.join(output_path, filename)

            args = [
                self.small_body_spk,
                '-b',
                '"%s"' % name,
                '2000-Jan-01',
                '2030-Jan-01',
                settings.EMAIL_NOTIFICATIONS,
                file_path]

            logger.debug("Command: [ %s ]" %(" ".join(args)))

            # TODO stdout deve ser jogado para um arquivo de log
            # executa de fato o download.
            check_call(args, stdout=DEVNULL, stderr=STDOUT)

        except CalledProcessError:
            # TODO aqui deve ser adicionar uma mensagem de erro no log.
            return None

        finish = datetime.now()
        tdelta = finish - start

        if os.path.exists(file_path):

            size = os.path.getsize(file_path)

            return dict({
                "start_time": start,
                "finish_time": finish,
                "download_time": tdelta.total_seconds(),
                "file_size": size,
                "filename": filename,
                "file_path": file_path,
                "path": output_path
            })

        else:
            return None

    def run(self, input_file, output_path, step_file):

        self.logger.info("Starting BSP_JPL Download")

        t0 = datetime.now()

        # Cria o path para o diretorio de saida e verifica se existe, se nao existir cria.
        files_path = settings.BSP_JPL_DIR

        self.logger.debug("Files Path: %s" % files_path)

        # Le o arquivo de entrada e criar uma lista com nome e numero do objeto.
        records = self.read_input(input_file)

        self.input_records = records

        self.logger.info("Reading input file.")

        self.logger.debug("Inputs: [ %s ]" % len(records))

        # Configuracao do Parsl
        try:
            dfk = DataFlowKernel(config=dict(settings.PARSL_CONFIG))
        except Exception as e:
            self.logger.error(e)
            raise e

        self.logger.info("Configuring Parsl")
        self.logger.debug("Parsl Config:" )
        self.logger.debug(settings.PARSL_CONFIG)

        # Configuracao do Parsl Log.
        parsl.set_file_logger(os.path.join(output_path, 'bsp_jpl_parsl.log'))

        # Declaracao do Parsl APP
        @App("python", dfk)
        def start_parsl_job(name, filename, files_path, logger):

            result = dict({
                "name": name,
            })

            msg = "Download [ FAILURE ] - Object: %s " % name

            # Executa o metodo de download
            download_stats = self.download(name, filename, files_path, logger)

            if download_stats is not None:
                result.update({
                    "name": name,
                    "filename": download_stats.get("filename"),
                    "download_start_time": download_stats.get("start_time"),
                    "download_finish_time": download_stats.get("finish_time"),
                    "download_time": download_stats.get('download_time'),
                    "file_size": download_stats.get("file_size"),
                })

                msg = "Download [ SUCCESS ] - Object: %s File: %s Size: %s Time: %s seconds" % (
                    result.get('name'), result.get('filename'), humanize.naturalsize(result.get('file_size')),
                    result.get('download_time'))

            logger.info(msg)

            return result

        # executa o app Parsl para cara registro em paralelo
        results = []
        for row in records:
            # Utiliza o parsl apenas para os objetos que estao marcados
            # para serem baixados.
            if row.get("need_download"):
                filename = row.get("name").replace(" ", "_") + self.bsp_jpl_extension

                result = start_parsl_job(
                    name=row.get("name"),
                    filename=filename,
                    files_path=files_path,
                    logger=self.logger)

                self.logger.debug(result)

                results.append(result)

        # Espera o Resultado de todos os jobs.
        outputs = [i.result() for i in results]

        for i in results:
            i.done()

        dfk.cleanup()

        self.downloaded = outputs

        self.register_downloaded_files(outputs)

        # TODO guardar no arquivo de status as contagens dos arquivos baixados e nao baixados.
        self.logger.debug("Need Download:     [ %s ]" % self.need_download)
        self.logger.debug("NOT Need Download: [ %s ]" % self.not_need_download)

        steps = JsonFile().read(step_file)
        steps.update({"bsp_jpl": True})

        JsonFile().write(steps, step_file)

        t1 = datetime.now()
        tdelta = t1 - t0

        self.logger.info("Download BSP_JPL Completed in %s" % humanize.naturaldelta(tdelta))

    def update_or_create_record(self, record):
        return BspJplFile.objects.update_or_create(
            name=record.get("name"),
            defaults={
                'filename': record.get("filename"),
                'download_start_time': record.get("download_start_time"),
                'download_finish_time': record.get("download_finish_time"),
                'file_size': record.get("file_size"),
            }
        )

    def get_file_path(self, name, number):

        name = name.replace(" ", "_")

        filename = name + self.bsp_jpl_extension

        file_path = os.path.join(self.bsp_jpl_dir, filename)

        if not os.path.exists(file_path):
            file_path = None

        return file_path
