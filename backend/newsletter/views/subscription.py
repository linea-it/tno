from datetime import datetime, tzinfo

from django.shortcuts import render
from drf_spectacular.utils import extend_schema
from newsletter.models import Subscription
from newsletter.serializers import SubscriptionSerializer
from rest_framework import viewsets
from rest_framework.decorators import action
from rest_framework.authentication import SessionAuthentication, BasicAuthentication 
from rest_framework.permissions import AllowAny, IsAuthenticated
from rest_framework.response import Response
from rest_framework import status


@extend_schema(exclude=True)
class SubscriptionViewSet(
    viewsets.ModelViewSet
    # viewsets.mixins.ListModelMixin,
    # viewsets.mixins.CreateModelMixin,
    # viewsets.mixins.UpdateModelMixin,
):
    queryset = Subscription.objects.all()
    filter_fields = ("email", "activation_code")
    serializer_class = SubscriptionSerializer

    @action(detail=False, methods=["get","delete"], permission_classes=(IsAuthenticated,))
    def unsubscribe(self, request):

        params = self.request.query_params

        activation_code = params.get("c", None)
        if not activation_code:
            raise Exception("Parametro c obrigatório")

        obj = Subscription.objects.get(activation_code=activation_code)

        obj.unsubscribe_date = datetime.now()
        obj.unsubscribe = True
        obj.delete()

        # Exemplo url de unsubscribe: http://localhost/api/subscription/unsubscribe?c=c089bcaf-43a5-436c-a534-77bf257b1e1a

        return Response(status=status.HTTP_200_ok)
