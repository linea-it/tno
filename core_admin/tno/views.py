from django.shortcuts import render

from rest_framework import viewsets, response, mixins

from rest_framework.permissions import IsAuthenticated, IsAdminUser

from django.contrib.auth.models import User

from .serializers import UserSerializer, SkybotOutputSerializer
from .models import SkybotOutput

class UserViewSet(viewsets.ModelViewSet):

    queryset = User.objects.all()
    serializer_class = UserSerializer

    def get_permissions(self):
        """
        Instantiates and returns the list of permissions that this view requires.
        """        
        if self.action == 'retrieve':
            permission_classes = [IsAuthenticated]
        else:
            permission_classes = [IsAdminUser]

        return [permission() for permission in permission_classes]


    def retrieve(self, request, pk=None):
        """
            este metodo serve para retornar informacoes do usuario logado e
            so retorna informacao se o id passado por 'i'
        """
        if pk == 'i':
            return response.Response(UserSerializer(request.user,
                context={'request':request}).data)

        return super(UserViewSet, self).retrieve(request, pk)


class SkybotOutputViewSet(viewsets.ModelViewSet):

    queryset = SkybotOutput.objects.all()
    serializer_class = SkybotOutputSerializer