from rest_framework import serializers
from des.models import SkybotJob

class SkybotJobSerializer(serializers.ModelSerializer):
    owner = serializers.SerializerMethodField()

    class Meta:
        model = SkybotJob
        fields = (
            'owner',
            'date_initial',
            'date_final',
            'status',
            'start',
            'finish',
            'execution_time',
            'exposures',
            'path',
            'error'
        )

    def get_owner(self, obj):
        try:
            return obj.owner.username
        except:
            return None