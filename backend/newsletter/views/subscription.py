import logging
from datetime import datetime, tzinfo

from django.contrib.auth.models import User
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
from rest_framework.exceptions import ParseError
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
    # filter_fields = ("activation_code")
    serializer_class = SubscriptionSerializer
    permission_classes = (IsAuthenticated,)

    def get_permissions(self):

        if self.action == "create":
            self.permission_classes = (AllowAny,)
        elif self.action == "activate":
            self.permission_classes = (AllowAny,)
        else:
            self.permission_classes = [IsAuthenticated]

        # if self.request.method == "POST":
        #     self.permission_classes = (AllowAny,)

        return super().get_permissions()

    def create(self, request):
        log = logging.getLogger("subscription")
        params = self.request.data
        email = params.get("email", None)
        log.info("Starting Subscription")
        log.info(f"Email: {email}")

        try:
            validate_email(email)
        except ValidationError as e:
            log.error("Email is not valid")
            raise ParseError("Please enter a valid email address.")

        # Cria um usuario, sem senha utilizando o email.
        user, created = User.objects.get_or_create(
            email=email, defaults={"username": email}
        )
        if created:
            log.info(f"New user has been created")
        else:
            log.info(f"There is already a user registered with this email.")

        try:
            if user.subscription.activated == True:
                msg = f"There is already an active subscription for this email, please visit the preferences page for more information."
                log.info(msg)
                raise ParseError(msg)

            if user.subscription.activated == False:
                log.info("A subscription already exists but has not been activated.")
                user.subscription.delete()
                log.info("Subscription has been removed so a new email will be sent.")

        except User.subscription.RelatedObjectDoesNotExist as e:
            log.info("There is no subscription for this user yet.")

        obj = Subscription.objects.create(user=user)
        log.info("New subscription record has been created.")
        log.info(f"Subscription ID: {obj.pk} Email: {obj.user.email}")
        log.info(f"-----------------------------------")
        return Response({"success": True})

    @action(detail=False, methods=["get"], permission_classes=(AllowAny,))
    def activate(self, request):

        if request.method == "GET":
            params = self.request.query_params

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

    @action(detail=False, methods=["get"], permission_classes=(IsAuthenticated,))
    def info(self, request):

        user = request.user

        return Response(
            self.serializer_class(
                request.user.subscription, context={"request": request}
            ).data
        )
        # params = self.request.data

        # activation_code = params.get("c", None)
        # if not activation_code:
        #     raise Exception("Parametro c obrigatório")

        # obj = Subscription.objects.get(activation_code=activation_code)

        # result = dict(
        #     {"id": obj.id, "email": obj.email, "is_active": not obj.unsubscribe}
        # )
        # result = dict({"success": True})
        # return Response(result)

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
