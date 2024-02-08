from des.models import SkybotJob, SummaryDynclass
from rest_framework import serializers


class SummaryDynclassSerializer(serializers.ModelSerializer):
    job = serializers.PrimaryKeyRelatedField(
        queryset=SkybotJob.objects.all(), many=False
    )

    class Meta:
        model = SummaryDynclass
        fields = (
            "id",
            "job",
            "dynclass",
            "asteroids",
            "ccds",
            "positions",
            "u",
            "g",
            "r",
            "i",
            "z",
            "y",
        )
