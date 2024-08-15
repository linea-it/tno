from django.shortcuts import render
from drf_spectacular.utils import extend_schema
from rest_framework import exceptions, viewsets

from ..models import EventFilter
from ..serializers import EventFilterSerializer


@extend_schema(exclude=True)
class EventFilterViewSet(viewsets.ModelViewSet):
    serializer_class = EventFilterSerializer
    filter_fields = []
    ordering_fields = ["id", "filter_name", "frequency", "description"]
    ordering = ["-id"]

    def get_queryset(self):
        queryset = EventFilter.objects.filter(user=self.request.user)

        return queryset

    def perform_create(self, serializer):
        # Adiconar usuario logado
        if not self.request.user.pk:
            raise Exception(
                "It is necessary an active login to perform this operation."
            )
        serializer.save(user=self.request.user)

    def destroy(self, request, pk=None, *args, **kwargs):
        """can only be deleted by the OWNER or if the user has an
        admin profile.
        """
        instance = self.get_object()
        if instance.can_delete(self.request.user):
            return super(EventFilterViewSet, self).destroy(request, pk, *args, **kwargs)
        else:
            raise exceptions.PermissionDenied()
