from django.shortcuts import render
from rest_framework import viewsets
from .models import PredictRun, PredictAsteroid, LeapSecond, BspPlanetary
from .serializers import PredictRunSerializer, PredictAsteroidSerializer, LeapSecondsSerializer, BspPlanetarySerializer


class PredictRunViewSet(viewsets.ModelViewSet):
    queryset = PredictRun.objects.all()
    serializer_class = PredictRunSerializer
    filter_fields = ('id', 'owner', 'status',)
    search_fields = ('id',)
    ordering_fields = ('id', 'owner', 'status', 'start_time', 'finish_time')
    ordering = ('-start_time',)


class PredictAsteroidViewSet(viewsets.ModelViewSet):
    queryset = PredictAsteroid.objects.all()
    serializer_class = PredictAsteroidSerializer
    filter_fields = ('id', 'predict_run', 'name', 'number', 'status')
    search_fields = ('id', 'name', 'number',)
    ordering = ('name',)


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

