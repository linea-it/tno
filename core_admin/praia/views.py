from django.shortcuts import render

from django.db.models import Count

from rest_framework import viewsets

from rest_framework.decorators import list_route, detail_route

from rest_framework.response import Response

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

    @detail_route(methods=['GET'])
    def count_asteroid_status(self, request, pk=None):

        astrometry_run = self.get_object()
        resultset = astrometry_run.asteroids.all().values(
                'status').annotate(total=Count('status')).order_by('total')

        result = dict({
            'success': True,
            'status': {
                'success':0,
                'failure' :0,
                'warning' :0,
                'not_executed':0,
            }
        })        

        for status in resultset:
            result['status'][status['status']] = status['total']

        return Response(result)


    @detail_route(methods=['GET'])
    def step_execution_time(self, request, pk=None):
        """
            Retorna o tempo de execucao de cada etapa do pipeline
        """
        astrometry_run = self.get_object()

        result = dict( {
            'success': True,
            'execution_time': {
                'ccd_images': astrometry_run.execution_ccd_images,
                'bsp_jpl': astrometry_run.execution_bsp_jpl,
                'catalog': astrometry_run.execution_catalog,
                'astrometry': astrometry_run.execution_astrometry
            }
        })

        return Response(result)

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

    @detail_route(methods=['GET'])
    def get_neighbors(self, request, pk=None):  

        # Saber qual e o Asteroid
        asteroid = self.get_object()

        # Saber todos os asteroids que estao na mesma rodada deste asteroid. 
        # Filtrando a lista de asteroids pelo astrometry_run == asteroid.astrometry_run
        aAsteroids = AstrometryAsteroid.objects.filter(astrometry_run=asteroid.astrometry_run)
           
        # Fazer a query para saber qual asteroid esta antes deste. 
        # ordernar a lista de asteroids pelo id, e pegar o primeiro asteroid com id menor que id deste asteroid.
        prev_id = None
        try:
            prev_model = aAsteroids.filter(id__lt=asteroid.id).order_by('-id').first()
            prev_id = prev_model.id
        except:
            pass
        # Fazer a query para saber qual asteroid esta depois. 
        # Ordenar a lista pelo id, e pega o primeiro asteroid com id maior que este asteroid.
        next_id = None
        try:
            next_model = aAsteroids.filter(id__gt=asteroid.id).order_by('id').first()
            next_id = next_model.id
        except:
            pass       

        return Response(dict({
            "success": True,
            "prev": prev_id, 
            "next": next_id, 
        }))


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
