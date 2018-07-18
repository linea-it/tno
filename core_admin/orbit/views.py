from django.shortcuts import render
from rest_framework import viewsets
from .models import OrbitRun
from .serializers import OrbitRunSerializer


class OrbitRunViewSet(viewsets.ModelViewSet):
    queryset = OrbitRun.objects.all()
    serializer_class = OrbitRunSerializer
    filter_fields = ('id','owner', 'status',)
    search_fields = ('id',)
    ordering_fields = ('id', 'owner', 'status', 'start_time', 'finish_time')
    ordering = ('-start_time',)

    def perform_create(self, serializer):
        # Adiconar usuario logado
        if not self.request.user.pk:
            raise Exception('It is necessary an active login to perform this operation.')
        serializer.save(owner=self.request.user)

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