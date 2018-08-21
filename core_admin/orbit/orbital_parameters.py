import logging
import os
from datetime import datetime

import humanize
import parsl
from common.download import Download
from common.jsonfile import JsonFile
from django.conf import settings
from orbit.astdys import AstDys
from orbit.models import OrbitalParameterFile
from orbit.mpc import MPC
from parsl import *

from .download_parameters import DownloadParameters


class GetOrbitalParameters(DownloadParameters):
    def __init__(self):

        self.logger = logging.getLogger("refine_orbit")

        if settings.ORBITAL_PARAMETERS_DIR is None:
            raise Exception(
                "it is necessary to have a valid path defined in the ORBITAL_PARAMETERS_DIR settings variable.")

        self.orbital_parameters_dir = settings.ORBITAL_PARAMETERS_DIR

        self.input_records = []

        self.downloaded = []

        self.need_download = 0

        self.not_need_download = 0

    def run(self, input_file, output_path, step_file):
        self.logger.info("Starting Orbital Parameter Download")

        t0 = datetime.now()

        files_path = self.orbital_parameters_dir

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
        parsl.set_file_logger(os.path.join(output_path, 'orbital_parameters_parsl.log'))

        # Declaracao do Parsl APP
        @App('python', dfk)
        def start_parsl_job(name, number, files_path, logger):

            result = self.download(name, number, files_path)

            logger.debug(result)

            msg = "Download [ FAILURE ] - Object: %s " % (result.get('name'))

            if result.get('filename', None) is not None:
                msg = "Download [ SUCCESS ] - [ %s ] Object: %s File: %s [ %s ] [ %s seconds ]" % (
                    result.get('source'),
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
                results.append(start_parsl_job(row.get("name"), row.get("num"), files_path, self.logger))

        # Espera o Resultado de todos os jobs.
        outputs = [i.result() for i in results]

        for i in results:
            i.done()

        dfk.cleanup()

        self.downloaded = outputs

        # Registra na tabela Observations Files
        self.register_downloaded_files(outputs)

        # # TODO guardar no arquivo de status as contagens dos arquivos baixados e nao baixados.
        self.logger.debug("Need Download:     [ %s ]" % self.need_download)
        self.logger.debug("NOT Need Download: [ %s ]" % self.not_need_download)

        # Registra no Arquivo de steps que terminou de executar essa etapa.
        steps = JsonFile().read(step_file)
        steps.update({"orbital_parameters": True})

        JsonFile().write(steps, step_file)

        t1 = datetime.now()

        tdelta = t1 - t0
        self.logger.info('Download Orbital Parameter Completed in %s' % humanize.naturaldelta(tdelta))

    def download(self, name, number, output_path):
        """
            Function to manage the download file with orbital parameters
        principal source: AstDyS, second alternative source: MPC
        :param number:
        :param name:
        :param output_path:
        :return:
        """
        t0 = datetime.now()

        # Try to download the AstDyS files.
        result = self.download_ast_dys(name, number, output_path)

        # Checking if the object exists in AstDyS if it does not exist it tries to look in the MPC.
        if result is None:
            # Try to download from MPC
            self.download_mpc(name, number, output_path)

        if result is None:
            result = dict({
                "name": name
            })

        return result

    def download_ast_dys(self, name, number, output_path):

        t0 = datetime.now()

        source = "AstDys"
        # AstDyS Object URL
        url_object = AstDys().getObjectURL(name)

        # AstDys Orbital Parameters URL
        url = AstDys().getOrbitalParametersURL(name, number)

        filename = name.replace(" ", "_") + AstDys().orbital_parameters_extension

        # Try to download the AstDyS files.
        file_path, download_stats = Download().download_file_from_url(url, output_path=output_path, filename=filename,
                                                                      overwrite=True, ignore_errors=True, timeout=5)
        t1 = datetime.now()

        result = None

        if file_path:
            result = dict({
                "name": name,
                "source": source,
                "filename": download_stats.get('filename'),
                "download_start_time": t0,
                "download_finish_time": t1,
                "download_time": download_stats.get('download_time'),
                "file_size": download_stats.get("file_size"),
                "external_url": url_object,
                "download_url": url
            })

        return result

    def download_mpc(self, name, number, output_path):
        # Object not found in AstDys trying on MPC
        source = "MPC"

        # MPC Object URL
        url_object = MPC().getObjectURL(name)

        filename = name.replace(" ", "_") + MPC().orbital_parameters_extension

        # MPC Orbital Parameters URL
        download_stats = MPC().getOrbitalParametersURL(number, name, output_path)

        result = None

        if download_stats:
            result = dict({
                "name": name,
                "source": source,
                "filename": download_stats.get("filename"),
                "download_start_time": download_stats.get("start_time"),
                "download_finish_time": download_stats.get("finish_time"),
                "download_time": download_stats.get('download_time'),
                "file_size": download_stats.get("file_size"),
                "external_url": url_object,
                "download_url": None
            })

        return result

    def update_or_create_record(self, record):

        return OrbitalParameterFile.objects.update_or_create(
            name=record.get("name"),
            defaults={
                'source': record.get("source"),
                'filename': record.get("filename"),
                'download_start_time': record.get("download_start_time"),
                'download_finish_time': record.get("download_finish_time"),
                'file_size': record.get("file_size"),
                'external_url': record.get("external_url"),
                'download_url': record.get("download_url")

            }
        )

    def get_file_path(self, name):

        f = self.get_latest(name)

        if not f:
            return None, None

        file_path = os.path.join(self.orbital_parameters_dir, f.filename)

        if not os.path.exists(file_path):
            file_path = None, None

        return file_path, f

    def get_latest(self, name):
        try:
            f = OrbitalParameterFile.objects.filter(name=name).order_by('-download_finish_time').first()
            return f

        except:
            return None
