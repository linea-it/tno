from rest_framework import serializers
from des.models import SkybotByYear


class SkybotByYearSerializer(serializers.ModelSerializer):
    class Meta:
        model = SkybotByYear
        fields = (
            "id",
            "year",
            "nights",
            "exposures",
            "ccds",
            "nights_analyzed",
            "exposures_analyzed",
            "ccds_analyzed",
        )
