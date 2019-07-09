from django.shortcuts import render

from rest_framework import viewsets

from .models import Run, Configuration, AstrometryAsteroid, AstrometryInput, AstrometryOutput

from .serializers import RunSerializer, ConfigurationSerializer, AstrometryAsteroidSerializer, AstrometryInputSerializer, AstrometryOutputSerializer

from . import signals


class PraiaRunViewSet(viewsets.ModelViewSet):
    queryset = Run.objects.all()
    serializer_class = RunSerializer
    filter_fields = ('id', 'owner', 'status',)
    search_fields = ('id',)
    ordering_fields = ('id', 'owner', 'status', 'start_time', 'finish_time')
    ordering = ('-start_time',)

    def perform_create(self, serializer):
        # Adiconar usuario logado
        if not self.request.user.pk:
            raise Exception(
                'It is necessary an active login to perform this operation.')
        serializer.save(owner=self.request.user)


class PraiaConfigurationViewSet(viewsets.ModelViewSet):
    queryset = Configuration.objects.all()
    serializer_class = ConfigurationSerializer
    filter_fields = ('id', 'displayname',)
    search_fields = ('id', 'displayname',)
    ordering_fields = ('id', 'creation_date', 'displayname', 'owner')
    ordering = ('-creation_date',)

    def perform_create(self, serializer):
        # Adiconar usuario logado
        if not self.request.user.pk:
            raise Exception(
                'It is necessary an active login to perform this operation.')
        serializer.save(owner=self.request.user)


class AstrometryAsteroidViewSet(viewsets.ModelViewSet):
    queryset = AstrometryAsteroid.objects.all()
    serializer_class = AstrometryAsteroidSerializer
    search_fields = ('name', 'number',)
    filter_fields = ('id', 'astrometry_run', 'name', 'number', 'status',)
    ordering_fields = ('id', 'name', 'number',)
    ordering = ('name',)


class AstrometryInputViewSet(viewsets.ModelViewSet):
    queryset = AstrometryInput.objects.all()
    serializer_class = AstrometryInputSerializer
    search_fields = ('filename',)
    filter_fields = ('id', 'asteroid', 'filename',)
    ordering_fields = ('id', 'asteroid',)
    ordering = ('asteroid',)


class AstrometryOutputViewSet(viewsets.ModelViewSet):
    queryset = AstrometryOutput.objects.all()
    serializer_class = AstrometryOutputSerializer
    search_fields = ('filename',)
    filter_fields = ('id', 'asteroid', 'filename',)
    ordering_fields = ('id', 'asteroid',)
    ordering = ('asteroid',)
