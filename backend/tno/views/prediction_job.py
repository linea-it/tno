
import json
import os
import threading
from datetime import datetime, timedelta

import numpy as np
import pandas as pd
from tno.models import PredictionJob, Catalog
from tno.serializers import PredictionJobSerializer
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

        # # # adicionar a hora inicial e final as datas
        # predictions_start = datetime.strptime(date_initial, "%Y-%m-%d").strftime("%Y-%m-%d 00:00:00")

        # predictions_end = datetime.strptime(date_final, "%Y-%m-%d").strftime("%Y-%m-%d 23:59:59")
        
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
        )
        job.save()

        result = PredictionJobSerializer(job)

        return Response(result.data)

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

    