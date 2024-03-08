import django_filters
from drf_spectacular.utils import extend_schema
from rest_framework import viewsets
from rest_framework.permissions import IsAuthenticated
from tno.models import PredictionJobResult
from tno.serializers import PredictionJobResultSerializer


class PredictionJobResultFilter(django_filters.FilterSet):
    job = django_filters.NumberFilter(field_name="job__id", lookup_expr="exact")
    status = django_filters.CharFilter(field_name="status", lookup_expr="exact")

    class Meta:
        model = PredictionJobResult
        fields = ["job", "status"]


@extend_schema(exclude=True)
class PredictionJobResultViewSet(viewsets.ReadOnlyModelViewSet):
    permission_classes = [IsAuthenticated]
    swagger_schema = None
    queryset = PredictionJobResult.objects.all()
    serializer_class = PredictionJobResultSerializer
    filterset_class = PredictionJobResultFilter
    ordering_fields = (
        "name",
        "number",
        "base_dynclass",
        "occultations",
        "des_obs",
        "exec_time",
    )
    ordering = ("name",)
