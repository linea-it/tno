from rest_framework import serializers
from des.models import DashboardSkybotYearResult


class DashboardSkybotYearResultSerializer(serializers.ModelSerializer):

    class Meta:
        model = DashboardSkybotYearResult
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
