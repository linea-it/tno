from des.models import SkybotByDynclass
from rest_framework import serializers


class SkybotByDynclassSerializer(serializers.ModelSerializer):
    class Meta:
        model = SkybotByDynclass
        fields = (
            "id",
            "dynclass",
            "nights",
            "ccds",
            "asteroids",
            "positions",
            "u",
            "g",
            "r",
            "i",
            "z",
            "y",
        )
