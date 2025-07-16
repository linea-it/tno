import json
import os
import threading
from datetime import datetime, timedelta

import humanize
import numpy as np
import pandas as pd
from django.core.paginator import Paginator
from django.db.models import Count
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

        stages = []

        job = self.get_object()

        # Step 1 Submit tasks
        # ----------------------------------------------------
        # Total de asteroides que o job vai processar.
        total_asteroids = job.count_asteroids

        # Total de tasks submetidas.
        submited_tasks = job.predictionjobresult_set.count()

        # Status da etapa
        # Status da etapa
        # 3 = completed
        # 2 = running
        stage1_status = 3 if submited_tasks == total_asteroids else 2

        stages.append(
            {
                "step": 1,
                "task": "Data acquisition and preparation",
                "status": stage1_status,
                "count": total_asteroids,
                "current": submited_tasks,
                "average_time": 0.0,  # TODO: Implementar média de tempo
                "time_estimate": 0.0,  # TODO: Implementar estimativa de tempo
                # "success": job.count_success,
                # "failures": job.count_failures,
                "updated": datetime.now().isoformat(),
            }
        )

        # Update job progress stage 2 - Running tasks
        # ----------------------------------------------------
        # tasks with status: 1 - Success, 2 - Failed, 5 - Aborted
        completed_tasks = job.predictionjobresult_set.filter(
            status__in=[1, 2, 5]
        ).count()

        success_tasks = job.predictionjobresult_set.filter(status=1).count()
        failed_tasks = job.predictionjobresult_set.filter(status=2).count()

        stage2_status = 3 if completed_tasks == submited_tasks else 2

        # Calculate average execution time for all completed succesfull tasks
        # Tasks with status 1 - Success
        completed_tasks_exec_time = job.predictionjobresult_set.filter(
            status__in=[1]
        ).values_list("exec_time", flat=True)

        avg_exec_time = (
            np.mean(completed_tasks_exec_time) if completed_tasks_exec_time else 0
        )
        avg_exec_time = (
            avg_exec_time.total_seconds()
            if isinstance(avg_exec_time, timedelta)
            else avg_exec_time
        )

        # Calculate estimated time for all incompleted tasks
        incompleted_tasks = job.predictionjobresult_set.filter(
            status__in=[1, 2, 5]
        ).count()

        time_estimate = 0.0
        if incompleted_tasks > 0:
            time_estimate = avg_exec_time * (submited_tasks - completed_tasks)

        stages.append(
            {
                "step": 2,
                "task": "Predict Occultation",
                "status": stage2_status,
                "count": submited_tasks,
                "current": completed_tasks,
                "average_time": avg_exec_time,
                "time_estimate": time_estimate,
                "success": success_tasks,
                "failures": failed_tasks,
                "updated": datetime.now().isoformat(),
            }
        )

        # count grouped tasks by status
        tasks_status_count = job.predictionjobresult_set.values("status").annotate(
            count=Count("status")
        )

        task_status_template = {
            1: {"status": 1, "label": "Success", "count": 0, "color": "success"},
            2: {"status": 2, "label": "Failed", "count": 0, "color": "error"},
            3: {"status": 3, "label": "Queued", "count": 0},
            4: {"status": 4, "label": "Running", "count": 0, "color": "primary"},
            5: {"status": 5, "label": "Aborted", "count": 0, "color": "secondary"},
            6: {"status": 6, "label": "Ingesting", "count": 0, "color": "primary"},
        }

        tasks_status = []
        for task in tasks_status_count:
            status = task_status_template.get(task["status"])
            status["count"] = task["count"]
            tasks_status.append(status)

        result = {
            "job_id": job.id,
            "asteroids": total_asteroids,
            "tasks_status": tasks_status,
            "progress": stages,
            "updated": datetime.now().isoformat(),
        }
        return Response(result)

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
