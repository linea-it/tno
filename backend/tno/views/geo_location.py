import hashlib
import json
import logging
from pathlib import Path

from celery import group
from django.conf import settings
from rest_framework.response import Response
from tno.occviz import visibility_from_coeff
from tno.tasks import assync_visibility_from_coeff


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

        # Add Limit to queryset
        # queryset = self.queryset.filter(id__in=[1167340, 1128316, 963963, 845826])
        queryset = self.queryset[0:1000]

        job = {
            "job_id": self.request_hash,
            "count": 0,
            "results": [],
            "candidates": queryset.count(),
            "pageParam": self.params.get("pageParam", 1),
            "next": None,
            "previous": None,
        }
        self.log.info(f"Filepath: {self.get_file_path(self.request_hash)}")
        self.write_async_job_results(job)

        self.apply_visibility(
            queryset,
            float(self.params["lat"]),
            float(self.params["long"]),
            float(self.params["radius"]),
        )

    def apply_visibility(self, queryset, lat: float, long: float, radius: float):
        self.log.info(f"Applying the visibility function to each result")
        self.log.debug(f"Latitude: {lat} Longitude: {long} Radius: {radius}")

        # job = group(
        #     assync_visibility_from_coeff.s(
        #         event_id=event.id,
        #         result_file=str(self.get_file_path(self.request_hash)),
        #         latitude=lat,
        #         longitude=long,
        #         radius=radius,
        #         date_time=event.date_time.isoformat(),
        #         inputdict=event.occ_path_coeff,
        #         object_diameter=event.diameter,
        #         # ring_diameter=event.diameter,
        #         # n_elements= 1500,
        #         # ignore_nighttime= False,
        #         # latitudinal= False
        #     )
        #     for event in queryset
        # )
        # job.apply_async()

        wanted_ids = []
        count = 0
        processed = 0
        for event in queryset:
            is_visible, info = visibility_from_coeff(
                latitude=lat,
                longitude=long,
                radius=radius,
                date_time=event.date_time,
                inputdict=event.occ_path_coeff,
                # object_diameter=event.diameter,
                # ring_diameter=event.diameter,
                # n_elements= 1500,
                # ignore_nighttime= False,
                # latitudinal= False
            )
            processed += 1

            if is_visible:
                wanted_ids.append(event.id)
                count += 1

                self.log.info(
                    f"Event: [{event.id}] - IS VISIBLE: [{is_visible}] - {event.date_time} - {event.name}"
                )
                self.update_async_job_results(event.id)

    def update_async_job_results(self, event_id: int):
        job = self.read_async_job_results()
        job["results"].append(event_id)
        self.write_async_job_results(job)

    def read_async_job_results(self) -> dict:
        with open(self.get_file_path(self.request_hash)) as fp:
            job = json.load(fp)
            return job

    def write_async_job_results(self, job):
        with open(self.get_file_path(self.request_hash), "w") as fp:
            json.dump(job, fp)

    def filter_queryset_by_visibility(self):
        self.log.info("Arquivo já existe abrir e ler o conteudo e retornar")
        job = self.read_async_job_results()

        queryset = self.queryset.filter(id__in=job["results"])
        self.log.info(f"Results after visibility function: [{queryset.count()}]")
        self.log.debug(queryset.query)
        return queryset

    def execute(self):
        # Verificar se já existe dados para este hash
        if not self.file_exists(self.request_hash):
            self.log.info("Arquivo nao existe submeter as tasks em background")
            self.create_async_job()

        queryset = self.filter_queryset_by_visibility()

        self.log.info("Read job file and return results")

        return queryset

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
