from django.shortcuts import render
from rest_framework import viewsets
from .models import OrbitRun, RefinedAsteroid, RefinedOrbit
from .serializers import OrbitRunSerializer, RefinedAsteroidSerializer, RefinedOrbitSerializer


class OrbitRunViewSet(viewsets.ModelViewSet):
    queryset = OrbitRun.objects.all()
    serializer_class = OrbitRunSerializer
    filter_fields = ('id', 'owner', 'status',)
    search_fields = ('id',)
    ordering_fields = ('id', 'owner', 'status', 'start_time', 'finish_time')
    ordering = ('-start_time',)

    def perform_create(self, serializer):
        # Adiconar usuario logado
        if not self.request.user.pk:
            raise Exception('It is necessary an active login to perform this operation.')
        serializer.save(owner=self.request.user)


class RefinedAsteroidViewSet(viewsets.ModelViewSet):
    queryset = RefinedAsteroid.objects.all()
    serializer_class = RefinedAsteroidSerializer
    filter_fields = ('id', 'orbit_run', 'name', 'number', 'status')
    search_fields = ('id', 'name', 'number',)


class RefinedOrbitViewSet(viewsets.ModelViewSet):
    queryset = RefinedOrbit.objects.all()
    serializer_class = RefinedOrbitSerializer
    filter_fields = ('id', 'filename')
    search_fields = ('id', 'filename')


    # class ObservationViewSet(viewsets.ModelViewSet):
    #     queryset = Observation.objects.all()
    #     serializer_class = ObservationSerializer
    #     filter_fields = ('id', 'name', 'source', 'observations')
    #     search_fields = ('id', 'name', 'filename',)
    #
    # class OrbitalParameterViewSet(viewsets.ModelViewSet):
    #     queryset = Observation.objects.all()
    #     serializer_class = ObservationSerializer
    #     filter_fields = ('id', 'name', 'source', 'observations')
    #     search_fields = ('id', 'name', 'filename',)
