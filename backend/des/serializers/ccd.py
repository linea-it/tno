from des.models import Ccd, Exposure
from rest_framework import serializers


class CcdSerializer(serializers.ModelSerializer):

    exposure = serializers.PrimaryKeyRelatedField(
        queryset=Exposure.objects.all(), many=False
    )

    class Meta:
        model = Ccd
        fields = (
            "id",
            "exposure",
            "ccdnum",
            "ra_cent",
            "dec_cent",
            "rac1",
            "rac2",
            "rac3",
            "rac4",
            "decc1",
            "decc2",
            "decc3",
            "decc4",
            "crossra0",
            "racmin",
            "racmax",
            "deccmin",
            "deccmax",
            "ra_size",
            "dec_size",
            "path",
            "filename",
            "compression",
        )
