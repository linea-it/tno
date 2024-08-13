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
class SubscriptionViewSet(viewsets.ModelViewSet):

    queryset = Subscription.objects.all()
    serializer_class = SubscriptionSerializer
    permission_classes = (IsAuthenticated,)

    def get_permissions(self):

        if self.action in ["create", "activate", "email_unsubscribe"]:
            self.permission_classes = (AllowAny,)
        else:
            self.permission_classes = [IsAuthenticated]

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

        return render(request, "activation_confirm.html")

    @action(detail=False, methods=["get"], permission_classes=(IsAuthenticated,))
    def info(self, request):

        return Response(
            self.serializer_class(
                request.user.subscription, context={"request": request}
            ).data
        )

    @action(detail=False, methods=["post"], permission_classes=(IsAuthenticated,))
    def unsubscribe(self, request):

        obj = request.user.subscription

        obj.unsubscribe_date = datetime.now()
        obj.unsubscribe = True
        obj.save()

        result = dict(
            {
                "success": True,
            }
        )

        return JsonResponse(
            result,
            status=status.HTTP_200_OK,
        )

    @action(detail=False, methods=["get"], permission_classes=(AllowAny,))
    def email_unsubscribe(self, request):

        params = self.request.query_params
        activation_code = params.get("c", None)
        if not activation_code:
            raise ParseError(detail="Activation code parameter is required")

        obj = Subscription.objects.get(activation_code=activation_code)
        obj.unsubscribe_date = datetime.now()
        obj.unsubscribe = True
        obj.save()

        return render(request, "unsubscription_confirm.html")

    @action(detail=False, methods=["post"], permission_classes=(IsAuthenticated,))
    def reactivate(self, request):

        obj = request.user.subscription

        obj.unsubscribe_date = None
        obj.unsubscribe = False
        obj.save()

        result = dict(
            {
                "success": True,
            }
        )
        return JsonResponse(result, status=status.HTTP_200_OK)
