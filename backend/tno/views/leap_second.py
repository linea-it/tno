import logging

from rest_framework import viewsets

from tno.models import LeapSecond

from tno.serializers import LeapSecondSerializer


class LeapSecondViewSet(viewsets.ReadOnlyModelViewSet):

    queryset = LeapSecond.objects.all()
    serializer_class = LeapSecondSerializer
    filterset_fields = (
        "id",
        "name",
    )
