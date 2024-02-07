from rest_framework import serializers

from des.models import Exposure, SkybotJob, SkybotJobResult


class SkybotJobResultSerializer(serializers.ModelSerializer):

    # job = serializers.PrimaryKeyRelatedField(
    #     queryset=SkybotJob.objects.all(), many=False
    # )

    # exposure = serializers.PrimaryKeyRelatedField(
    #     queryset=Exposure.objects.all(), many=False
    # )

    job = serializers.PrimaryKeyRelatedField(read_only=True)

    exposure = serializers.PrimaryKeyRelatedField(read_only=True)

    ticket = serializers.SerializerMethodField()

    band = serializers.SerializerMethodField()

    date_obs = serializers.SerializerMethodField()

    ccds = serializers.SerializerMethodField()

    class Meta:
        model = SkybotJobResult
        fields = (
            "id",
            "job",
            "exposure",
            "ticket",
            "success",
            "error",
            "execution_time",
            "ccds",
            "ccds_with_asteroids",
            "positions",
            "inside_ccd",
            "outside_ccd",
            "filename",
            "band",
            "date_obs",
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

    def get_ccds(self, obj):
        try:
            return obj.exposure.ccd_set.count()
        except:
            return 0
