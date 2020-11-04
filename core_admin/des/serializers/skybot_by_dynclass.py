from rest_framework import serializers
from des.models import SkybotByDynclass


class SkybotByDynclassSerializer(serializers.ModelSerializer):

    class Meta:
        model = SkybotByDynclass
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
