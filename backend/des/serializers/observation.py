from des.models import Ccd, Observation
from rest_framework import serializers
from tno.models import Asteroid


class ObservationSerializer(serializers.ModelSerializer):
    class Meta:
        model = Observation
        fields = (
            "id",
            "ccd_id",
            "name",
            "date_obs",
            "date_jd",
            "ra",
            "dec",
            "offset_ra",
            "offset_dec",
            "mag_psf",
            "mag_psf_err",
        )
