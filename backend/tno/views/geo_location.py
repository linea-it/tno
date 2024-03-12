import hashlib
import json
import logging
from pathlib import Path

from django.conf import settings
from rest_framework.response import Response


class GeoLocation:

    def __init__(self, params: dict, queryset) -> None:

        self.params = params
        self.queryset = queryset

        self.log = logging.getLogger("predict_events")

        # Criar um hash para a requisição baseado nos parametros
        self.request_hash = self.create_request_hash(params)
        self.log.info(f"Request Hash: [{self.request_hash}]")

    def create_async_job(self):
        self.log.info("Create async job for check visibility for each candidates")

        job = {
            "job_id": self.request_hash,
            "count": 0,
            "results": [],
            "candidates": self.queryset.count(),
            "pageParam": self.params.get("pageParam", 1),
            "next": None,
            "previous": None,
        }
        self.log.info(f"Filepath: {self.get_file_path(self.request_hash)}")
        with open(self.get_file_path(self.request_hash), "w") as fp:
            json.dump(job, fp)

    def read_async_job_results(self) -> dict:
        self.log.info("Read job file and return results")

        with open(self.get_file_path(self.request_hash)) as fp:
            job = json.load(fp)
            self.log.debug(job)

            return job

    def execute(self):
        # Verificar se já existe dados para este hash
        if self.file_exists(self.request_hash):
            self.log.info("Arquivo já existe abrir e ler o conteudo e retornar")
            self.read_async_job_results()
        else:
            self.log.info("Arquivo nao existe submeter as tasks em background")
            self.create_async_job()

        return Response(self.read_async_job_results())

    def get_file_path(self, request_hash) -> Path:
        temp_path = Path(settings.DATA_TMP_DIR)
        return temp_path.joinpath(f"{request_hash}.json")

    def file_exists(self, request_hash) -> bool:
        return self.get_file_path(request_hash).exists()

    def create_request_hash(self, params: dict):
        # remove alguns parametros que são indiferentes para query por posição
        del params["page"]
        del params["pageSize"]
        del params["ordering"]

        s_params = json.dumps(params, sort_keys=True)
        # self.log.debug(s_params)
        return hashlib.md5(s_params.encode()).hexdigest()
