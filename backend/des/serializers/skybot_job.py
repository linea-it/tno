from des.models import SkybotJob
from rest_framework import serializers


class SkybotJobSerializer(serializers.ModelSerializer):
    owner = serializers.SerializerMethodField()

    class Meta:
        model = SkybotJob
        fields = (
            "id",
            "owner",
            "date_initial",
            "date_final",
            "status",
            "start",
            "finish",
            "execution_time",
            "estimated_execution_time",
            "exposures",
            "ccds",
            "nights",
            "positions",
            "asteroids",
            "exposures_with_asteroid",
            "ccds_with_asteroid",
            "path",
            "results",
            "error",
            "debug",
            "summary",
        )

    def get_owner(self, obj):
        try:
            return obj.owner.username
        except:
            return None
