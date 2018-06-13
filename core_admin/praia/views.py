from django.shortcuts import render

from rest_framework import viewsets 

from .models import Run, Configuration

from .serializers import RunSerializer, ConfigurationSerializer

class PraiaRunViewSet(viewsets.ModelViewSet):
    queryset = Run.objects.all()
    serializer_class = RunSerializer
    filter_fields = ('id','owner', 'status',)
    search_fields = ('id',)


class PraiaConfigurationViewSet(viewsets.ModelViewSet):
    queryset = Configuration.objects.all()
    serializer_class = ConfigurationSerializer
    filter_fields = ('id','displayname',)
    search_fields = ('id','displayname',)
