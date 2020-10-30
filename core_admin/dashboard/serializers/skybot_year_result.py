from rest_framework import serializers
from dashboard.models import SkybotYearResult


class SkybotYearResultSerializer(serializers.ModelSerializer):

    class Meta:
        model = SkybotYearResult
        fields = (
            'id',
            'year',
            'nights',
            'exposures',
            'ccds',
            'nights_analyzed',
            'exposures_analyzed',
            'ccds_analyzed',
        )
