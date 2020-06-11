from rest_framework import viewsets
from des.models import SkybotPosition
from des.serializers import SkybotPositionSerializer
from django_filters import rest_framework as filters
class DesSkybotPositionViewSet(viewsets.ModelViewSet):

    queryset = SkybotPosition.objects.select_related().all()
    serializer_class = SkybotPositionSerializer
    filter_fields = ('id', 'position', 'exposure', 'ccd', 'ticket',) 
    ordering_fields = ('id', )
    ordering = ('id',)