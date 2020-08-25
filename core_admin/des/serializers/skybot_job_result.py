from rest_framework import serializers

from des.models import Exposure, SkybotJob, SkybotJobResult


class SkybotJobResultSerializer(serializers.ModelSerializer):

    job = serializers.PrimaryKeyRelatedField(
        queryset=SkybotJob.objects.all(), many=False)

    exposure = serializers.PrimaryKeyRelatedField(
        queryset=Exposure.objects.all(), many=False)

    ticket = serializers.SerializerMethodField()

    band = serializers.SerializerMethodField()

    date_obs = serializers.SerializerMethodField()

    class Meta:
        model = SkybotJobResult
        fields = (
            'id',
            'job',
            'exposure',
            'ticket',
            'success',
            'execution_time',
            'ccds_with_asteroids',
            'positions',
            'inside_ccd',
            'outside_ccd',
            'filename',
            'band',
            'date_obs'
        )

    def get_ticket(self, obj):
        try:
            return str(obj.ticket)
        except:
            return None

    def get_band(self, obj):
        try:
            return obj.exposure.band
        except:
            return None

    def get_date_obs(self, obj):
        try:
            return obj.exposure.date_obs
        except:
            return None
