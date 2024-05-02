from django.shortcuts import render
from drf_spectacular.utils import extend_schema
from ..models import Preference
from ..serializers import PreferenceSerializer
from rest_framework import viewsets
#from rest_framework.decorators import action
#from rest_framework.permissions import AllowAny, IsAuthenticated
#from rest_framework.response import Response


@extend_schema(exclude=True)
class PreferenceViewSet(
    viewsets.ModelViewSet
):
    queryset = Preference.objects.all()
    #filter_fields = ("subscription_id")
    serializer_class = PreferenceSerializer