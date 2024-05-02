from ..models import Preference
from rest_framework import serializers


class PreferenceSerializer(serializers.ModelSerializer):

    class Meta:
        model = Preference
        fields = "__all__"
