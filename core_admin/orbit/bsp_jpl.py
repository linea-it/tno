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

class BSPJPL():
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

        self.debug_mode = debug_mode

        self.input_records = []

        self.downloaded = []

    def download(self, name, outṕut_path):

        start = datetime.now()
        try:
            filename = name.replace(" ", "_") + ".bsp"

            # Os arquivo baixados ficam no diretorio setado na variavel BSP_JPL.
            file_path = os.path.join(outṕut_path, filename)

            args = [
                self.small_body_spk,
                '-b',
                '"%s"' % name,
                '2000-Jan-01',
                '2030-Jan-01',
                settings.EMAIL_NOTIFICATIONS,
                file_path]

            # Se o mode de debug estiver ligado pula a etapa de download e acrescenta um sleep
            if self.debug_mode:
                # DEBUG MODE NAO FAZ DOWNLOAD
                time.sleep(randrange(5))

            else:
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
                "path": outṕut_path
            })

        else:
            return None

    def run(self, input_file, output_path):

        t0 = datetime.now()

        # Cria o path para o diretorio de saida e verifica se existe, se nao existir cria.
        files_path = settings.BSP_JPL_DIR

        # Le o arquivo de entrada e criar uma lista com nome e numero do objeto.
        records = self.read_input(input_file)

        self.input_records = records

        # Configuracao do Parsl.
        dfk = DataFlowKernel(config=settings.PARSL_CONFIG)

        # Configuracao do Parsl Log.
        parsl.set_file_logger(os.path.join(output_path, 'parsl.log'))

        download_log = os.path.join(output_path, 'download_bsp_jpl.log')
        with open(download_log, 'w') as f:
            f.write('Starting the Download\n')
        f.close()

        # Declaracao do Parsl APP
        @App("python", dfk)
        def start_parsl_job(name, files_path):

            result = dict({
                "name": name,
            })

            msg = "Download [ FAILURE ] - Object: %s " % name

            # Executa o metodo de download
            download_stats = self.download(name, files_path)

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

            # Live Logging Downloaded files.
            with open(download_log, 'a') as f:
                time = "%s : " % str(datetime.now())
                f.write(time + msg + '\n')
            f.close()

            return result

        # executa o app Parsl para cara registro em paralelo
        results = []
        for row in records:
            # Utiliza o parsl apenas para os objetos que estao marcados
            # para serem baixados.
            if row.get("need_download"):
                results.append(start_parsl_job(row.get("name"), files_path))



        # Espera o Resultado de todos os jobs.
        outputs = [i.result() for i in results]

        for i in results:
            i.done()

        dfk.cleanup()

        self.downloaded = outputs


        t1 = datetime.now()
        tdelta = t1 - t0

        with open(download_log, 'a') as f:
            f.write('Download Completed in %s\n' % humanize.naturaldelta(tdelta))
        f.close()

        self.register_downloaded_files(outputs)



    def register_downloaded_files(self, records):
        # Apos o Download e necessario o registro
        self.logger.info("Register downloaded BSP JPL")

        new = 0
        updated = 0

        for record in records:

            obj, created = BspJplFile.objects.update_or_create(
                name=record.get("name"),
                defaults={
                    'filename': record.get("filename"),
                    'download_start_time': record.get("download_start_time"),
                    'download_finish_time': record.get("download_finish_time"),
                    'file_size': record.get("file_size"),
                }
            )

            if created:
                new = new + 1
                self.logger.debug("Registered [ %s ] " % record.get("name"))
            else:
                updated = updated + 1
                self.logger.debug("Updated [ %s ] " % record.get("name"))

        self.logger.info("Inputs [ %s ] Downloaded [ %s ] Registered [ %s ] Updated [ %s ]" % (len(self.input_records), len(self.downloaded), new, updated))


    def read_input(self, input_file):

        records = list()
        with open(input_file) as csvfile:
            reader = csv.DictReader(csvfile, delimiter=';')
            for row in reader:

                if row.get("need_download") in ['True', 'true', '1', 't', 'y', 'yes']:
                    row["need_download"] = True
                else:
                    row["need_download"] = False

                records.append(row)

        return records



