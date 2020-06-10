from rest_framework import viewsets
from des.models import SkybotPosition
from des.serializers import SkybotPositionSerializer


class DesSkybotPositionViewSet(viewsets.ModelViewSet):

    queryset = SkybotPosition.objects.select_related().all()
    serializer_class = SkybotPositionSerializer
    filter_fields = ('id', 'position', 'exposure', 'ccd')
    ordering_fields = ('exposue', )
    ordering = ('exposure',)