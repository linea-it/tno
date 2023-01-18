from django.contrib.auth.models import User
from rest_framework import viewsets
from rest_framework.permissions import IsAdminUser, IsAuthenticated
from rest_framework.response import Response

from tno.serializers import UserSerializer


class UserViewSet(viewsets.ModelViewSet):
    queryset = User.objects.all()
    serializer_class = UserSerializer

    def get_permissions(self):
        """
        Instantiates and returns the list of permissions that this view requires.
        """
        if self.action == "retrieve":
            permission_classes = [IsAuthenticated]
        else:
            permission_classes = [IsAdminUser]

        return [permission() for permission in permission_classes]

    def retrieve(self, request, pk=None):
        """
        este metodo serve para retornar informacoes do usuario logado e
        so retorna informacao se o id passado por 'i'
        """
        if pk == "i":
            return Response(
                UserSerializer(request.user, context={"request": request}).data
            )

        return super(UserViewSet, self).retrieve(request, pk)
