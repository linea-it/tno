from rest_framework import viewsets
from des.models import SkybotPosition
from des.serializers import SkybotPositionSerializer
from django_filters import rest_framework as filters


class PositionFilter(filters.FilterSet):
    ticket = filters.NumberFilter(field_name='position__ticket')

    class Meta:
        model = SkybotPosition
        fields = ['id', 'position', 'exposure', 'ccd', 'ticket']

class DesSkybotPositionViewSet(viewsets.ModelViewSet):

    queryset = SkybotPosition.objects.select_related().all()
    serializer_class = SkybotPositionSerializer
    filter_backends = (filters.DjangoFilterBackend,)
    filterset_class = PositionFilter    
    # ordering_fields = ('exposure', )
    # ordering = ('exposure',)