from django.contrib.auth.models import User
from drf_spectacular.utils import extend_schema
from rest_framework import viewsets
from rest_framework.decorators import action
from rest_framework.permissions import IsAdminUser, IsAuthenticated
from rest_framework.response import Response
from tno.serializers import UserSerializer


@extend_schema(exclude=True)
class UserViewSet(viewsets.ModelViewSet):
    permission_classes = [IsAuthenticated]
    swagger_schema = None
    queryset = User.objects.all()
    serializer_class = UserSerializer

    def get_permissions(self):
        """
        Instantiates and returns the list of permissions that this view requires.
        """
        if self.action in ["retrieve", "delete_account"]:
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

    @action(detail=False, methods=["post"])
    def delete_account(self, request):
        """
        este metodo serve para deletar a conta do usuario logado
        """
        # Confirmar que o email informado é o mesmo do usuário logado
        email = request.data.get("email")
        if email != request.user.email:
            return Response(
                {
                    "success": False,
                    "message": "O email informado não é o mesmo do usuário logado",
                },
                status=400,
            )
        user = request.user
        user.delete()
        return Response({"success": True, "message": "Conta deletada com sucesso"})
