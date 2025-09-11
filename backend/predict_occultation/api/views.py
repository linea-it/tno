
from rest_framework.viewsets import ModelViewSet
from rest_framework.decorators import action
from rest_framework.response import Response
from rest_framework import status
from django.db.models import Count
from predict_occultation.models import PredictionTask
from predict_occultation.models import PredictionAttempt

from predict_occultation.api.serializers import PredictionTaskSerializer
from predict_occultation.api.serializers import PredictionTaskDetailSerializer
from predict_occultation.api.serializers import PredictionAttemptSerializer

class PredictionTaskViewSet(ModelViewSet):
    serializer_class = PredictionTaskSerializer
    queryset = PredictionTask.objects.all()
    filterset_fields = ["id", "asteroid_id", "state", "slurm_job_id", "aborted"]
    search_fields = ["id", "asteroid_id",]
    ordering_fields = ["created_at", "updated_at", "priority", "state"]
    ordering = ["-created_at", "priority"] 

    def get_serializer_class(self):
        if self.action == 'retrieve':
            return PredictionTaskDetailSerializer
        return PredictionTaskSerializer

    @action(detail=True, methods=["get"])
    def attempts(self, request, pk=None):
        task = self.get_object()
        attempts = task.attempts.all()
        serializer = PredictionAttemptSerializer(attempts, many=True)
        return Response(serializer.data, status=status.HTTP_200_OK)

    @action(detail=False, methods=["get"])
    def group_by_state(self, request):
        queryset = self.get_queryset()
        grouped_data = queryset.values('state').annotate(count=Count('state')).order_by('state')
        return Response(grouped_data, status=status.HTTP_200_OK)

class PredictionAttemptViewSet(ModelViewSet):
    serializer_class = PredictionAttemptSerializer
    queryset = PredictionAttempt.objects.all()