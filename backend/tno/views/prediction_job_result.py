
import json
import os
import threading
import django_filters
from datetime import datetime, timedelta

import numpy as np
import pandas as pd
from tno.models import PredictionJobResult
from tno.serializers import PredictionJobResultSerializer
from django.core.paginator import Paginator
from rest_framework import mixins, viewsets
from rest_framework.decorators import action
from rest_framework.response import Response

class PredictionJobResultFilter(django_filters.FilterSet):
    job = django_filters.NumberFilter(field_name='job__id', lookup_expr='exact')
    status = django_filters.CharFilter(field_name='status', lookup_expr='exact')
    class Meta:
        model = PredictionJobResult
        fields = ['job', 'status']

class PredictionJobResultViewSet(
    viewsets.ReadOnlyModelViewSet
):
    
    queryset = PredictionJobResult.objects.all()
    serializer_class = PredictionJobResultSerializer
    filterset_class = PredictionJobResultFilter
    ordering_fields = ("name", "number", "des_obs", "exec_time", "pre_occ_count", "ing_occ_count")
    ordering = ("name",)
 

    