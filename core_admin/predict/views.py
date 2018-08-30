from django.shortcuts import render
from rest_framework import viewsets
from .models import PredictRun, PredictAsteroid
from .serializers import PredictRunSerializer, PredictAsteroidSerializer


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
