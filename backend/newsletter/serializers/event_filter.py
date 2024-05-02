from ..models import EventFilter
from rest_framework import serializers


class EventFilterSerializer(serializers.ModelSerializer):

    class Meta:
        model = EventFilter
        fields = "__all__"
