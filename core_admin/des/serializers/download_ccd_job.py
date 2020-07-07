from rest_framework import serializers
from des.models import DownloadCcdJob


class DownloadCcdJobSerializer(serializers.ModelSerializer):
    owner = serializers.SerializerMethodField()

    class Meta:
        model = DownloadCcdJob
        fields = (
            'id',
            'owner',
            'date_initial',
            'date_final',
            'dynclass',
            'name',
            'status',
            'start',
            'finish',
            'execution_time',
            'ccds',
            't_size_downloaded',
            'path',
            'error'
        )

    def get_owner(self, obj):
        try:
            return obj.owner.username
        except:
            return None
