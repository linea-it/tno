import json
import os
import threading

from rest_framework import viewsets

from des.models import Observation
from des.serializers import ObservationSerializer
from rest_framework.decorators import action
from rest_framework.response import Response


class ObservationViewSet(viewsets.ReadOnlyModelViewSet):

    # queryset = Observation.objects.select_related().all()
    queryset = Observation.objects.all()
    serializer_class = ObservationSerializer
    # ordering_fields = ("date_obs", "id", "name",)
    # ordering = ("date_obs",)
    filter_fields = (
        "id",
        "asteroid",
        "ccd",
        "name",
        "date_obs",
    )
    search_fields = ("name",)

    @action(detail=True, methods=["get"])
    def get_by_asteroid(self, request, pk=None):
        """
        #     Este endpoint obtem as observações de dado asteroide.

        #     Parameters:
        #         pk (string): asteroid id.

        #     Returns:
        #         result .
        #     """
        obs = Observation.objects.filter(asteroid=pk) if Observation.objects.filter(asteroid=pk).exists() else None
        
        if obs is not None:
            result = ObservationSerializer(obs, many=True)
            return Response(result.data)
        else:
            return Response("no observations found")
