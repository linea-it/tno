from django.shortcuts import render
from rest_framework import viewsets

from skybot.models import Position
from skybot.serializers import PositionSerializer


class PositionViewSet(viewsets.ModelViewSet):
    queryset = Position.objects.all()
    serializer_class = PositionSerializer
    filter_fields = ('id', 'number', 'name', 'dynclass', 'mv',)
    search_fields = ('name', 'number', 'dynclass', 'mv',)
    ordering_fields = ('name', 'dynclass', 'number',
                       'raj2000', 'decj2000', 'mv', 'errpos',)
    ordering = ('name',)
