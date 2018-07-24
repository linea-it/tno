from datetime import datetime
import csv
import os
import parsl
from parsl import *
from orbit.astdys import AstDys
from orbit.mpc import MPC
from common.download import Download
import humanize
from django.conf import settings
import time
from random import randrange
from common.jsonfile import JsonFile
from orbit.models import ObservationFile

class GetOrbitalParameters():
    def __init__(self, debug_mode=False):

        if settings.OBSERVATIONS_DIR is None:
            raise Exception("it is necessary to have a valid path defined in the OBSERVATIONS_DIR settings variable.")

        if settings.ORBITAL_PARAMETERS_DIR is None:
            raise Exception(
                "it is necessary to have a valid path defined in the ORBITAL_PARAMETERS_DIR settings variable.")

        self.observations_dir = settings.OBSERVATIONS_DIR
        self.orbital_parameters_dir = settings.ORBITAL_PARAMETERS_DIR

        self.debug_mode = debug_mode

    def getOrbitalParameters(self, name, number, output_path):
        """
            Function to manage the download the file with orbital parameters
        principal source: AstDyS, second alternative source: MPC
        :param number:
        :param name:
        :param output_path:
        :return:
        """

        files_path = self.orbital_parameters_dir

        source = "AstDys"
        # AstDyS Object URL
        url_object = AstDys().getObjectURL(name)

        # AstDys Orbital Parameters URL
        url = AstDys().getOrbitalParametersURL(name, number)

        # AstDys Orbital Parameters Filename
        # filename = AstDys().getObitalParametersFilename(name, number)
        filename = name.replace(' ', '_') + '.eq0'
        # Try to download the AstDyS files.
        file_path, download_stats = Download().download_file_from_url(url, output_path=files_path, filename=filename,
                                                                      overwrite=True, ignore_errors=True)
        result = dict({
            "name": name,
        })

        # Checking if the object exists in AstDyS if it does not exist it tries to look in the MPC.
        if file_path:
            result = dict({
                "name": name,
                "source": source,
                "filename": download_stats.get("filename"),
                "download_start_time": download_stats.get("start_time"),
                "download_finish_time": download_stats.get("finish_time"),
                "download_time": download_stats.get('download_time'),
                "file_size": download_stats.get("file_size"),
                "external_url": url_object,
                "download_url": url
            })

        else:
            # Object not found in AstDys trying on MPC
            source = "MPC"

            # MPC Object URL
            url_object = MPC().getObjectURL(name)

            # MPC Orbital Parameters URL
            download_stats = MPC().getOrbitalParametersURL(number, name, output_path)

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

    def getOrbservations(self, name, number, output_path):
        """
            Function to manage the download file with observations
        principal source: AstDyS, second alternative source: MPC
        :param number:
        :param name:
        :param output_path:
        :return:
        """

        files_path = self.observations_dir

        t0 = datetime.now()

        result = dict({
            "name": name
        })

        source = "AstDys"
        # AstDyS Object URL
        url_object = AstDys().getObjectURL(name)

        # AstDys Observation URL
        url = AstDys().getObservationsURL(name, number)

        # filename = AstDys().getObservationsFilename(name, number)
        filename = name.replace(' ', '_') + '.rwo'

        # Try to download the AstDyS files.
        file_path, download_stats = Download().download_file_from_url(url, output_path=files_path, filename=filename,
                                                                      overwrite=True, ignore_errors=True)
        t1 = datetime.now()

        # Checking if the object exists in AstDyS if it does not exist it tries to look in the MPC.
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

        else:
            pass
            # Object not found in AstDys trying on MPC
            source = "MPC"

            # MPC Object URL
            url_object = MPC().getObjectURL(name)

            # MPC Observation URL
            url = MPC().getObservationsURL(name, number)
            if url is not None:
                # Try to download the MPC files.
                file_path, download_stats = Download().download_file_from_url(url, output_path=files_path,
                                                                              filename=filename, overwrite=True,
                                                                              ignore_errors=True)
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
                        "download_url": url
                    })

        return result

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

    def writer_results(self, output_path, results):
        """
            No final do paralelismo escreve em um csv os resultados dos arquivos baixados.
        :param output_path:
        :param results:
        :return:
        """
        # Guardar os resultados no csv
        header_orb_param = ["name", "source", "filename", "download_start_time", "download_finish_time", "file_size",
                            "external_url", "download_url"]

        orbital_parameter_csv = os.path.join(output_path, 'orbital_parameters.csv')

        with open(orbital_parameter_csv, 'w') as csvfile:
            fieldnames = header_orb_param
            writer = csv.DictWriter(csvfile, fieldnames=fieldnames, delimiter=';', extrasaction='ignore')

            writer.writeheader()
            writer.writerows(results)

    # -------------------------------------------------------------------------------
    # TODO: Estes 2 metodos que executam o codigo com parsl precisam ser revistos e melhorados.
    # -------------------------------------------------------------------------------

    def runOrbitalParameters(self, input_file, output_path):
        # Le o CSV com a lista de objetos a serem baixados.

        t0 = datetime.now()

        files_path = os.path.join(output_path, 'orbital_parameters')
        if not os.path.exists(files_path):
            os.mkdir(files_path)

        records = self.read_input(input_file)

        # Exemplos para Debug
        # records = [('1988 RL13', '17420')]  # Exemplo AstDys
        # records = [('1999 CF119', '-')] # Exemplo AstDys sem Num
        # records = [('1999 RC216', '-')] # Exemplo MPC
        # records = [('2016 WM48', '-' )] # Exemplo objeto que nao tem AstDys e MPC
        # records = [('1988 RL13', '17420'), ('1999 CF119', '-'), ('1999 RC216', '-'), ('2016 WM48', '-' )] # Todos

        dfk = DataFlowKernel(config=settings.PARSL_CONFIG)

        parsl.set_file_logger(os.path.join(output_path, 'parsl.log'))

        # Create download logging file
        # TODO: Definir a questao dos logs, principalmente logs para stream
        download_log = os.path.join(output_path, 'download_orbital_parameters.log')
        with open(download_log, 'w') as f:
            f.write('Starting the Download\n')
        f.close()

        @App('python', dfk)
        def start_parsl_job(name, number):

            # GET ORBITAL PARAMETERS
            result = self.getOrbitalParameters(name, number, files_path)

            # Live Logging Downloaded files.
            with open(download_log, 'a') as f:
                msg = "Download [ FAILURE ] - Object: %s " % (result.get('name'))

                if result.get('filename', None) is not None:
                    msg = "Download [ SUCCESS ] - [ %s ] Object: %s File: %s Size: %s Time: %s seconds" % (
                        result.get('source'),
                        result.get('name'), result.get('filename'), humanize.naturalsize(result.get('file_size')),
                        result.get('download_time'))

                time = "%s : " % str(datetime.now())
                f.write(time + msg + '\n')
            f.close()

            return result

        results = []
        for name, number in records:
            results.append(start_parsl_job(name, number))

        # Wait for all apps to finish and collect the results
        outputs = [i.result() for i in results]

        for i in results:
            i.done()

        dfk.cleanup()

        self.writer_results(output_path, outputs)

        t1 = datetime.now()

        tdelta = t1 - t0
        with open(download_log, 'a') as f:
            f.write('Download Completed in %s\n' % humanize.naturaldelta(tdelta))
        f.close()

    def runObservations(self, input_file, output_path):
        pass
        # # Le o CSV com a lista de objetos a serem baixados.
        #
        # t0 = datetime.now()
        #
        # files_path = settings.OBSERVATIONS_DIR
        #
        # # Le o arquivo de entrada e criar uma lista com nome e numero do objeto.
        # records = self.read_input(input_file)
        #
        # # Exemplos para Debug
        # # records = [('1988 RL13', '17420')]  # Exemplo AstDys
        # # records = [('1999 CF119', '-')] # Exemplo AstDys sem Num
        # # records = [('1999 RC216', '-')] # Exemplo MPC
        # # records = [('2016 WM48', '-' )] # Exemplo objeto que nao tem AstDys e MPC
        # # records = [('1988 RL13', '17420'), ('1999 CF119', '-'), ('1999 RC216', '-'), ('2016 WM48', '-' )] # Todos
        #
        # # Configuracao do Parsl
        # dfk = DataFlowKernel(config=settings.PARSL_CONFIG)
        #
        # # Configuracao do Parsl Log.
        # parsl.set_file_logger(os.path.join(output_path, 'parsl.log'))
        #
        #
        # download_log = os.path.join(output_path, 'download_observations.log')
        # with open(download_log, 'w') as f:
        #     f.write('Starting the Download\n')
        # f.close()
        #
        # # Declaracao do Parsl APP
        # @App('python', dfk)
        # def start_parsl_job(name, number, files_path):
        #
        #     result = GetOrbitalParameters().getOrbservations(name, number, files_path)
        #
        #     # Live Logging Downloaded files.
        #     with open(download_log, 'a') as f:
        #         msg = "Download [ FAILURE ] - Object: %s " % (result.get('name'))
        #
        #         if result.get('filename', None) is not None:
        #             msg = "Download [ SUCCESS ] - [ %s ] Object: %s File: %s Size: %s Time: %s seconds" % (
        #                 result.get('source'),
        #                 result.get('name'), result.get('filename'), humanize.naturalsize(result.get('file_size')),
        #                 result.get('download_time'))
        #
        #         time = "%s : " % str(datetime.now())
        #         f.write(time + msg + '\n')
        #     f.close()
        #
        #     return result
        #
        # # executa o app Parsl para cara registro em paralelo
        # results = []
        # for row in records:
        #     # Utiliza o parsl apenas para os objetos que estao marcados
        #     # para serem baixados.
        #     if row.get("need_download"):
        #         results.append(start_parsl_job(row.get("name"), row.get("number"), files_path))
        #
        # # Espera o Resultado de todos os jobs.
        # outputs = [i.result() for i in results]
        #
        # for i in results:
        #     i.done()
        #
        # dfk.cleanup()
        #
        # self.downloaded = outputs
        #
        # self.writer_results(output_path, outputs)
        #
        # t1 = datetime.now()
        #
        # tdelta = t1 - t0
        # with open(download_log, 'a') as f:
        #     f.write('Download Completed in %s\n' % humanize.naturaldelta(tdelta))
        # f.close()


class GetObservations():
    def __init__(self, debug_mode=False):

        if settings.OBSERVATIONS_DIR is None:
            raise Exception("it is necessary to have a valid path defined in the OBSERVATIONS_DIR settings variable.")

        self.observations_dir = settings.OBSERVATIONS_DIR

        self.debug_mode = debug_mode

        self.input_records = []

        self.downloaded = []

    def run(self, input_file, output_path, step_file):
        # Le o CSV com a lista de objetos a serem baixados.
        print("RUN do Observations")

        t0 = datetime.now()


        files_path = settings.OBSERVATIONS_DIR


        # Le o arquivo de entrada e criar uma lista com nome e numero do objeto.
        records = self.read_input(input_file)


        self.input_records = records

        # Exemplos para Debug
        # records = [('1988 RL13', '17420')]  # Exemplo AstDys
        # records = [('1999 CF119', '-')] # Exemplo AstDys sem Num
        # records = [('1999 RC216', '-')] # Exemplo MPC
        # records = [('2016 WM48', '-' )] # Exemplo objeto que nao tem AstDys e MPC
        # records = [('1988 RL13', '17420'), ('1999 CF119', '-'), ('1999 RC216', '-'), ('2016 WM48', '-' )] # Todos

        # Configuracao do Parsl
        dfk = DataFlowKernel(config=settings.PARSL_CONFIG)

        # Configuracao do Parsl Log.
        parsl.set_file_logger(os.path.join(output_path, 'parsl.log'))

        download_log = os.path.join(output_path, 'download_observations.log')
        with open(download_log, 'w') as f:
            f.write('Starting the Download\n')
        f.close()

        # Declaracao do Parsl APP
        @App('python', dfk)
        def start_parsl_job(name, number, files_path):

            result = self.download(name, number, files_path)

            # Live Logging Downloaded files.
            with open(download_log, 'a') as f:
                msg = "Download [ FAILURE ] - Object: %s " % (result.get('name'))

                if result.get('filename', None) is not None:
                    msg = "Download [ SUCCESS ] - [ %s ] Object: %s File: %s Size: %s Time: %s seconds" % (
                        result.get('source'),
                        result.get('name'), result.get('filename'), humanize.naturalsize(result.get('file_size')),
                        result.get('download_time'))

                    # TODO fazer a contagem das observacoes

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
                results.append(start_parsl_job(row.get("name"), row.get("number"), files_path))

        # Espera o Resultado de todos os jobs.
        outputs = [i.result() for i in results]

        for i in results:
            i.done()

        dfk.cleanup()

        self.downloaded = outputs

        print(outputs)

        # self.writer_results(output_path, outputs)

        t1 = datetime.now()

        tdelta = t1 - t0
        with open(download_log, 'a') as f:
            f.write('Download Completed in %s\n' % humanize.naturaldelta(tdelta))
        f.close()


        # Registra na tabela Observations Files
        self.register_downloaded_files(outputs)

        # Registra no Arquivo de steps que terminou de executar essa etapa.
        steps = JsonFile().read(step_file)
        steps.update({"observations": True})
        JsonFile().write(steps, step_file)


    def download(self, name, number, output_path):
        """
            Function to manage the download file with observations
        principal source: AstDyS, second alternative source: MPC
        :param number:
        :param name:
        :param output_path:
        :return:
        """
        t0 = datetime.now()
        files_path = self.observations_dir

        filename = name.replace(' ', '_') + '.rwo'

        # Se o mode de debug estiver ligado pula a etapa de download e acrescenta um sleep
        # if self.debug_mode:
        #     return self.simulate_download(name, number, filename, output_path)

        # Try to download the AstDyS files.
        result = self.download_ast_dys(name, number, filename, output_path)

        # TODO esperando o MPC desbloquer o nosso IP
        # if result is None:
        #     # Try to download from MPC
        #
        #     self.download_mpc(name, number, filename, output_path)

        if result is None:
            result = dict({
                "name": name
            })

        return result

    def download_ast_dys(self, name, number, filename, output_path):

        t0 = datetime.now()

        source = "AstDys"
        # AstDyS Object URL
        url_object = AstDys().getObjectURL(name)

        # AstDys Observation URL
        url = AstDys().getObservationsURL(name, number)

        # Try to download the AstDyS files.
        file_path, download_stats = Download().download_file_from_url(url, output_path=output_path, filename=filename,
                                                                      overwrite=True, ignore_errors=True, timeout=5)
        t1 = datetime.now()

        result = None
        # Checking if the object exists in AstDyS if it does not exist it tries to look in the MPC.
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

    def download_mpc(self, name, number, filename, output_path):
        # Object not found in AstDys trying on MPC
        source = "MPC"

        # MPC Object URL
        url_object = MPC().getObjectURL(name)

        # MPC Observation URL
        url = MPC().getObservationsURL(name, number)

        result = None
        if url is not None:
            # Try to download the MPC files.
            file_path, download_stats = Download().download_file_from_url(url, output_path=output_path,
                                                                          filename=filename, overwrite=True,
                                                                          ignore_errors=True)
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
                    "download_url": url
                })

        return result

    def simulate_download(self, name, number, filename, output_path):
        file_path = os.path.join(output_path, filename)
        if os.path.exists(file_path):
            url_object = AstDys().getObjectURL(name)
            url = AstDys().getObservationsURL(name, number)

            t0 = datetime.now()
            time.sleep(randrange(5))
            t1 = datetime.now()
            tdelta = t1 - t0
            result = dict({
                "name": name,
                "source": "AstDys",
                "filename": filename,
                "download_start_time": t0,
                "download_finish_time": t1,
                "download_time": tdelta.total_seconds(),
                "file_size": os.path.getsize(file_path),
                "external_url": url_object,
                "download_url": url,
            })

            return result

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

    def register_downloaded_files(self, records):
        # Apos o Download e necessario o registro
        self.logger.info("Register downloaded Observations")

        new = 0
        updated = 0

        for record in records:

            obj, created = ObservationFile.objects.update_or_create(
                name=record.get("name"),
                source=record.get("source"),
                defaults={
                    'observations': 0, # TODO recuperar o numero de observacoes
                    'filename': record.get("filename"),
                    'download_start_time': record.get("download_start_time"),
                    'download_finish_time': record.get("download_finish_time"),
                    'file_size': record.get("file_size"),
                    'external_url': record.get("external_url"),
                    'download_url': record.get("download_url")

                }
            )

            if created:
                new = new + 1
                self.logger.debug("Registered [ %s ] " % record.get("name"))
            else:
                updated = updated + 1
                self.logger.debug("Updated [ %s ] " % record.get("name"))

        self.logger.info("Inputs [ %s ] Downloaded [ %s ] Registered [ %s ] Updated [ %s ]" % (len(self.input_records), len(self.downloaded), new, updated))
