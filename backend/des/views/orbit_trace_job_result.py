
import json
import os
import threading
from datetime import datetime, timedelta
import django_filters

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

class OrbitTraceJobResultFilter(django_filters.FilterSet):
    job = django_filters.NumberFilter(field_name='job__id', lookup_expr='exact')
    status = django_filters.CharFilter(field_name='status', lookup_expr='exact')
    class Meta:
        model = OrbitTraceJobResult
        fields = ['job', 'status']

class OrbitTraceJobResultViewSet(
    viewsets.ReadOnlyModelViewSet
):
    
    queryset = OrbitTraceJobResult.objects.all()
    serializer_class = OrbitTraceJobResultSerializer
    filterset_class = OrbitTraceJobResultFilter
    ordering_fields = ("name", "number", "base_dynclass", "dynclass", "observations", "ccds")
    ordering = ("name",)   


