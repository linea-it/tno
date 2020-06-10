from rest_framework import serializers

from des.models import Exposure, SkybotJob, SkybotJobResult


class SkybotJobResultSerializer(serializers.ModelSerializer):

    job = serializers.PrimaryKeyRelatedField(
        queryset=SkybotJob.objects.all(), many=False)

    exposure = serializers.PrimaryKeyRelatedField(
        queryset=Exposure.objects.all(), many=False)

    class Meta:
        model = SkybotJobResult
        fields = (
            'id',
            'job',
            'exposure',
            'ticket',
            'success',
            'execution_time',
            'positions',
            'inside_ccd',
            'outside_ccd',
            'filename',
        )
