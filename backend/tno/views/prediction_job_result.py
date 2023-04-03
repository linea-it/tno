
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
    ordering_fields = ("id",)

    