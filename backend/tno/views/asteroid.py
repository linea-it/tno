import logging
from datetime import datetime

import humanize
from des.models import Observation
from rest_framework import viewsets
from rest_framework.decorators import action
from rest_framework.pagination import PageNumberPagination
from rest_framework.permissions import (
    AllowAny,
    IsAuthenticated,
    IsAuthenticatedOrReadOnly,
)
from rest_framework.response import Response

from tno.dao.asteroids import AsteroidDao
from tno.models import Asteroid, Occultation, PredictionJobResult
from tno.serializers import AsteroidSerializer


class AsteroidViewSet(viewsets.ReadOnlyModelViewSet):
    permission_classes = [IsAuthenticatedOrReadOnly]
    queryset = Asteroid.objects.select_related().all()
    serializer_class = AsteroidSerializer
    filter_fields = ("id", "name", "number", "dynclass", "base_dynclass")
    search_fields = ("name", "number")

    @action(detail=False, methods=["GET"], permission_classes=(IsAuthenticated,))
    def count_asteroid_table(self, request):

        count = Asteroid.objects.count()

        return Response(dict({"count": count}))

    @action(detail=False, methods=["GET"], permission_classes=(AllowAny,))
    def dynclasses(self, request):
        """All Dynamic Classes.
        Distinct dynclass in tno_asteroid table.
        """

        rows = AsteroidDao(pool=False).distinct_dynclass()

        return Response(dict({"results": rows, "count": len(rows)}))

    @action(detail=False, methods=["GET"], permission_classes=(AllowAny,))
    def base_dynclasses(self, request):
        """All Base Dynamic Classes.
        Distinct base_dynclass in tno_asteroid table.
        Base Dynamic Class is dynclass split in >
        """

        rows = AsteroidDao(pool=False).distinct_base_dynclass()

        return Response(dict({"results": rows, "count": len(rows)}))

    @action(detail=False, methods=["get"], permission_classes=(AllowAny,))
    def with_prediction(self, request):
        """Returns all asteroids that have at least one prediction event.
        Asteroids can be filtered by name using the name parameter.

        """
        filtro = self.request.query_params.get("name", None)

        queryset = Occultation.objects.order_by("name").distinct("name")

        if filtro:
            queryset = queryset.filter(name__icontains=filtro)

        paginator = PageNumberPagination()
        paginator.page_size = 25
        result_page = paginator.paginate_queryset(queryset, request)

        names_in_page = [x.name for x in result_page]
        asteroids = Asteroid.objects.filter(name__in=names_in_page)

        serializer = AsteroidSerializer(asteroids, many=True)
        return paginator.get_paginated_response(serializer.data)
