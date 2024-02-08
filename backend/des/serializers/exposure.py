from des.models import Exposure
from rest_framework import serializers


class ExposureSerializer(serializers.ModelSerializer):
    class Meta:
        model = Exposure
        fields = (
            "id",
            "nite",
            "date_obs",
            "pfw_attempt_id",
            "band",
            "radeg",
            "decdeg",
            "exptime",
            "cloud_apass",
            "cloud_nomad",
            "t_eff",
            "release",
        )
