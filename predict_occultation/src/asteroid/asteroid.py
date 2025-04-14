import configparser
import datetime
import json
import logging
import os
import pathlib
import sys
import time
import urllib.parse
from datetime import datetime as dt
from datetime import timedelta, timezone
from io import StringIO
from typing import List, Optional

import pandas as pd
from asteroid.external_inputs import AsteroidExternalInputs
from asteroid.jpl import findSPKID, get_asteroid_uncertainty_from_jpl, get_bsp_from_jpl
from dao import AsteroidDao, ObservationDao, OccultationDao
from library import date_to_jd, dec2DMS, has_expired, ra2HMS


def serialize(obj):
    """JSON serializer for objects not serializable by default json code"""

    if isinstance(obj, datetime.date):
        serial = obj.isoformat()
        return serial

    if isinstance(obj, datetime.time):
        serial = obj.isoformat()
        return serial

    if isinstance(obj, pathlib.PosixPath):
        serial = str(obj)
        return serial

    if isinstance(obj, logging.Logger):
        return None

    return obj.__dict__


class Asteroid:
    __log = None
    __BSP_START_PERIOD: str = "2012-01-01"
    __BSP_YEARS_AHEAD: int = 1
    __BSP_YEARS_BEHIND: int = 1
    __BSP_DAYS_TO_EXPIRE: int = 60
    __BASE_PATH: pathlib.Path
    __dao = None
    __ast_data_columns = list = []

    # Status
    # 0 = undefined
    # 1 = Success
    # 2 = Failure
    status: int
    job_id: int
    task_id: int

    # spkid = None
    name: str
    number: str
    alias: str
    provisional_designation: str
    spkid: Optional[str]
    base_dynclass: str
    dynclass: str
    path: pathlib.Path

    # External Inputs
    star_catalog: dict = {}
    bsp_jpl: dict
    # Pipeline Steps Status
    predict_occultation: dict  # Representa os resultados da execuçao do praia_occ
    calculate_path_coeff: dict
    ingest_occultations: dict

    messages: List
    exec_time: float

    def __init__(
        self, name, base_path, log=None, inputs_path=None, new_run=False, path=None
    ):
        self.set_log(log)

        # A classe pode ser instanciada de duas formas
        # Usando base_path ira criar um diretório para o asteroid
        # Fazer a consulta no banco de dados e criar o Json.
        # TODO: Usando path ira carregar o arquivo json existente.

        self.__BASE_PATH = base_path

        if inputs_path is None:
            inputs_path = base_path
        self.__INPUTS_PATH = inputs_path

        # Status
        # 0 = undefined
        # 1 = Success
        # 2 = Failure
        self.status = 0

        # Instantiate Asteroid Data Access Object
        self.__dao = AsteroidDao()

        # Query asteroid mpc data from tno portal asteroid table.
        self.__log.debug("Querying asteroid data in the portal tno_asteroid table.")
        ast_data = self.__dao.get_by_name(name)

        if ast_data is None:
            message = f"Asteroid not found in the portal database. {name}"
            self.__log.error(message)
            raise Exception(message)
        # self.__log.debug(ast_data)

        # Remove o atributo ID (interno do portal)
        ast_data.pop("id", None)

        # Guarda a lista de atributos do asteroid, para facilitar
        # a criacao do dataframe de predicoes.
        self.__ast_data_columns = list(ast_data.keys())
        # self.__log.debug(self.__ast_data_columns)

        # Setando atributos de identificação do job
        self.job_id = None
        self.task_id = None

        # Setando os astributos de identificação do asteroid.
        self.name = ast_data["name"]
        self.number = str(ast_data["number"])
        self.alias = ast_data["alias"]
        self.provisional_designation = ast_data["principal_designation"]
        self.spkid = None
        self.base_dynclass = ast_data["base_dynclass"]
        self.dynclass = ast_data["dynclass"]

        # Adiciona todos os campos retornados na query
        # Como atributos da instancia dessa classe.
        self.__dict__.update(ast_data)

        # External Inputs
        self.star_catalog = {}
        self.bsp_jpl = {}

        # Pipeline Stages Status
        self.predict_occultation = {}
        self.ingest_occultations = {}
        self.calculate_path_coeff = {}
        self.messages = []

        # Verifica se existe diretório/json file para este asteroid.
        if path is None:
            self.path = self.get_or_create_dir()
        else:
            self.path = path

        # Se for uma nova execução remove os arquivos anteriores.
        # Utilizado em dev quando se está rodando o mesmo processo varias vezes.
        if new_run:
            self.remove_previus_results(remove_inputs=True)

        # Se existir arquivo json para o objeto carrega o seu conteudo
        # Atualizando/Adicionando atributos na class.
        self.__log.debug("Loading information from asteroid.json if it exists.")
        json_data = self.read_asteroid_json()
        self.__dict__.update(json_data)
        # self.__log.debug(json_data)

        self.write_asteroid_json()

    def __getitem__(self, item):
        return self.__dict__[item]

    def to_dict(self):
        dcopy = self.__dict__.copy()
        return dict(
            (key, value)
            for (key, value) in dcopy.items()
            if key.startswith("_") is False
        )

    def set_log(self, logname):
        if isinstance(logname, str):
            self.__logname = logname
            self.__log = logging.getLogger(logname)
        elif isinstance(logname, logging.Logger):
            self.__logname = logname.name
            self.__log = logname
        elif logname is None:
            self.__logname = "Asteroid"
            self.__log = logging.getLogger("Asteroid")
            self.__log.addHandler(logging.StreamHandler(sys.stdout))

    def get_log(self):
        if self.__log is None:
            self.__log = logging.getLogger(self.__logname)

        return self.__log

    def get_base_path(self):
        base_path = self.__BASE_PATH
        # if not base_path:
        #     # Carrega as variaveis de configuração do arquivo config.ini
        #     config = configparser.ConfigParser()
        #     config.read(os.path.join(os.environ["EXECUTION_PATH"], "config.ini"))
        #     base_path = config["DEFAULT"].get("AsteroidPath")
        #     self.__BASE_PATH = base_path

        return base_path

    def get_jpl_email(self):
        # Carrega as variaveis de configuração do arquivo config.ini
        # config = configparser.ConfigParser()
        # config.read(os.path.join(os.environ["EXECUTION_PATH"], "config.ini"))
        # JPL_EMAIL = config["DEFAULT"].get("JplEmail", "sso-portal@linea.gov.br")
        JPL_EMAIL = "sso-portal@linea.gov.br"
        return JPL_EMAIL

    def get_or_create_dir(self):
        """Criar o diretório para o asteroid.

        Args:
            name ([type]): [description]
        """
        asteroid_path = pathlib.Path.joinpath(
            pathlib.Path(self.get_base_path()), self.alias
        )

        pathlib.Path(asteroid_path).mkdir(parents=True, exist_ok=True)

        return asteroid_path

    def get_path(self):
        return self.path

    def set_success(self):
        self.status = 1

    def set_failure(self):
        self.status = 2

    def set_star_catalog(
        self,
        name: str,
        display_name: str,
        schema: str,
        tablename: str,
        ra_property: str,
        dec_property: str,
        **kwargs,
    ):
        self.star_catalog = {
            "name": name,
            "display_name": display_name,
            "schema": schema,
            "tablename": tablename,
            "ra_property": ra_property,
            "dec_property": dec_property,
        }
        self.write_asteroid_json()

    def get_star_catalog(self):
        return self.star_catalog

    def set_job_id(self, job_id):
        self.job_id = int(job_id)
        self.write_asteroid_json()

    def set_task_id(self, task_id):
        self.task_id = int(task_id)
        self.write_asteroid_json()

    def set_predict_occultation(self, data):
        self.predict_occultation = data
        self.write_asteroid_json()

    def set_calculate_path_coeff(self, data):
        self.calculate_path_coeff = data
        self.write_asteroid_json()

    def read_asteroid_json(self):
        filename = "{}.json".format(self.alias)

        filepath = pathlib.Path(self.path, filename)

        if not filepath.exists():
            # Se não existir um json para este asteroid cria um.
            # self.write_asteroid_json()
            return {}

        with open(filepath) as json_file:
            return json.load(json_file)

    def write_asteroid_json(self):
        filename = "{}.json".format(self.alias)
        filepath = pathlib.Path(self.path, filename)

        d = self.to_dict()

        with open(filepath, "w") as json_file:
            json.dump(d, json_file, default=serialize)

    def get_bsp_path(self):
        filename = self.get_bsp_filename()
        # Utiliza o diretório dos arquivos BSP
        # Fora do diretório da execução.
        input_path = pathlib.Path(self.__INPUTS_PATH).joinpath(self.alias)
        input_path.mkdir(parents=True, exist_ok=True)

        filepath = input_path.joinpath(filename)
        return filepath

    def read_bsp_info_json(self):
        filepath = self.get_bsp_path().parent.joinpath("bsp_jpl_info.json")
        if not filepath.exists():
            # Se não existir um json para o arquivo BSP.
            raise Exception("BSP JPL Info file not found. [%s]" % filepath)

        with open(filepath) as json_file:
            return json.load(json_file)

    def calculate_bsp_start_period(self, start_period):
        years_behind = int(self.__BSP_YEARS_BEHIND)
        start_period = dt.strptime(str(start_period), "%Y-%m-%d")
        start = dt(year=start_period.year - years_behind, month=1, day=1)

        return start.strftime("%Y-%m-%d")

    def calculate_bsp_end_period(self, end_period):
        years_ahead = int(self.__BSP_YEARS_AHEAD)
        end_period = dt.strptime(str(end_period), "%Y-%m-%d")
        end = dt(year=end_period.year + years_ahead, month=12, day=31)

        return end.strftime("%Y-%m-%d")

    def get_bsp_filename(self):
        return f"{self.alias}.bsp"

    # def download_jpl_bsp(self, end_period, force=False, start_period=None):
    #     """
    #     Exemplo do retorno:
    #         {
    #             'source': 'JPL',
    #             'filename': '2010BJ35.bsp',
    #             'size': 225280,
    #             'start_period': '2012-01-01',
    #             'end_period': '2024-12-31',
    #             'dw_start': '2021-11-23T20:27:21.014818+00:00',
    #             'dw_finish': '2021-11-23T20:27:23.887789+00:00',
    #             'dw_time': 2.872971
    #         }
    #     """
    #     log = self.get_log()
    #     log.debug("Downloading BSP JPL started")
    #     log.debug(f"BSP JPL: [{self.get_bsp_path()}]")

    #     bsp_filepath = self.get_bsp_path()
    #     bsp_filename = self.get_bsp_filename()

    #     if force is True and bsp_filepath.exists():
    #         # Remove o arquivo se já existir e force=True
    #         # Um novo download será realizado.
    #         bsp_filepath.unlink()
    #         log.debug("Removed old bsp: [%s]" % (not bsp_filepath.exists()))

    #     if start_period is None:
    #         start_period = self.__BSP_START_PERIOD
    #     else:
    #         start_period = self.calculate_bsp_start_period(start_period)

    #     t0 = dt.now(tz=timezone.utc)
    #     end_period = self.calculate_bsp_end_period(end_period)

    #     try:
    #         bsp_path = get_bsp_from_jpl(
    #             self.provisional_designation,
    #             start_period,
    #             end_period,
    #             bsp_filepath.parent,
    #             bsp_filename,
    #         )
    #         mag_and_uncert_path = get_asteroid_uncertainty_from_jpl(
    #             self.provisional_designation,
    #             start_period,
    #             end_period,
    #             bsp_filepath.parent,
    #             "apmag_and_uncertainties.json",
    #             step=12,
    #         )
    #         t1 = dt.now(tz=timezone.utc)
    #         tdelta = t1 - t0

    #         # Retrieve SPKID FRON BSP FILE
    #         spkid = None
    #         try:
    #             spkid = findSPKID(str(bsp_path))
    #             if spkid == "":
    #                 spkid = None
    #         except Exception as e:
    #             raise Exception("Failed to find SPKID in BSP file. Error: [%s]" % e)

    #         data = dict(
    #             {
    #                 "source": "JPL",
    #                 "spkid": spkid,
    #                 "filename": bsp_path.name,
    #                 "size": bsp_path.stat().st_size,
    #                 "start_period": start_period,
    #                 "end_period": end_period,
    #                 "dw_start": t0.isoformat(),
    #                 "dw_finish": t1.isoformat(),
    #                 "dw_time": tdelta.total_seconds(),
    #                 "mag_and_uncert_file": mag_and_uncert_path.name,
    #             }
    #         )

    #         bsp_info = pathlib.Path(bsp_filepath.parent, "bsp_jpl_info.json")
    #         with open(bsp_info, "w") as json_file:
    #             json.dump(data, json_file, default=serialize)

    #         log.info(f"Asteroid BSP Downloaded in {tdelta}")

    #         return (data, "")
    #     except Exception as e:
    #         download_exception_warning = "Failed to Download BSP. Error: [%s]" % e
    #         log.warning(download_exception_warning)
    #         return (None, download_exception_warning)

    ####
    def download_jpl_bsp(self, end_period, force=False, start_period=None):
        """
        Exemplo do retorno:
            {
                'source': 'JPL',
                'filename': '2010BJ35.bsp',
                'size': 225280,
                'start_period': '2012-01-01',
                'end_period': '2024-12-31',
                'dw_start': '2021-11-23T20:27:21.014818+00:00',
                'dw_finish': '2021-11-23T20:27:23.887789+00:00',
                'dw_time': 2.872971
            }
        """
        log = self.get_log()
        log.debug("Downloading BSP JPL started")
        log.debug(f"BSP JPL: [{self.get_bsp_path()}]")

        bsp_filepath = self.get_bsp_path()
        bsp_filename = self.get_bsp_filename()

        if force is True and bsp_filepath.exists():
            # Remove o arquivo se já existir e force=True
            # Um novo download será realizado.
            bsp_filepath.unlink()
            log.debug("Removed old bsp: [%s]" % (not bsp_filepath.exists()))

        if start_period is None:
            start_period = self.__BSP_START_PERIOD
        else:
            start_period = self.calculate_bsp_start_period(start_period)

        t0 = dt.now(tz=timezone.utc)
        end_period = self.calculate_bsp_end_period(end_period)

        identifiers = [self.name, self.number, self.provisional_designation]

        for identifier in identifiers:
            ## if self.name
            if identifier == self.name:
                identifier = urllib.parse.quote(identifier)
                print(identifier)

            if not identifier:
                continue  # Pula valores inválidos
            try:
                # print(self.provisional_designation)
                print(identifier)
                bsp_path = get_bsp_from_jpl(
                    str(identifier),  # self.provisional_designation,
                    start_period,
                    end_period,
                    bsp_filepath.parent,
                    bsp_filename,
                )
                mag_and_uncert_path = get_asteroid_uncertainty_from_jpl(
                    str(identifier),  # self.provisional_designation,
                    start_period,
                    end_period,
                    bsp_filepath.parent,
                    "apmag_and_uncertainties.json",
                    step=12,
                )
                t1 = dt.now(tz=timezone.utc)
                tdelta = t1 - t0

                # Retrieve SPKID FRON BSP FILE
                spkid = None
                try:
                    spkid = findSPKID(str(bsp_path))
                    if spkid == "":
                        spkid = None
                except Exception as e:
                    raise Exception("Failed to find SPKID in BSP file. Error: [%s]" % e)

                data = dict(
                    {
                        "source": "JPL",
                        "spkid": spkid,
                        "filename": bsp_path.name,
                        "size": bsp_path.stat().st_size,
                        "start_period": start_period,
                        "end_period": end_period,
                        "dw_start": t0.isoformat(),
                        "dw_finish": t1.isoformat(),
                        "dw_time": tdelta.total_seconds(),
                        "mag_and_uncert_file": mag_and_uncert_path.name,
                    }
                )

                bsp_info = pathlib.Path(bsp_filepath.parent, "bsp_jpl_info.json")
                with open(bsp_info, "w") as json_file:
                    json.dump(data, json_file, default=serialize)

                log.info(f"Asteroid BSP Downloaded in {tdelta}")

                return (data, "")
            except Exception as e:
                log.warning(f"Failed to Download BSP using {identifier}. Error: [{e}]")

        download_exception_warning = "Failed to Download BSP using all identifiers."
        log.error(download_exception_warning)
        return (None, download_exception_warning)

    ####

    def check_bsp_jpl(self, end_period, start_period=None):
        log = self.get_log()

        tp0 = dt.now(tz=timezone.utc)

        try:
            log.debug("Asteroid Checking BSP JPL")

            # verifica se existe bsp jpl baixado previamente no diretório de inputs

            # Path para o arquivo BSP
            bsp_path = self.get_bsp_path()

            # Verificar se o arquivo BSP existe
            if bsp_path.exists():
                # Read bsp jpl information from file
                bsp_info = self.read_bsp_info_json()

                # Verificar se o periodo do bsp atende ao periodo da execução.
                bsp_start_period = dt.strptime(
                    bsp_info["start_period"], "%Y-%m-%d"
                ).date()
                exec_start_period = dt.strptime(str(start_period), "%Y-%m-%d").date()

                bsp_end_period = dt.strptime(bsp_info["end_period"], "%Y-%m-%d").date()
                exec_end_period = dt.strptime(str(end_period), "%Y-%m-%d").date()

                if (
                    bsp_start_period < exec_start_period
                    and bsp_end_period > exec_end_period
                ):
                    # O BSP contem dados para um periodo maior que o necessário para execução
                    # BSP que já existe atente todos os critérios não será necessário um novo Download.
                    self.bsp_jpl = bsp_info
                    log.info(
                        "Asteroid Pre-existing BSP is still valid and will be reused."
                    )

                    # TODO: Rever esta parte o spkid pode vir ta tabela do Asteroid ou do arquivo bsp_jpl_info.json
                    # Toda vez que baixar um novo BSP recalcular o SPKID
                    self.spkid = bsp_info["spkid"]
                    # self.get_spkid()
                    if self.spkid is None:
                        log.warning(
                            "Asteroid [%s] Could not identify the SPKID." % self.name
                        )
                    else:
                        log.debug("Asteroid [%s] SPKID [%s]." % (self.name, self.spkid))
                    return True
            else:
                return False

        except Exception as e:
            msg = "Failed in the BSP JPL stage. Error: %s" % e

            self.bsp_jpl = dict({"message": msg})
            log.error("Asteroid [%s] %s" % (self.name, msg))

            return False

        finally:
            # Atualiza o Json do Asteroid
            tp1 = dt.now(tz=timezone.utc)

            if "filename" not in self.bsp_jpl:
                self.bsp_jpl.update({"message": "BSP JPL file was not found."})

            self.bsp_jpl.update(
                {"tp_start": tp0.isoformat(), "tp_finish": tp1.isoformat()}
            )

            self.write_asteroid_json()

    def remove_previus_results(self, remove_inputs=False):
        log = self.get_log()
        log.debug("Removing previous results.")

        t0 = dt.now(tz=timezone.utc)

        removed_files = []

        ignore_files = [
            "{}.json".format(self.alias),
            "{}.bsp".format(self.alias),
            "{}.eq0".format(self.alias),
            "{}.eqm".format(self.alias),
            "{}.rwo".format(self.alias),
            "{}.rwm".format(self.alias),
            "{}.txt".format(self.alias),
        ]

        # Se a opção remove_inputs for verdadeira
        # Todos os arquivos do diretório serão removidos a flag ignore_files será ignorada
        if remove_inputs is True:
            ignore_files = []

            # Ao remover os arquivos de input limpa tb os metadados sobre os arquivos
            # self.des_observations = {}
            self.bsp_jpl = {}
            # self.observations = {}
            # self.orbital_elements = {}

        path = pathlib.Path(self.path)
        for f in path.iterdir():
            if f.name not in ignore_files:
                removed_files.append(f.name)
                log.debug(f"Removed: [{f.name}]")
                f.unlink()

        # Limpa os metadados das etapas de resultado
        self.predict_occultation = {}
        self.ingest_occultations = {}

        # Atualiza o Json do Asteroid
        self.write_asteroid_json()

        t1 = dt.now(tz=timezone.utc)
        tdelta = t1 - t0

        # log.debug("Removed Files: [%s]" % ", ".join(removed_files))
        log.info("Removed [%s] files in %s" % (len(removed_files), tdelta))

    def register_occultations(self):
        log = self.get_log()
        t0 = dt.now(tz=timezone.utc)

        jobid = int(self.job_id)
        try:
            dao = OccultationDao(log=log)

            # Não executou a etapa de predição.
            # Não há arquivo com os resultados.
            if "filename" not in self.predict_occultation:
                log.warning("There is no file with the predictions.")
                return 0

            predict_table_path = pathlib.Path(
                self.path, self.predict_occultation["filename"]
            )

            # Arquivo com resultados da predicao nao foi criado
            # Foi executado mais não gerou resultados.
            if not predict_table_path.exists():
                return 0

            # Le o arquivo occultation table e cria um dataframe
            df = pd.read_csv(
                predict_table_path,
                delimiter=";",
            )

            # -------------------------------------------------
            # Provenance Fields
            # Adiciona algumas informacoes de Proveniencia a cada evento de predicao
            # -------------------------------------------------
            df["job_id"] = jobid

            # Altera a ordem das colunas para coincidir com a da tabela
            df = df.reindex(
                columns=[
                    "name",
                    "number",
                    "date_time",
                    "gaia_source_id",
                    "ra_star_candidate",
                    "dec_star_candidate",
                    "ra_target",
                    "dec_target",
                    "closest_approach",
                    "position_angle",
                    "velocity",
                    "delta",
                    "g",
                    "j_star",
                    "h",
                    "k_star",
                    "long",
                    "loc_t",
                    "off_ra",
                    "off_dec",
                    "proper_motion",
                    "ct",
                    "multiplicity_flag",
                    "e_ra",
                    "e_dec",
                    "pmra",
                    "pmdec",
                    "ra_star_deg",
                    "dec_star_deg",
                    "ra_target_deg",
                    "dec_target_deg",
                    "created_at",
                    "apparent_diameter",
                    "aphelion",
                    "apparent_magnitude",
                    "dec_star_to_date",
                    "dec_star_with_pm",
                    "dec_target_apparent",
                    "diameter",
                    "e_dec_target",
                    "e_ra_target",
                    "eccentricity",
                    "ephemeris_version",
                    "g_mag_vel_corrected",
                    "h_mag_vel_corrected",
                    "inclination",
                    "instant_uncertainty",
                    "magnitude_drop",
                    "perihelion",
                    "ra_star_to_date",
                    "ra_star_with_pm",
                    "ra_target_apparent",
                    "rp_mag_vel_corrected",
                    "semimajor_axis",
                    "have_path_coeff",
                    "occ_path_max_longitude",
                    "occ_path_min_longitude",
                    "occ_path_coeff",
                    "occ_path_is_nightside",
                    "occ_path_max_latitude",
                    "occ_path_min_latitude",
                    "base_dynclass",
                    "bsp_planetary",
                    "bsp_source",
                    "catalog",
                    "dynclass",
                    "job_id",
                    "leap_seconds",
                    "nima",
                    # "obs_source",
                    # "orb_ele_source",
                    "predict_step",
                    "albedo",
                    "albedo_err_max",
                    "albedo_err_min",
                    "alias",
                    "arg_perihelion",
                    "astorb_dynbaseclass",
                    "astorb_dynsubclass",
                    "density",
                    "density_err_max",
                    "density_err_min",
                    "diameter_err_max",
                    "diameter_err_min",
                    "epoch",
                    "last_obs_included",
                    "long_asc_node",
                    "mass",
                    "mass_err_max",
                    "mass_err_min",
                    "mean_anomaly",
                    "mean_daily_motion",
                    "mpc_critical_list",
                    "pha_flag",
                    "principal_designation",
                    "rms",
                    "g_star",
                    "h_star",
                    "event_duration",
                    "moon_separation",
                    "sun_elongation",
                    "closest_approach_uncertainty",
                    "moon_illuminated_fraction",
                    "probability_of_centrality",
                    "hash_id",
                    "closest_approach_uncertainty_km",
                ]
            )

            # ATENCAO! Sobrescreve o arquivo occultation_table.csv
            df.to_csv(predict_table_path, index=False, sep=";")

            rowcount = dao.upinsert_occultations(df)

            del df
            del dao

            self.ingest_occultations.update({"count": rowcount})

            return rowcount
        except Exception as e:
            msg = "Failed in Ingest Occultations stage. Error: %s" % e

            self.ingest_occultations.update({"message": msg})
            log.error("Asteroid [%s] %s" % (self.name, msg))
            self.set_failure()
            return 0

        finally:
            t1 = dt.now(tz=timezone.utc)
            tdelta = t1 - t0

            self.ingest_occultations.update(
                {
                    "start": t0.isoformat(),
                    "finish": t1.isoformat(),
                    "exec_time": tdelta.total_seconds(),
                }
            )

            # Atualiza o Json do Asteroid
            self.write_asteroid_json()

    def consiladate(self):
        log = self.get_log()

        a = dict(
            {
                "name": self.name,
                "number": self.number,
                "base_dynclass": self.base_dynclass,
                "dynclass": self.dynclass,
            }
        )

        try:
            exec_time = 0

            if self.bsp_jpl:
                if "message" in self.bsp_jpl:
                    self.messages.append(self.bsp_jpl["message"])
                    self.set_failure()

                elif "filename" in self.bsp_jpl and self.bsp_jpl["filename"]:
                    a.update(
                        {
                            "bsp_jpl_start": self.bsp_jpl["dw_start"],
                            "bsp_jpl_finish": self.bsp_jpl["dw_finish"],
                            "bsp_jpl_dw_time": self.bsp_jpl["dw_time"],
                            "bsp_jpl_dw_run": self.bsp_jpl.get(
                                "downloaded_in_this_run", False
                            ),
                            "bsp_jpl_tp_start": self.bsp_jpl["tp_start"],
                            "bsp_jpl_tp_finish": self.bsp_jpl["tp_finish"],
                        }
                    )

                    exec_time += float(self.bsp_jpl["dw_time"])

            if self.predict_occultation:
                if "message" in self.predict_occultation:
                    self.messages.append(self.predict_occultation["message"])
                    self.set_failure()
                else:
                    a.update(
                        {
                            "occultations": int(self.predict_occultation["count"]),
                            "stars": int(self.predict_occultation["stars"]),
                            "pre_occ_start": self.predict_occultation["start"],
                            "pre_occ_finish": self.predict_occultation["finish"],
                            "pre_occ_exec_time": self.predict_occultation["exec_time"],
                        }
                    )
                    exec_time += float(self.predict_occultation["exec_time"])

            # Calculate Path Coeff
            if "message" in self.calculate_path_coeff:
                self.messages.append(self.calculate_path_coeff["message"])
                self.set_failure()

            a.update(
                {
                    "calc_path_coeff_start": self.calculate_path_coeff.get(
                        "start", None
                    ),
                    "calc_path_coeff_finish": self.calculate_path_coeff.get(
                        "finish", None
                    ),
                    "calc_path_coeff_exec_time": self.calculate_path_coeff.get(
                        "exec_time", 0
                    ),
                }
            )
            exec_time += float(self.calculate_path_coeff.get("exec_time", 0))

            # Ingest Occultations
            if "message" in self.ingest_occultations:
                self.messages.append(self.ingest_occultations["message"])
                self.set_failure()

            a.update(
                {
                    "ing_occ_count": int(self.ingest_occultations.get("count", 0)),
                    "ing_occ_start": self.ingest_occultations.get("start", None),
                    "ing_occ_finish": self.ingest_occultations.get("finish", None),
                    "ing_occ_exec_time": self.ingest_occultations.get("exec_time", 0),
                }
            )

            exec_time += float(self.ingest_occultations.get("exec_time", 0))

            # Tempo total de execução do Asteroid
            a["exec_time"] = exec_time
            self.exec_time = exec_time

        except Exception as e:
            self.set_failure()

            msg = "Failed to consolidate asteroid results. Error: %s" % e
            log.error("Asteroid [%s] %s" % (self.name, msg))
            self.messages.append(msg)

        finally:
            # Junta todas as mensagens Warnings e Errors em uma string separada por ;
            self.messages = list(dict.fromkeys(self.messages))
            a["messages"] = "; ".join(self.messages)

            if self.status == 2:
                a["status"] = 2
            else:
                # Se nao foi marcado com erro ate aqui entao
                # Pode ser considerado Sucesso!
                self.set_success()
                a["status"] = 1

            # Atualiza o Json do Asteroid
            self.write_asteroid_json()
            return a

    def remove_outputs(self):
        log = self.get_log()
        # log.debug("Removing Outputs.")

        t0 = dt.now(tz=timezone.utc)

        removed_files = []

        ignore_files = [
            "{}.json".format(self.alias),
            "{}.bsp".format(self.alias),
            "{}.eq0".format(self.alias),
            "{}.eqm".format(self.alias),
            "{}.rwo".format(self.alias),
            "{}.rwm".format(self.alias),
            "{}.txt".format(self.alias),
            "diff_bsp-ni.png",
            "diff_nima_jpl_Dec.png",
            "diff_nima_jpl_RA.png",
            "omc_sep_recent.png",
            "omc_sep_all.png",
            "praia_occultation_table.csv",
            "occultation_table.csv",
        ]

        path = pathlib.Path(self.path)
        for f in path.iterdir():
            if f.name not in ignore_files:
                removed_files.append(f.name)
                f.unlink()

        t1 = dt.now(tz=timezone.utc)
        tdelta = t1 - t0

        # log.debug("Removed Files: [%s]" % ", ".join(removed_files))
        log.info("Removed [%s] files in %s" % (len(removed_files), tdelta))

    def get_spkid(self):
        log = self.get_log()

        if self.spkid is None or self.spkid == "":
            bsp_path = self.get_bsp_path()

            if self.bsp_jpl and bsp_path.exists():
                log.debug("Search the SPKID from bsp file.")

                try:
                    spkid = findSPKID(str(bsp_path))

                    if spkid is None or spkid == "":
                        self.spkid = None
                        log.warning(
                            "Asteroid [%s] Could not identify the SPKID." % self.name
                        )
                    else:
                        self.spkid = spkid
                        log.debug("Asteroid [%s] SPKID [%s]." % (self.name, self.spkid))

                except Exception as e:
                    self.spkid = None
                    log.warning("Asteroid [%s] %s." % (self.name, e))

                self.write_asteroid_json()

        return self.spkid
