from rest_framework import serializers
from des.models import Observation, Ccd
from tno.models import Asteroid

class ObservationSerializer(serializers.ModelSerializer):

    asteroid = serializers.PrimaryKeyRelatedField(read_only=True)
    
    class Meta:
        model = Observation
        fields = (
            "id",
            "asteroid",
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
