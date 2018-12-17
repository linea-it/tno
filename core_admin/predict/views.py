from django.shortcuts import render
from rest_framework import viewsets
from rest_framework.decorators import list_route
from .models import *
from .serializers import *
from django.core.exceptions import ObjectDoesNotExist
from rest_framework.response import Response
from rest_framework.permissions import IsAuthenticatedOrReadOnly
from django.conf import settings
import os
from datetime import datetime, timedelta
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

    @list_route()
    def get_time_profile(self, request):

        run = request.query_params.get('id', None)
        if run is None:
            return Response({
                'success': False,
                'msg': "id parameter is required",
            })

        try:
            predict_run = PredictRun.objects.get(id=int(run))

            # Asteroids
            asteroids = predict_run.asteroids.order_by('start_ephemeris')


            # Ultimo objeto a executar a geracao de mapas
            a = predict_run.asteroids.order_by('finish_maps').last()
            end_maps = a.finish_maps

            # Ephemeris Start + End
            start_ephemeris = predict_run.asteroids.order_by('start_ephemeris').first().start_ephemeris
            end_ephemeris = predict_run.asteroids.order_by('finish_ephemeris').last().finish_ephemeris

            # Catalog Start + End
            start_catalog = predict_run.asteroids.order_by('start_catalog').first().start_catalog
            end_catalog = predict_run.asteroids.order_by('finish_catalog').last().finish_catalog

            # Prediction Start + End
            start_search = predict_run.asteroids.order_by('start_search_candidate').first().start_search_candidate
            end_search = predict_run.asteroids.order_by('finish_search_candidate').last().finish_search_candidate

            # Map Start End
            start_maps = predict_run.asteroids.order_by('start_maps').first().start_maps
            end_maps = predict_run.asteroids.order_by('finish_maps').last().finish_maps

            data = dict({
                'dates': dict({
                    'label': 'Generate dates',
                    'start': datetime.strftime(predict_run.start_time, "%Y-%m-%d %H:%M:%S"),
                    'duration': predict_run.execution_dates.total_seconds()
                }),
                'ephemeris': dict({
                    'label': 'Generate efemerides',
                    'start': datetime.strftime(start_ephemeris, "%Y-%m-%d %H:%M:%S"),
                    'finish': datetime.strftime(end_ephemeris, "%Y-%m-%d %H:%M:%S"),
                    'rows': []
                }),
                'catalog': dict({
                    'label': 'Get star positions from star catalogue',
                    'start': datetime.strftime(start_catalog, "%Y-%m-%d %H:%M:%S"),
                    'finish': datetime.strftime(end_catalog, "%Y-%m-%d %H:%M:%S"),
                    'rows': []
                }),
                'search': dict({
                    'label': 'Prediction of stellar occultation',
                    'start': datetime.strftime(start_search, "%Y-%m-%d %H:%M:%S"),
                    'finish': datetime.strftime(end_search, "%Y-%m-%d %H:%M:%S"),                    
                    'rows': []
                }),                                                
                'map': dict({
                    'label': 'Make prediction maps',
                    'start': datetime.strftime(start_maps, "%Y-%m-%d %H:%M:%S"),
                    'finish': datetime.strftime(end_maps, "%Y-%m-%d %H:%M:%S"),                    
                    'rows': []
                }), 
                'register': dict({
                    'label': 'Register',
                    'start': datetime.strftime(end_maps, "%Y-%m-%d %H:%M:%S"),
                    'duration': predict_run.execution_register.total_seconds()
                }),                               
            })            

            # Ephemeris
            for asteroid in asteroids:

                try:
                    data['ephemeris']['rows'].append(dict({
                        'id': asteroid.id,
                        'name': asteroid.name,
                        'start': datetime.strftime(asteroid.start_ephemeris, "%Y-%m-%d %H:%M:%S"),
                        'finish': datetime.strftime(asteroid.finish_ephemeris, "%Y-%m-%d %H:%M:%S"),
                        'duration': asteroid.execution_ephemeris.total_seconds()
                    }))
                    data['ephemeris']['rows'].append(dict({
                        'id': asteroid.id,
                        'name': asteroid.name,
                        'start': datetime.strftime(asteroid.start_ephemeris, "%Y-%m-%d %H:%M:%S"), 
                        'finish': datetime.strftime(asteroid.finish_ephemeris, "%Y-%m-%d %H:%M:%S"),
                        'duration': asteroid.execution_ephemeris.total_seconds()
                    }))
                    data['catalog']['rows'].append(dict({
                        'id': asteroid.id,
                        'name': asteroid.name,
                        'start': datetime.strftime(asteroid.start_catalog, "%Y-%m-%d %H:%M:%S"),
                        'finish': datetime.strftime(asteroid.finish_catalog, "%Y-%m-%d %H:%M:%S"),
                        'duration': asteroid.execution_catalog.total_seconds()
                    }))

                    data['search']['rows'].append(dict({
                        'id': asteroid.id,
                        'name': asteroid.name,
                        'start': datetime.strftime(asteroid.start_search_candidate, "%Y-%m-%d %H:%M:%S"),
                        'finish': datetime.strftime(asteroid.finish_search_candidate, "%Y-%m-%d %H:%M:%S"),
                        'duration': asteroid.execution_search_candidate.total_seconds()
                    }))

                    data['map']['rows'].append(dict({
                        'id': asteroid.id,
                        'name': asteroid.name,
                        'start': datetime.strftime(asteroid.start_maps, "%Y-%m-%d %H:%M:%S"),
                        'finish': datetime.strftime(asteroid.finish_maps, "%Y-%m-%d %H:%M:%S"),
                        'duration': asteroid.execution_maps.total_seconds()
                    }))

                except Exception as e:
                    raise(e)

            return Response({
                'success': True,
                'data': data
            })

        except ObjectDoesNotExist:
            return Response({
                'success': False,
                'msg': "Record not found",
            })

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
        id = request.query_params.get('asteroid', None)

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
            next_model = PredictAsteroid.objects.filter(predict_run=asteroid.predict_run).exclude(status='failure').filter(              
                id__gt=asteroid.id).order_by('id').first()

            next = next_model.id
        except:
            pass

        prev = None
        try:
            prev_model = PredictAsteroid.objects.filter(predict_run=asteroid.predict_run).exclude(status='failure').filter(
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

    permission_classes = (IsAuthenticatedOrReadOnly,)


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

