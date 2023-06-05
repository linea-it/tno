
import json
import os
import threading
from datetime import datetime, timedelta
import humanize
import numpy as np
import pandas as pd
from tno.models import PredictionJob, Catalog, PredictionJobStatus
from tno.serializers import PredictionJobSerializer, PredictionJobStatusSerializer
from django.core.paginator import Paginator
from rest_framework import mixins, viewsets
from rest_framework.decorators import action
from rest_framework.response import Response


class PredictionJobViewSet(
    mixins.RetrieveModelMixin, mixins.ListModelMixin, viewsets.GenericViewSet
):
    
    queryset = PredictionJob.objects.all()
    serializer_class = PredictionJobSerializer
    ordering_fields = ("id", "status", "owner", "start", "exec_time")
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

        # Recuperar o usuario que submeteu o Job.
        owner = self.request.user

        # Calcular o intervalo da predição
        predictions_start = datetime.strptime(date_initial, "%Y-%m-%d")
        predictions_end = datetime.strptime(date_final, "%Y-%m-%d")
        predictons_interval = predictions_start - predictions_end
        h_predict_interval = humanize.naturaldelta(predictons_interval)
        
        # TODO: Investigar por que recebeu os parametros como string ao inves de json. 
        # Não seria necessário remover as aspas. 
        catalog = Catalog.objects.get(name=params["catalog"].replace("\'", "\""))
        # Criar um model Prediction Job
        job = PredictionJob(
            owner=owner,
            # Job começa com Status Idle.
            status=1,
            submit_time=datetime.now(),
            filter_type=params["filter_type"].replace("\'", "\""),
            filter_value=params["filter_value"].replace("\'", "\""),
            predict_start_date=date_initial,
            predict_end_date=date_final,
            predict_step=params["predict_step"].replace("\'", "\""),
            catalog=catalog,
            predict_interval=h_predict_interval
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
        Sinaliza o pediio de cancelamento um Prediction job, alterando status para aborting
        """
        job = self.get_object()
        # Se o job estiver idle=1 ou running=2
        if job.status <= 2:
            job.status = 7
            job.save()
        result = PredictionJobSerializer(job)
        return Response(result.data)

    