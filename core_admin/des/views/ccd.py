from rest_framework import viewsets
from rest_framework.decorators import action

from des.models import Ccd
from des.serializers import CcdSerializer


class CcdViewSet(viewsets.ModelViewSet):

    queryset = Ccd.objects.all()
    serializer_class = CcdSerializer
    filter_fields = ('id', 'exposure', 'filename')
    ordering_fields = ('id', 'exposure', 'ccdnum')
    ordering = ('ccdnum',)
    search_fields = ('filename', )    
