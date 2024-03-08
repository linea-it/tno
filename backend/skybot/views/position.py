from django.shortcuts import render
from drf_spectacular.utils import extend_schema
from rest_framework import viewsets
from rest_framework.permissions import IsAuthenticated
from skybot.models import Position
from skybot.serializers import PositionSerializer


@extend_schema(exclude=True)
class PositionViewSet(viewsets.ModelViewSet):
    permission_classes = [IsAuthenticated]
    swagger_schema = None
    queryset = Position.objects.all()
    serializer_class = PositionSerializer
    filter_fields = (
        "id",
        "number",
        "name",
        "dynclass",
        "mv",
        "ticket",
    )
    search_fields = (
        "name",
        "number",
    )
    ordering_fields = (
        "name",
        "dynclass",
        "number",
    )
    ordering = ("name",)
