import json
import os
import threading
from datetime import datetime, timedelta

import humanize
import numpy as np
import pandas as pd
from django.core.paginator import Paginator
from drf_spectacular.utils import extend_schema
from rest_framework import mixins, viewsets
from rest_framework.decorators import action
from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response
from tno.models import (
    BspPlanetary,
    Catalog,
    LeapSecond,
    PredictionJob,
    PredictionJobStatus,
)
from tno.serializers import PredictionJobSerializer, PredictionJobStatusSerializer


@extend_schema(exclude=True)
class PredictionJobViewSet(
    mixins.RetrieveModelMixin, mixins.ListModelMixin, viewsets.GenericViewSet
):
    permission_classes = [IsAuthenticated]
    swagger_schema = None
    queryset = PredictionJob.objects.all()
    serializer_class = PredictionJobSerializer
    ordering_fields = (
        "id",
        "status",
        "owner",
        "start",
        "exec_time",
        "count_asteroids",
        "count_asteroids_with_occ",
        "count_occ",
        "count_success",
        "count_failures",
        "avg_exec_time",
    )
    ordering = ("-start",)

    @action(detail=False, methods=["post"])
    def submit_job(self, request, pk=None):
        """
        Este endpoint apenas cria um novo registro na tabela Prediction Jobs.

        O Job é criado com status idle. uma daemon verifica
        de tempos em tempos os jobs neste status e inicia o processamento.

        Parameters:
            date_initial: (string):

            date_final: (string):

            filter_type (string):

            filter_value (string):

            predict_step (inteiro):

        Returns:
            job (PredictionJobSerializer): Job que acabou de ser criado.
        """
        params = request.data
        date_initial = params["date_initial"]
        date_final = params["date_final"]
        debug = params["debug"]

        # Recuperar o usuario que submeteu o Job.
        owner = self.request.user

        # Calcular o intervalo da predição
        predictions_start = datetime.strptime(date_initial, "%Y-%m-%d")
        predictions_end = datetime.strptime(date_final, "%Y-%m-%d")
        predictons_interval = predictions_start - predictions_end
        h_predict_interval = humanize.naturaldelta(predictons_interval)

        catalog = Catalog.objects.get(id=int(params["catalog"]))
        planetary_ephemeris = BspPlanetary.objects.get(
            id=int(params["planetary_ephemeris"])
        )
        leap_second = LeapSecond.objects.get(id=int(params["leap_second"]))
        # Criar um model Prediction Job
        job = PredictionJob(
            owner=owner,
            # Job começa com Status Idle.
            status=1,
            submit_time=datetime.now(),
            filter_type=params["filter_type"],
            filter_value=params["filter_value"],
            predict_start_date=date_initial,
            predict_end_date=date_final,
            predict_step=params["predict_step"],
            catalog=catalog,
            planetary_ephemeris=planetary_ephemeris,
            leap_second=leap_second,
            predict_interval=h_predict_interval,
            debug=debug,
        )
        job.save()

        result = PredictionJobSerializer(job)

        return Response(result.data)

    @action(detail=True, methods=["get"])
    def status(self, request, pk=None):

        job = self.get_object()
        queryset = job.predictionjobstatus_set.all().order_by("step")
        serializer = PredictionJobStatusSerializer(queryset, many=True)
        return Response(serializer.data)

    @action(detail=True, methods=["post"])
    def cancel_job(self, request, pk=None):
        """
        Sinaliza o pedido de cancelamento um Prediction job, alterando status para aborting
        """
        job = self.get_object()
        # Se o job estiver idle=1 ou running=2
        if job.status <= 2:
            # Marca o job como 7-Aborting
            job.status = 7
            job.save()

            # Alterar todas as tasks do job para aborting
            # 3-Queued
            tasks = job.predictionjobresult_set.filter(status=3)
            tasks.update(status=5)

            # Verificar se tem alguma task em execução
            # se não tiver altera o status direto para 5-Aborted
            tasks = job.predictionjobresult_set.filter(status=4)
            if len(tasks) == 0:
                job.status = 5
                job.save()
        result = PredictionJobSerializer(job)
        return Response(result.data)
