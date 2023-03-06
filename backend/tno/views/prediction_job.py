
import json
import os
import threading
from datetime import datetime, timedelta

import numpy as np
import pandas as pd
from tno.models import PredictionJob
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
    ordering_fields = ("id", "status")

    @action(detail=False, methods=["post"])
    def submit_job(self, request, pk=None):
        """
        Este endpoint apenas cria um novo registro na tabela Prediction Jobs.

        O Job é criado com status idle. uma daemon verifica
        de tempos em tempos os jobs neste status e inicia o processamento.

        Parameters:
            bsp_planetary (string): .

            leap_second (string): .

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
            force_refresh_input=params["force_refresh_input"].replace("\'", "\""),
            input_days_to_expire=params["input_days_to_expire"].replace("\'", "\""),
        )
        job.save()

        result = PredictionJobSerializer(job)

        return Response(result.data)

    