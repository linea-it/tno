from rest_framework import serializers

from ..models import EventFilter


class EventFilterSerializer(serializers.ModelSerializer):

    class Meta:
        model = EventFilter
        # fields = "__all__"
        exclude = ("user",)
