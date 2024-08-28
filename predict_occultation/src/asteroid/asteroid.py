import configparser
import datetime
import json
import logging
import os
import pathlib
from datetime import datetime as dt
from datetime import timezone
from io import StringIO
from typing import Optional

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

    # spkid = None
    name: str
    number: str
    alias: str
    provisional_designation: str
    spkid: Optional[str]
    base_dynclass: str
    dynclass: str
    path: pathlib.Path

    ot_query_ccds: dict
    ot_theo_pos: dict
    ot_ing_obs: dict

    star_catalog: dict = {}
    des_observations: dict
    bsp_jpl: dict
    observations: dict
    orbital_elements: dict
    refine_orbit: dict
    predict_occultation: dict
    calculate_path_coeff: dict
    ingest_occultations: dict

    messages: list
    exec_time: float

    def __init__(self, name, base_path, log, new_run=False):

        self.__BASE_PATH = base_path
        self.set_log(log)

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
        # self.__log.debug(ast_data)

        # Remove o atributo ID (interno do portal)
        ast_data.pop("id", None)

        # Guarda a lista de atributos do asteroid, para facilitar
        # a criacao do dataframe de predicoes.
        self.__ast_data_columns = list(ast_data.keys())
        # self.__log.debug(self.__ast_data_columns)

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

        self.star_catalog = {}
        self.des_observations = {}
        self.bsp_jpl = {}
        self.observations = {}
        self.orbital_elements = {}
        self.refine_orbit = {}
        self.predict_occultation = {}
        self.ingest_occultations = {}
        self.calculate_path_coeff = {}
        self.messages = []

        # Verifica se existe diretório/json file para este asteroid.
        self.path = self.get_or_create_dir()
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
        filepath = pathlib.Path.joinpath(pathlib.Path(self.path), filename)

        return filepath

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

        bsp_path = self.get_bsp_path()
        bsp_filename = self.get_bsp_filename()

        if force is True and bsp_path.exists():
            # Remove o arquivo se já existir e force=True
            # Um novo download será realizado.
            bsp_path.unlink()
            log.debug("Removed old bsp: [%s]" % (not bsp_path.exists()))

        if start_period is None:
            start_period = self.__BSP_START_PERIOD
        else:
            start_period = self.calculate_bsp_start_period(start_period)

        t0 = dt.now(tz=timezone.utc)
        end_period = self.calculate_bsp_end_period(end_period)

        try:
            bsp_path = get_bsp_from_jpl(
                self.provisional_designation,
                start_period,
                end_period,
                self.path,
                bsp_filename,
            )
            mag_and_uncert_path = get_asteroid_uncertainty_from_jpl(
                self.provisional_designation,
                start_period,
                end_period,
                self.path,
                "apmag_and_uncertainties.json",
                step=12,
            )
            t1 = dt.now(tz=timezone.utc)
            tdelta = t1 - t0

            data = dict(
                {
                    "source": "JPL",
                    "filename": bsp_path.name,
                    "size": bsp_path.stat().st_size,
                    "start_period": start_period,
                    "end_period": end_period,
                    "dw_start": t0.isoformat(),
                    "dw_finish": t1.isoformat(),
                    "dw_time": tdelta.total_seconds(),
                    "downloaded_in_this_run": True,
                    "mag_and_uncert_file": mag_and_uncert_path.name,
                }
            )

            log.info(f"Asteroid BSP Downloaded in {tdelta}")

            return (data, "")
        except Exception as e:
            download_exception_warning = "Failed to Download BSP. Error: [%s]" % e
            log.warning(download_exception_warning)
            return (None, download_exception_warning)

    def check_bsp_jpl(self, end_period, days_to_expire=None, start_period=None):
        log = self.get_log()

        tp0 = dt.now(tz=timezone.utc)

        try:
            log.debug("Asteroid Checking BSP JPL")

            if days_to_expire is None:
                days_to_expire = self.__BSP_DAYS_TO_EXPIRE

            if days_to_expire == 0:
                # Força o download de um novo BSP
                self.bsp_jpl = {}
                log.debug("Force Download days to expire = 0")

            bsp_jpl = {}

            # Verificar insformações sobre o BSP no Json
            if self.bsp_jpl and "filename" in self.bsp_jpl:
                # Já existe Informações de BSP baixado

                # Path para o arquivo BSP
                bsp_path = self.get_bsp_path()

                # Verificar se o arquivo BSP existe
                if bsp_path.exists():
                    # Arquivo Existe Verificar se está na validade usando da data de criação do arquivo
                    dt_creation = dt.fromtimestamp(bsp_path.stat().st_mtime)

                    if not has_expired(dt_creation, days_to_expire):
                        # BSP Está na validade
                        # Verificar se o periodo do bsp atende ao periodo da execução.
                        bsp_start_period = dt.strptime(
                            self.bsp_jpl["start_period"], "%Y-%m-%d"
                        ).date()
                        exec_start_period = dt.strptime(
                            str(start_period), "%Y-%m-%d"
                        ).date()

                        bsp_end_period = dt.strptime(
                            self.bsp_jpl["end_period"], "%Y-%m-%d"
                        ).date()
                        exec_end_period = dt.strptime(
                            str(end_period), "%Y-%m-%d"
                        ).date()

                        if (
                            bsp_start_period < exec_start_period
                            and bsp_end_period > exec_end_period
                        ):
                            # O BSP contem dados para um periodo maior que o necessário para execução
                            # BSP que já existe atente todos os critérios não será necessário um novo Download.
                            bsp_jpl = self.bsp_jpl
                            bsp_jpl["downloaded_in_this_run"] = False
                            log.info(
                                "Asteroid Pre-existing BSP is still valid and will be reused."
                            )

            if not bsp_jpl:
                # Fazer um novo Download do BSP
                bsp_jpl = self.download_jpl_bsp(
                    start_period=start_period, end_period=end_period, force=True
                )

                # Toda vez que baixar um novo BSP recalcular o SPKID
                self.spkid = None
                self.get_spkid()

            # Separa o dado da mensagem/exception retornada do metodo bsp_jpl
            bsp_jpl, exp_msg = bsp_jpl
            if bsp_jpl:
                # Atualiza os dados do bsp
                self.bsp_jpl = bsp_jpl

                return True
            else:
                msg = "BSP JPL file was not created."
                self.bsp_jpl = dict({"message": msg + " " + exp_msg})

                log.warning("Asteroid [%s] %s" % (self.name, msg))
                log.warning("Asteroid [%s] %s" % (self.name, exp_msg))
                return False

        except Exception as e:
            msg = "Failed in the BSP JPL stage. Error: %s" % e

            self.bsp_jpl = dict({"message": msg})
            log.error("Asteroid [%s] %s" % (self.name, msg))

            return False

        finally:
            # Atualiza o Json do Asteroid
            tp1 = dt.now(tz=timezone.utc)

            self.bsp_jpl.update(
                {"tp_start": tp0.isoformat(), "tp_finish": tp1.isoformat()}
            )

            self.write_asteroid_json()

    def check_orbital_elements(self, days_to_expire=None, ignore=False):
        log = self.get_log()

        tp0 = dt.now(tz=timezone.utc)

        try:
            log.debug("Checking Orbital Elements")

            aei = AsteroidExternalInputs(
                name=self.name,
                number=self.number,
                asteroid_path=self.path,
                logname=self.__logname,
            )

            if days_to_expire is None:
                days_to_expire = aei.MPC_DAYS_TO_EXPIRE

            orb_ele = {}

            # Verificar insformações sobre Orbital Elements no Json
            if self.orbital_elements and "filename" in self.orbital_elements:
                # Já existe Informações de Orbital Elements

                # Path para o arquivo
                orb_path = pathlib.Path.joinpath(
                    pathlib.Path(self.path), self.orbital_elements["filename"]
                )

                # Verificar se o arquivo Orbital Elements existe
                if orb_path.exists():
                    # Arquivo Existe Verificar se está na validade usando da data de criação do arquivo
                    dt_creation = dt.fromtimestamp(orb_path.stat().st_mtime)

                    if not has_expired(dt_creation, days_to_expire):
                        # O Arquivo existe e esta na validade não será necessário um novo Download.
                        orb_ele = self.orbital_elements
                        orb_ele["downloaded_in_this_run"] = False
                        log.info(
                            "Pre-existing Orbital Elements is still valid and will be reused."
                        )

            if ignore:
                msg = "The download of orbital elements was skipped."
                orb_ele = {
                    "source": None,
                    "filename": "",
                    "size": 0,
                    "dw_start": None,
                    "dw_finish": None,
                    "dw_time": 0,
                    "downloaded_in_this_run": False,
                    "tp_start": None,
                    "tp_finish": None,
                }
                log.warning("%s" % (msg))
            else:
                if not orb_ele:
                    # Fazer um novo Download
                    # Tenta primeiro vindo do AstDys
                    orb_ele = aei.download_astdys_orbital_elements(force=True)

                    if not orb_ele:
                        # Tenta no MPC
                        orb_ele = aei.download_mpc_orbital_elements(force=True)

            if orb_ele:
                # Atualiza os dados
                self.orbital_elements = orb_ele

                return True
            else:
                msg = "Orbital Elements file was not created."
                self.orbital_elements = dict({"message": msg})

                log.warning("Asteroid [%s] %s" % (self.name, msg))

                return False

        except Exception as e:
            msg = "Failed in the Orbital Elements stage. Error: %s" % e

            self.orbital_elements = dict({"message": msg})
            log.error("Asteroid [%s] %s" % (self.name, msg))

            return False

        finally:
            # Atualiza o Json do Asteroid

            tp1 = dt.now(tz=timezone.utc)

            self.orbital_elements.update(
                {"tp_start": tp0.isoformat(), "tp_finish": tp1.isoformat()}
            )

            self.write_asteroid_json()

    def check_observations(self, days_to_expire=None, ignore=False):
        log = self.get_log()

        tp0 = dt.now(tz=timezone.utc)

        try:
            log.debug("Checking Observations")

            aei = AsteroidExternalInputs(
                name=self.name,
                number=self.number,
                asteroid_path=self.path,
                logname=self.__logname,
            )

            if days_to_expire is None:
                days_to_expire = aei.MPC_DAYS_TO_EXPIRE

            observations = {}

            # Verificar insformações sobre Observations no Json
            if self.observations and "filename" in self.observations:
                # Já existe Informações

                # Path para o arquivo
                obs_path = pathlib.Path.joinpath(
                    pathlib.Path(self.path), self.observations["filename"]
                )

                # Verificar se o arquivo Observations existe
                if obs_path.exists():
                    # Arquivo Existe Verificar se está na validade usando da data de criação do arquivo
                    dt_creation = dt.fromtimestamp(obs_path.stat().st_mtime)

                    if not has_expired(dt_creation, days_to_expire):
                        # O Arquivo existe e esta na validade não será necessário um novo Download.
                        observations = self.observations
                        observations["downloaded_in_this_run"] = False
                        log.info(
                            "Pre-existing Observations is still valid and will be reused."
                        )

            if ignore:
                msg = "The download of observations was skipped."
                observations = {
                    "source": None,
                    "filename": "",
                    "size": 0,
                    "dw_start": dt.now(),
                    "dw_finish": dt.now(),
                    "dw_time": 0,
                    "downloaded_in_this_run": False,
                }
                log.warning("%s" % (msg))
            else:
                if not observations:
                    # Fazer um novo Download
                    # Tenta primeiro vindo do AstDys
                    observations = aei.download_astdys_observations(force=True)

                    if not observations:
                        # Tenta no MPC
                        observations = aei.download_mpc_orbital_elements(force=True)

            if observations:
                # Atualiza os dados
                self.observations = observations

                return True
            else:
                msg = "Observations file was not created."
                self.observations = dict({"message": msg})

                log.warning("Asteroid [%s] %s" % (self.name, msg))

                return False

        except Exception as e:
            msg = "Failed in the Observations stage. Error: %s" % e

            self.observations = dict({"message": msg})
            log.error("Asteroid [%s] %s" % (self.name, msg))

            return False

        finally:
            # Atualiza o Json do Asteroid

            tp1 = dt.now(tz=timezone.utc)

            self.observations.update(
                {"tp_start": tp0.isoformat(), "tp_finish": tp1.isoformat()}
            )

            self.write_asteroid_json()

    def get_des_observations_path(self):
        filename = "{}.txt".format(self.alias)

        return pathlib.Path.joinpath(pathlib.Path(self.path), filename)

    def retrieve_des_observations(self, force=False):
        log = self.get_log()
        log.info("Retriving DES Observations started")

        fpath = self.get_des_observations_path()
        if fpath.exists() and force is True:
            fpath.unlink()

        t0 = dt.now(tz=timezone.utc)

        # TODO: Verificar primeiro se existe o arquivo de observações criado
        # Pela etapa Orbit Trace. ai evita a query no banco.

        # Se for a primeira vez ou o arquivo tiver expirado
        # Executa a query na tabela de observações.
        dao = ObservationDao()
        observations = dao.get_observations_by_name(self.name)
        del dao

        rows = ""
        rows_count = len(observations)
        for obs in observations:
            row = dict(
                {
                    "ra": ra2HMS(obs["ra"], 4).ljust(15),
                    "dec": dec2DMS(obs["dec"], 3).ljust(16),
                    "mag": "{:.3f}".format(obs["mag_psf"]).ljust(8),
                    "mjd": "{:.8f}".format(float(obs["date_jd"])).ljust(18),
                    "obs": "W84".ljust(5),
                    "cat": "V",
                }
            )

            rows += "{ra}{dec}{mag}{mjd}{obs}{cat}\n".format(**row)

        log.debug("Creating DES observations file.")
        with open(fpath, "w") as f:
            f.write(rows)

        t1 = dt.now(tz=timezone.utc)
        tdelta = t1 - t0

        if fpath.exists():
            log.info(
                "DES observations Count [%s] File. [%s]" % (rows_count, str(fpath))
            )

            return dict(
                {
                    "filename": fpath.name,
                    "size": fpath.stat().st_size,
                    "count": int(rows_count),
                    "start": t0.isoformat(),
                    "finish": t1.isoformat(),
                    "exec_time": tdelta.total_seconds(),
                    "generated_in_this_run": True,
                }
            )

        else:
            return None

    def check_des_observations(self, days_to_expire=90):
        log = self.get_log()

        tp0 = dt.now(tz=timezone.utc)

        try:
            log.info("Checking DES Observations")

            observations = {}
            # Verificar insformações sobre DES Observations no Json
            if self.des_observations and "filename" in self.des_observations:
                # Já existe Informações

                # Path para o arquivo
                obs_path = pathlib.Path.joinpath(
                    pathlib.Path(self.path), self.des_observations["filename"]
                )

                # Verificar se o arquivo DES Observations existe
                if obs_path.exists():
                    # Arquivo Existe Verificar se está na validade usando da data de criação do arquivo
                    dt_creation = dt.fromtimestamp(obs_path.stat().st_mtime)

                    if not has_expired(dt_creation, days_to_expire):
                        # O Arquivo existe e esta na validade não será necessário uma novo consulta.
                        observations = self.des_observations
                        observations["generated_in_this_run"] = False
                        log.info(
                            "Pre-existing DES Observations is still valid and will be reused."
                        )

            if not observations:
                # Fazer uma nova Consulta
                observations = self.retrieve_des_observations(force=True)

            if not observations:
                # Atualiza os dados
                self.des_observations = observations

                if self.des_observations["count"] > 0:
                    return True
                else:
                    return False

            else:
                msg = "DES Observations file was not created."
                self.des_observations = dict({"message": msg})
                # log.warning("Asteroid [%s] %s" % (self.name, msg))
                return False

        except Exception as e:
            msg = "Failed in the DES Observations stage. Error: %s" % e

            self.des_observations = dict({"message": msg})
            log.error("Asteroid [%s] %s" % (self.name, msg))

            return False

        finally:
            tp1 = dt.now(tz=timezone.utc)

            self.des_observations.update(
                {"tp_start": tp0.isoformat(), "tp_finish": tp1.isoformat()}
            )

            # Atualiza o Json do Asteroid
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
            self.des_observations = {}
            self.bsp_jpl = {}
            self.observations = {}
            self.orbital_elements = {}

        path = pathlib.Path(self.path)
        for f in path.iterdir():
            if f.name not in ignore_files:
                removed_files.append(f.name)
                log.debug(f"Removed: [{f.name}]")
                f.unlink()

        # Limpa os metadados das etapas de resultado
        self.refine_orbit = {}
        self.predict_occultation = {}
        self.ingest_occultations = {}

        # Atualiza o Json do Asteroid
        self.write_asteroid_json()

        t1 = dt.now(tz=timezone.utc)
        tdelta = t1 - t0

        # log.debug("Removed Files: [%s]" % ", ".join(removed_files))
        log.info("Removed [%s] files in %s" % (len(removed_files), tdelta))

    def register_occultations(self, start_period: str, end_period: str, jobid: int):
        log = self.get_log()
        t0 = dt.now(tz=timezone.utc)

        try:
            dao = OccultationDao(log=log)
            # Apaga as occultations já registradas para este asteroid antes de inserir.
            # IMPORTANTE! apaga mesmo que não tenham sido gerados resultados.
            dao.delete_by_asteroid_name_period(self.name, start_period, end_period)

            if "filename" not in self.predict_occultation:
                log.warning("There is no file with the predictions.")
                # Nao executou a etapa de predicao.
                return 0

            predict_table_path = pathlib.Path(
                self.path, self.predict_occultation["filename"]
            )

            if not predict_table_path.exists():
                # Arquivo com resultados da predicao nao foi criado
                return 0

            # Le o arquivo occultation table e cria um dataframe
            # occultation_date;ra_star_candidate;dec_star_candidate;ra_object;dec_object;ca;pa;vel;delta;g;j;h;k;long;loc_t;off_ra;off_de;pm;ct;f;e_ra;e_de;pmra;pmde
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
                    "obs_source",
                    "orb_ele_source",
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

            data = StringIO()
            df.to_csv(
                data,
                sep="|",
                header=True,
                index=False,
            )
            data.seek(0)

            # rowcount = dao.import_occultations(list(df.columns), data)
            rowcount = dao.import_occultations(data)

            del df
            del data
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

            if self.des_observations:
                if "message" in self.des_observations:
                    # self.messages.append(self.des_observations["message"])
                    # self.set_failure()
                    pass
                else:
                    a.update(
                        {
                            "des_obs": self.des_observations["count"],
                            "des_obs_start": self.des_observations["start"],
                            "des_obs_finish": self.des_observations["finish"],
                            "des_obs_exec_time": self.des_observations["exec_time"],
                            "des_obs_gen_run": self.des_observations.get(
                                "generated_in_this_run", False
                            ),
                            "des_obs_tp_start": self.des_observations["tp_start"],
                            "des_obs_tp_finish": self.des_observations["tp_finish"],
                        }
                    )

                    exec_time += float(self.des_observations["exec_time"])

            if self.bsp_jpl:
                if "message" in self.bsp_jpl:
                    self.messages.append(self.bsp_jpl["message"])
                    self.set_failure()
                else:
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

            if self.observations:
                if "message" in self.observations:
                    self.messages.append(self.observations["message"])
                    self.set_failure()
                else:
                    a.update(
                        {
                            "obs_source": self.observations["source"],
                            "obs_start": self.observations["dw_start"],
                            "obs_finish": self.observations["dw_finish"],
                            "obs_dw_time": self.observations["dw_time"],
                            "obs_dw_run": self.observations.get(
                                "downloaded_in_this_run", False
                            ),
                            "obs_tp_start": self.observations["tp_start"],
                            "obs_tp_finish": self.observations["tp_finish"],
                        }
                    )

                    exec_time += float(self.observations["dw_time"])

            if self.orbital_elements:
                if "message" in self.orbital_elements:
                    self.messages.append(self.orbital_elements["message"])
                    self.set_failure()
                else:
                    a.update(
                        {
                            "orb_ele_source": self.orbital_elements["source"],
                            "orb_ele_start": self.orbital_elements["dw_start"],
                            "orb_ele_finish": self.orbital_elements["dw_finish"],
                            "orb_ele_dw_time": self.orbital_elements["dw_time"],
                            "orb_ele_dw_run": self.orbital_elements.get(
                                "downloaded_in_this_run", False
                            ),
                            "orb_ele_tp_start": self.orbital_elements["tp_start"],
                            "orb_ele_tp_finish": self.orbital_elements["tp_finish"],
                        }
                    )

                    exec_time += float(self.orbital_elements["dw_time"])

            if self.refine_orbit:
                if "message" in self.refine_orbit:
                    # TODO: Temporariamente nao adicionar essa mensagem pois o nima esta fora do pipeline.
                    # self.messages.append(self.refine_orbit["message"])
                    pass
                else:
                    a.update(
                        {
                            "ref_orb_start": self.refine_orbit["start"],
                            "ref_orb_finish": self.refine_orbit["finish"],
                            "ref_orb_exec_time": self.refine_orbit["exec_time"],
                        }
                    )

                    exec_time += float(self.refine_orbit["exec_time"])

            if self.predict_occultation:
                if "message" in self.predict_occultation:
                    self.messages.append(self.predict_occultation["message"])
                    self.set_failure()
                else:
                    a.update(
                        {
                            "pre_occ_count": int(self.predict_occultation["count"]),
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

    def retrieve_ccds(self, leap_second):
        log = self.get_log()

        # Limpa o cache de resultados anteriores, esta etapa
        # Para esta etapa sempre será executada uma query nova.
        self.ot_query_ccds = {}

        tp0 = dt.now(tz=timezone.utc)

        try:
            # log.info("Retriving CCDs")

            dao = AsteroidDao()
            ccds = dao.ccds_by_asteroid(self.name)

            for ccd in ccds:
                # Correção no path dos ccds, para ficar igual ao ambiente do linea
                path = ccd["path"].replace("OPS/", "")
                path = path.replace("/red/immask", "/cat")
                filename = ccd["filename"].replace("immasked.fits", "red-fullcat.fits")
                # print(str(ccd["date_obs"].astimezone(timezone.utc)))
                ccd.update(
                    {
                        "date_obs": str(ccd["date_obs"].astimezone(timezone.utc)),
                        "date_jd": date_to_jd(
                            str(ccd["date_obs"].astimezone(timezone.utc)).strip(),
                            ccd["exptime"],
                            leap_second,
                        ),
                        "path": path,
                        "filename": filename,
                    }
                )

            self.ot_query_ccds.update({"count": len(ccds)})

            return ccds

        except Exception as e:
            msg = "Failed in the Retriving CCDs stage. Error: %s" % e

            self.ot_query_ccds = dict({"message": msg})
            log.error("Asteroid [%s] %s" % (self.name, msg))

        finally:
            # Atualiza o Json do Asteroid

            tp1 = dt.now(tz=timezone.utc)

            self.ot_query_ccds.update(
                {"tp_start": tp0.isoformat(), "tp_finish": tp1.isoformat()}
            )

            self.write_asteroid_json()

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
