from datetime import datetime, tzinfo

from django.core.exceptions import ValidationError
from django.core.validators import validate_email
from django.http.response import JsonResponse
from django.shortcuts import render
from drf_spectacular.utils import extend_schema
from newsletter.models import Subscription
from newsletter.newsletter_send_mail import NewsletterSendEmail
from newsletter.serializers import SubscriptionSerializer
from rest_framework import status, viewsets
from rest_framework.authentication import BasicAuthentication, SessionAuthentication
from rest_framework.decorators import action
from rest_framework.permissions import AllowAny, IsAuthenticated
from rest_framework.renderers import JSONRenderer, TemplateHTMLRenderer
from rest_framework.response import Response


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

    def get_permissions(self):
        if self.request.method == "POST":
            self.permission_classes = (AllowAny,)
        return super().get_permissions()

    # @action(detail=False, methods=["POST"], permission_classes=(AllowAny,))
    # def subscribe(self, request):
    def create(self, request):
        params = self.request.data
        email = params.get("email", None)

        try:
            validate_email(email)
        except ValidationError as e:
            pass
            # TODO: Enviar mensagem de erro quando email não for valido

        # Verifica se existe e se ainda não foi ativado.
        # Exclui o registro e cria um novo, para que o email
        # de ativação seja enviado novamente.
        try:
            obj = Subscription.objects.get(email=email)
            if obj.activated == False:
                # Existe, não está ativo e será apagado
                obj.delete()
            else:
                # TODO: Existe foi ativo e o usuario tentou registrar de novo
                # Retornar Mensagem de aviso.
                pass
        except Subscription.DoesNotExist:
            # Ainda não exite basta criar o registro.
            obj = Subscription.objects.create(email=email)

        return Response({"success": True})

    @action(detail=False, methods=["get", "post"], permission_classes=(AllowAny,))
    def activate(self, request):

        if request.method == "GET":
            params = self.request.query_params
        elif request.method == "POST":
            params = self.request.data

        activation_code = params.get("c", None)
        if not activation_code:
            raise Exception("Parametro c obrigatório")

        obj = Subscription.objects.get(activation_code=activation_code)

        # Enviar o Email Welcome
        obj.activated_date = datetime.now()
        obj.activated = True
        obj.save()

        envio = NewsletterSendEmail()
        envio.send_welcome_mail(obj)

        # return Response(status=status.HTTP_200_ok)
        # TODO: Retornar uma página html com uma mensagem simples de confirmação
        # https://www.django-rest-framework.org/api-guide/renderers/#templatehtmlrenderer

        result = dict(
            {
                "success": True,
            }
        )
        if format == "json" or format is None:
            return JsonResponse(result, status=status.HTTP_200_OK)
        else:
            return render(request, "activation_confirm.html", {"context": result})

    @action(detail=False, methods=["post"], permission_classes=(AllowAny,))
    def info(self, request):

        params = self.request.data

        activation_code = params.get("c", None)
        if not activation_code:
            raise Exception("Parametro c obrigatório")

        obj = Subscription.objects.get(activation_code=activation_code)

        result = dict(
            {"id": obj.id, "email": obj.email, "is_active": not obj.unsubscribe}
        )

        return Response(result)

    @action(detail=False, methods=["get", "post"], permission_classes=(AllowAny,))
    def unsubscribe(self, request):
        if request.method == "GET":
            params = self.request.query_params
        elif request.method == "POST":
            params = self.request.data

        activation_code = params.get("c", None)
        if not activation_code:
            raise Exception("Parametro c obrigatório")

        obj = Subscription.objects.get(activation_code=activation_code)

        obj.unsubscribe_date = datetime.now()
        obj.unsubscribe = True
        obj.save()

        result = dict(
            {
                "success": True,
            }
        )

        if format == "json" or format is None:
            return JsonResponse(
                result,
                status=status.HTTP_200_OK,
            )
        else:
            return render(request, "unsubscription_confirm.html", {"context": result})

    @action(detail=False, methods=["post"], permission_classes=(AllowAny,))
    def reactivate(self, request):

        params = self.request.data

        activation_code = params.get("c", None)
        if not activation_code:
            raise Exception("Parametro c obrigatório")

        obj = Subscription.objects.get(activation_code=activation_code)

        obj.unsubscribe_date = None
        obj.unsubscribe = False
        obj.save()

        result = dict(
            {
                "success": True,
            }
        )
        if format == "json" or format is None:
            return JsonResponse(result, status=status.HTTP_200_OK)
        else:
            return render(request, "activation_confirm.html", {"context": result})
