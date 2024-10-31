import logging
from datetime import datetime, tzinfo

from django.shortcuts import render
from drf_spectacular.utils import extend_schema
from newsletter.models import Subscription
from newsletter.newsletter_send_mail import NewsletterSendEmail
from rest_framework import viewsets
from rest_framework.authentication import BasicAuthentication, SessionAuthentication
from rest_framework.decorators import action
from rest_framework.exceptions import ParseError
from rest_framework.permissions import AllowAny, IsAuthenticated
from rest_framework.renderers import JSONRenderer, TemplateHTMLRenderer
from rest_framework.response import Response

from ..models import Submission
from ..serializers import SubmissionSerializer


@extend_schema(exclude=True)
class SubmissionViewSet(viewsets.ModelViewSet):
    queryset = Submission.objects.all()
    serializer_class = SubmissionSerializer

    @action(detail=False, methods=["get"], permission_classes=(AllowAny,))
    def send_results(self, request):

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
        envio.send_events_mail(obj)

        return render(request, "results.html")
