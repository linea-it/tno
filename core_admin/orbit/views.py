from django.shortcuts import render
from rest_framework import viewsets
from .models import OrbitRun, RefinedAsteroid, RefinedOrbit
from .serializers import OrbitRunSerializer, RefinedAsteroidSerializer, RefinedOrbitSerializer
from rest_framework.decorators import list_route
from rest_framework.response import Response
from django.core.exceptions import ObjectDoesNotExist
import os


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

    @list_route()
    def get_log(self, request):
        id = request.query_params.get('asteroid_id', None)

        log_path = None

        asteroid = None

        if id is not None:

            try:
                asteroid = RefinedAsteroid.objects.get(id=int(id))

            except ObjectDoesNotExist:
                return Response({
                    'success': False,
                    'msg': "Asteroid with id %s Not Found." % id,
                })

        else:
            name = request.query_params.get('name', None)
            run = request.query_params.get('orbit_run', None)

            try:
                asteroid = RefinedAsteroid.objects.get(name=str(name), orbit_run=int(run))
            except ObjectDoesNotExist:
                return Response({
                    'success': False,
                    'msg': "Asteroid with name %s and Orbit Run %s Not Found." % (name, run),
                })

        log_path = os.path.join(asteroid.relative_path, 'nima.log')
        if not os.path.exists(log_path):
            return Response({
                'success': False,
                'msg': "There is no log for asteroid %s." % asteroid.name,
            })

        try:
            new_lines = list()
            with open(log_path, 'r') as fp:
                lines = fp.readlines()
                for line in lines:
                    new_lines.append(line.strip())

                return Response(dict({
                    "success": True,
                    "lines": new_lines
                }))

        except Exception as e:
            return Response(dict({
                'success': False,
                'msg': 'Failed to read asteroid %s log' % asteroid.name
            }))


class RefinedOrbitViewSet(viewsets.ModelViewSet):
    queryset = RefinedOrbit.objects.all()
    serializer_class = RefinedOrbitSerializer
    filter_fields = ('id', 'filename', 'asteroid')
    search_fields = ('id', 'filename')
    ordering = ('filename', 'file_type')