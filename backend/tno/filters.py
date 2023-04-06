import django_filters
from des.models import OrbitTraceJobResult
from tno.models import Occultation, PredictionJobResult


class CharInFilter(django_filters.BaseInFilter, django_filters.CharFilter):
    pass

class OccultationFilter(django_filters.FilterSet):
    start_date = django_filters.DateTimeFilter(field_name='date_time',lookup_expr='gte')
    end_date = django_filters.DateTimeFilter(field_name='date_time',lookup_expr='lte')
    dynclass = django_filters.CharFilter(field_name='asteroid__dynclass', lookup_expr='iexact')
    base_dynclass = django_filters.CharFilter(field_name='asteroid__base_dynclass', lookup_expr='iexact')
    name = CharInFilter(field_name='asteroid__name', lookup_expr='in')
    class Meta:
        model = Occultation
        fields = ['start_date','end_date', 'dynclass', 'base_dynclass', 'name']

class OrbitTraceJobResultFilter(django_filters.FilterSet):
    job = django_filters.NumberFilter(field_name='job__id', lookup_expr='exact')
    class Meta:
        model = OrbitTraceJobResult
        fields = ['job']

class PredictionJobResultFilter(django_filters.FilterSet):
    job = django_filters.NumberFilter(field_name='job__id', lookup_expr='exact')
    class Meta:
        model = PredictionJobResult
        fields = ['job']

