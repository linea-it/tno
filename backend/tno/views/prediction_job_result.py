
import json
import os
import threading
from datetime import datetime, timedelta

import numpy as np
import pandas as pd
from tno.models import PredictionJobResult
from tno.serializers import PredictionJobResultSerializer
from django.core.paginator import Paginator
from rest_framework import mixins, viewsets
from rest_framework.decorators import action
from rest_framework.response import Response


class PredictionJobResultViewSet(
    viewsets.ReadOnlyModelViewSet
):
    
    queryset = PredictionJobResult.objects.all()
    serializer_class = PredictionJobResultSerializer
    ordering_fields = ("name", "number", "des_obs", "exec_time", "pre_occ_count", "ing_occ_count")
    ordering = ("name",)
    
    def get_queryset(self):
        #filter job
        jobId = self.request.query_params.get('job', None)
        queryset = self.queryset
        if jobId:
            queryset = queryset.filter(job__id=jobId)  
        return queryset   

    