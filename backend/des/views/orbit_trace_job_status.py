from des.models import OrbitTraceJobStatus
from des.serializers import OrbitTraceJobStatusSerializer
from rest_framework import viewsets


class OrbitTraceJobStatusViewSet(viewsets.ReadOnlyModelViewSet):
    queryset = PredictionJobResult.objects.all()
    serializer_class = OrbitTraceJobStatusSerializer
    ordering_fields = ("job_id", "step")
    ordering = ("job_id", "step")
