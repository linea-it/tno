from rest_framework import serializers
from des.models import DashboardSkybotDynclassResult


class DashboardSkybotDynclassResultSerializer(serializers.ModelSerializer):

    class Meta:
        model = DashboardSkybotDynclassResult
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
