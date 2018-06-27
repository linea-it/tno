from django.shortcuts import render

from rest_framework import viewsets 

from .models import Run, Configuration

from .serializers import RunSerializer, ConfigurationSerializer

class PraiaRunViewSet(viewsets.ModelViewSet):
    queryset = Run.objects.all()
    serializer_class = RunSerializer
    filter_fields = ('id','owner', 'status',)
    search_fields = ('id',)
    ordering_fields = ('id', 'owner', 'status', 'start_time', 'finish_time')
    ordering = ('-start_time',)    

    def perform_create(self, serializer):
        # Adiconar usuario logado
        if not self.request.user.pk:
            raise Exception('It is necessary an active login to perform this operation.')
        serializer.save(owner=self.request.user)


class PraiaConfigurationViewSet(viewsets.ModelViewSet):
    queryset = Configuration.objects.all()
    serializer_class = ConfigurationSerializer
    filter_fields = ('id','displayname',)
    search_fields = ('id','displayname',)
    ordering_fields = ('id', 'creation_date', 'displayname', 'owner')
    ordering = ('-creation_date',)  
    
    def perform_create(self, serializer):
        # Adiconar usuario logado
        if not self.request.user.pk:
            raise Exception('It is necessary an active login to perform this operation.')
        serializer.save(owner=self.request.user)