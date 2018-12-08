from django.shortcuts import render
from rest_framework import viewsets
from rest_framework.decorators import list_route
from .models import *
from .serializers import *
from django.core.exceptions import ObjectDoesNotExist
from rest_framework.response import Response
from django.conf import settings
import os
class PredictRunViewSet(viewsets.ModelViewSet):
    queryset = PredictRun.objects.all()
    serializer_class = PredictRunSerializer
    filter_fields = ('id', 'owner', 'status',)
    search_fields = ('id',)
    ordering_fields = ('id', 'owner', 'status', 'start_time', 'finish_time')
    ordering = ('-start_time',)

    def perform_create(self, serializer):
        # Adiconar usuario logado
        if not self.request.user.pk:
            raise Exception('It is necessary an active login to perform this operation.')
        serializer.save(owner=self.request.user)


class PredictAsteroidViewSet(viewsets.ModelViewSet):
    queryset = PredictAsteroid.objects.all()
    serializer_class = PredictAsteroidSerializer
    filter_fields = ('id', 'predict_run', 'name', 'number', 'status')
    search_fields = ('id', 'name', 'number',)
    ordering = ('name',)

    @list_route()
    def catalog_positions(self, request):
        asteroid_id = request.query_params.get('asteroid', None)

        if asteroid_id is None:
            return Response({
                'success': False,
                'msg': "asteroid parameter is required",
            })
        try:
            data = []

            asteroid = PredictAsteroid.objects.get(pk=int(asteroid_id))
            
            input_position = asteroid.input_file.filter(input_type='positions').first()

            if input_position is None or not os.path.exists(input_position.file_path):
                return Response({
                    'success': False,
                    'msg': "File not found",
                })                

            data = self.read_positions(input_position.file_path)


            return Response({
                'success': True,
                'results': data,
                'count': len(data)
            })

        except ObjectDoesNotExist:
            return Response({
                'success': False,
                'msg': "Record not found",
            })

    def read_positions(self, filename):
        positions = []

        with open(filename, 'r') as fp:
            for line in fp:
                try:
                    line.strip()
                    a = line.split()
                    ra = float(a[0].strip())
                    dec = float(a[1].strip())
                    positions.append([ra, dec])
                except Exception as e:
                    raise e

        return positions

    @list_route()
    def catalog_stars(self, request):
        asteroid_id = request.query_params.get('asteroid', None)

        if asteroid_id is None:
            return Response({
                'success': False,
                'msg': "asteroid parameter is required",
            })
        try:
            data = []

            asteroid = PredictAsteroid.objects.get(pk=int(asteroid_id))
            
            catalog = asteroid.predict_result.filter(type='catalog_csv').first()

            if catalog is None or not os.path.exists(catalog.file_path):
                return Response({
                    'success': False,
                    'msg': "File not found",
                })                

            data = []
            with open(catalog.file_path, 'r') as fp:
                lines = fp.readlines()
                for line in lines:
                    data.append(line.strip().split(";"))


            return Response({
                'success': True,
                'results': data,
                'count': len(data)
            })

        except ObjectDoesNotExist:
            return Response({
                'success': False,
                'msg': "Record not found",
            })

    @list_route()
    def get_neighbors(self, request):
        id = request.query_params.get('asteroid_id', None)

        if id is None:
            return Response({
                'success': False,
                'msg': "Asteroid with id %s Not Found." % id,
            })

        try:
            asteroid = PredictAsteroid.objects.get(id=int(id))

        except ObjectDoesNotExist:
            return Response({
                'success': False,
                'msg': "Asteroid with id %s Not Found." % id,
            })

        next = None
        try:
            next_model = PredictAsteroid.objects.filter(orbit_run=asteroid.predict_run).exclude(status='failure').filter(              
                id__gt=asteroid.id).order_by('id').first()

            next = next_model.id
        except:
            pass

        prev = None
        try:
            prev_model = PredictAsteroid.objects.filter(orbit_run=asteroid.predict_run).exclude(status='failure').filter(
                id__lt=asteroid.id).order_by('-id').first()
                
            prev = prev_model.id
        except:
            pass

        return Response(dict({
            "success": True,
            "prev": prev,
            "next": next
        })) 

class PredictInputViewSet(viewsets.ModelViewSet):
    queryset = PredictInput.objects.all()
    serializer_class = PredictInputSerializer
    filter_fields = ('id', 'asteroid', 'input_type', 'filename',)
    search_fields = ('id', 'input_type', 'filename',)
    ordering = ('filename',)

class PredictOutputViewSet(viewsets.ModelViewSet):
    queryset = PredictOutput.objects.all()
    serializer_class = PredictOutputSerializer
    filter_fields = ('id', 'asteroid', 'type', 'filename',)
    search_fields = ('id', 'type', 'filename',)
    ordering = ('filename',)

class OccultationViewSet(viewsets.ModelViewSet):
    queryset = Occultation.objects.all()
    serializer_class = OccultationSerializer
    filter_fields = ('id', 'asteroid', 'date_time', )
    search_fields = ('id', 'asteroid', 'date_time',)
    ordering_fields = ('date_time', )
    ordering = ('date_time',)


class LeapSecondsViewSet(viewsets.ModelViewSet):
    queryset = LeapSecond.objects.all()
    serializer_class =  LeapSecondsSerializer
    filter_fields = ('name', 'display_name', 'url', 'upload')
    search_fields = ('name')
    ordering = ('name',)

class BspPlanetaryViewSet(viewsets.ModelViewSet):
    queryset = BspPlanetary.objects.all()
    serializer_class =  BspPlanetarySerializer
    filter_fields = ('name', 'display_name', 'url', 'upload')
    search_fields = ('name')
    ordering = ('name',)

