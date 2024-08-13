from django.shortcuts import render
from drf_spectacular.utils import extend_schema
from rest_framework import viewsets

from ..models import Submission
from ..serializers import SubmissionSerializer

# from rest_framework.decorators import action
# from rest_framework.permissions import AllowAny, IsAuthenticated
# from rest_framework.response import Response


@extend_schema(exclude=True)
class SubmissionViewSet(viewsets.ModelViewSet):
    queryset = Submission.objects.all()
    serializer_class = SubmissionSerializer
