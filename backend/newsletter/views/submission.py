import logging
from datetime import datetime, tzinfo

from django.http.response import JsonResponse
from django.shortcuts import render
from drf_spectacular.utils import extend_schema
from newsletter.models import EventFilter, Subscription
from newsletter.newsletter_send_mail import NewsletterSendEmail
from rest_framework import status, viewsets
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

    @action(detail=False, methods=["GET"], permission_classes=(AllowAny,))
    def list_process(self, request):
        # Get all books marked as favorite
        list_process = self.queryset.filter(prepared=True)
        serializer = self.get_serializer(list_process, many=True)
        return Response(serializer.data)

    """
    @action(detail=False, methods=["POST"], permission_classes=(AllowAny,))
    def process_events(self, request, pk=None):
        try:
            process = self.get_object()
        except process.DoesNotExist:
            return Response({"error": "Book not found."}, status=404)

        process.process_date = datetime.now()
        process.prepare = True
        process.save()

        return Response({"message": f"Custom post action executed for instance {pk}."})
    """
    """
        if request.method == "GET":
            try:
                if request.GET[id]:
                    id = EventFilter.objects.filter("id")
                    submission = Submission.objects.get(event_id=id)
                    return Response
                    # return JsonResponse(
                    #    {
                    #        "success": True,
                    #    },
                    #    status=status.HTTP_200_OK,
                    # )
                else:
                    return Response(status=status.HTTP_400_BAD_REQUEST)
            except:
                return Response(status=status.HTTP_400_BAD_REQUEST)
        # params = self.request.query_params
        # id = params.get(id, None)
        # if not id:
        #    raise ParseError(detail="Activation code parameter is required")

        # print("id submission", id)
        # obj = Submission.objects.get(id=id)
        # obj = EventFilter.objects.get(user=user)
        # obj = Submission.get_object()
        # obj = Submission.objects.get(id=id)
        # obj = request.obj.id
        # obj = obj.id.event_filter
        print("obj", obj)
        # obj.process_date = datetime.now()
        # obj.prepared = True
        # obj.save()

        return Response({"message": "Custom POST action executed successfully."})

        # return JsonResponse(
        #    {
        #        "success": True,
        #    },
        #    status=status.HTTP_200_OK,
        # )
        """
