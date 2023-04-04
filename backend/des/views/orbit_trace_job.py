
import json
import os
import threading
from datetime import datetime, timedelta

import numpy as np
import pandas as pd
from common.dates_interval import get_days_interval
from common.read_csv import csv_to_dataframe
from des.dao import CcdDao, DesSkybotJobResultDao, ExposureDao
from des.models import OrbitTraceJob
from des.serializers import OrbitTraceJobSerializer
from des.skybot.pipeline import DesSkybotPipeline
from des.summary import SummaryResult
from django.core.paginator import Paginator
from rest_framework import mixins, viewsets
from rest_framework.decorators import action
from rest_framework.response import Response
from tno.models import BspPlanetary, LeapSecond


class OrbitTraceJobViewSet(
    mixins.RetrieveModelMixin, mixins.ListModelMixin, viewsets.GenericViewSet
):
    """
    Este end point esta com os metodos de Create, Update, Delete desabilitados.
    estas operações vão ficar na responsabilidades do pipeline des/skybot.

    o Endpoint submit_job é responsavel por iniciar o pipeline que será executado em background.
    """

    queryset = OrbitTraceJob.objects.all()
    serializer_class = OrbitTraceJobSerializer
    ordering_fields = ("id", "status", "start", "end", "exec_time", "count_asteroids", "count_ccds", "count_observations", "count_success", "count_failures")
    ordering = ("-start",)

    # def estimate_execution_time(self, to_execute):

    #     dao = DesSkybotJobResultDao(pool=False)

    #     se = dao.skybot_estimate()

    #     try:
    #         average_time = se["t_exec_time"] / int(se["total"])
    #         estimated_time = (int(to_execute) * average_time).total_seconds()

    #     except:
    #         estimated_time = 0

    #     return estimated_time

    @action(detail=False, methods=["post"])
    def submit_job(self, request, pk=None):
        """
        Este endpoint apenas cria um novo registro na tabela Des/Orbit Trace Jobs.

        O Job é criado com status idle. uma daemon verifica
        de tempos em tempos os jobs neste status e inicia o processamento.

        Parameters:
            bsp_planetary (string): .

            leap_second (string): .

        Returns:
            job (OrbitTraceJobSerializer): Job que acabou de ser criado.
        """
        params = request.data

        # Recuperar o usuario que submeteu o Job.
        owner = self.request.user

        # # adicionar a hora inicial e final as datas
        # start = datetime.strptime(date_initial, "%Y-%m-%d").strftime("%Y-%m-%d 00:00:00")

        # end = datetime.strptime(date_final, "%Y-%m-%d").strftime("%Y-%m-%d 23:59:59")

        bsp_planetary = BspPlanetary.objects.get(name=params["bsp_planetary"].replace("\'", "\""))
        leap_seconds = LeapSecond.objects.get(name=params["leap_second"].replace("\'", "\""))

        # Estimativa de tempo baseada na qtd de exposures a serem executadas.
        #estimated_time = self.estimate_execution_time(t_exposures)

        # Criar um model Orbit Trace Job
        job = OrbitTraceJob(
            owner=owner,
            submit_time=datetime.now(),
            bsp_planetary=bsp_planetary,
            leap_seconds=leap_seconds,
            filter_type=params["filter_type"].replace("\'", "\""),
            filter_value=params["filter_value"].replace("\'", "\""),
            debug=bool(params["debug"].replace("\'", "\"")),
            bps_days_to_expire=params["bps_days_to_expire"].replace("\'", "\""),
            parsl_init_blocks=params["parsl_init_blocks"].replace("\'", "\""),
            # Job começa com Status Idle.
            status=1,
            # Tempo de execução estimado
            estimated_execution_time=timedelta(seconds=0),
        )
        job.save()

        result = OrbitTraceJobSerializer(job)

        return Response(result.data)

    @action(detail=True, methods=["get"])
    def status(self, request, pk=None):
        """
        #     Este endpoint obtem o status de um job.

        #     Parameters:
        #         pk (int): id do job.

        #     Returns:
        #         result (string): status do job.
        #     """
        job = OrbitTraceJob.objects.get(id=pk) if OrbitTraceJob.objects.filter(id=pk).exists() else None
        if job is not None:
            return Response(job.get_status_display())
        else:
            return Response("job not found")

    @action(detail=True, methods=["post"])
    def cancel_job(self, request, pk=None):
        """
        Sinaliza o pediio de cancelamento um Orbit Trace job, alterando status para aborting
        """
        job = self.get_object()
        # Se o job estiver idle=1 ou running=2
        if job.status <= 2:
            job.status = 7
            job.save()
        result = OrbitTraceJobSerializer(job)
        return Response(result.data)

    