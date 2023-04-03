
import json
import os
import threading
from datetime import datetime, timedelta

import numpy as np
import pandas as pd
from common.dates_interval import get_days_interval
from common.read_csv import csv_to_dataframe
from des.dao import CcdDao, DesSkybotJobResultDao, ExposureDao
from des.models import OrbitTraceJobResult
from des.serializers import OrbitTraceJobResultSerializer
from des.skybot.pipeline import DesSkybotPipeline
from des.summary import SummaryResult
from django.core.paginator import Paginator
from rest_framework import mixins, viewsets
from rest_framework.decorators import action
from rest_framework.response import Response


class OrbitTraceJobResultViewSet(
    mixins.RetrieveModelMixin, mixins.ListModelMixin, viewsets.GenericViewSet
):
    
    queryset = OrbitTraceJobResult.objects.all()
    serializer_class = OrbitTraceJobResultSerializer
    ordering_fields = ("id", "status")
    ordering = ("id",)

    def get_queryset(self):
        #filter job
        jobId = self.request.query_params.get('job', None)
        queryset = self.queryset
        if jobId:
            queryset = queryset.filter(job__id=jobId)  
        return queryset    


    