from datetime import datetime, tzinfo

from django.http.response import JsonResponse
from django.shortcuts import render
from drf_spectacular.utils import extend_schema
from newsletter.models import Subscription
from newsletter.render_html import RenderizaHtml
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

    @action(detail=False, methods=["get", "post"], permission_classes=(AllowAny,))
    def activate(self, request):

        params = self.request.query_params

        activation_code = params.get("c", None)
        if not activation_code:
            raise Exception("Parametro c obrigatório")

        obj = Subscription.objects.get(activation_code=activation_code)

        # Enviar o Email Welcome
        obj.activated_date = datetime.now()
        obj.activated = True
        obj.save()

        envio = RenderizaHtml()
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

        result = dict({"email": obj.email, "is_active": not obj.unsubscribe})

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
