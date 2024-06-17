from django.shortcuts import render
from drf_spectacular.utils import extend_schema
from ..models import Attachment
from ..serializers import AttachmentSerializer
from rest_framework import viewsets
#from rest_framework.decorators import action
#from rest_framework.permissions import AllowAny, IsAuthenticated
#from rest_framework.response import Response


@extend_schema(exclude=True)
class AttachmentViewSet(
    viewsets.ModelViewSet
):
    queryset = Attachment.objects.all()
    serializer_class = AttachmentSerializer