import django_filters
from des.models import OrbitTraceJobResult
from des.serializers import OrbitTraceJobResultSerializer
from drf_spectacular.utils import extend_schema
from rest_framework import viewsets
from rest_framework.permissions import IsAuthenticated


class OrbitTraceJobResultFilter(django_filters.FilterSet):
    job = django_filters.NumberFilter(field_name="job__id", lookup_expr="exact")
    status = django_filters.CharFilter(field_name="status", lookup_expr="exact")

    class Meta:
        model = OrbitTraceJobResult
        fields = ["job", "status"]


@extend_schema(exclude=True)
class OrbitTraceJobResultViewSet(viewsets.ReadOnlyModelViewSet):
    permission_classes = [IsAuthenticated]
    swagger_schema = None
    queryset = OrbitTraceJobResult.objects.all()
    serializer_class = OrbitTraceJobResultSerializer
    filterset_class = OrbitTraceJobResultFilter
    ordering_fields = (
        "name",
        "number",
        "base_dynclass",
        "dynclass",
        "observations",
        "ccds",
    )
    ordering = ("name",)
