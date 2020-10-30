from rest_framework import serializers
from dashboard.models import SkybotDynclassResult


class SkybotDynclassResultSerializer(serializers.ModelSerializer):

    class Meta:
        model = SkybotDynclassResult
        fields = (
            'id',
            'dynclass',
            'nights',
            'ccds',
            'asteroids',
            'positions',
            'u',
            'g',
            'r',
            'i',
            'z',
            'y',
        )
