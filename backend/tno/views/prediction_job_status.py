from rest_framework import mixins, viewsets
from tno.models import PredictionJobStatus
from tno.serializers import PredictionJobStatusSerializer


class PredictionJobStatusViewSet(viewsets.ReadOnlyModelViewSet):
    queryset = PredictionJobResult.objects.all()
    serializer_class = PredictionJobStatusSerializer
    ordering_fields = ("job_id", "step")
    ordering = ("job_id", "step")
