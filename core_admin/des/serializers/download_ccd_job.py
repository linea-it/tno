from rest_framework import serializers
from des.models import DownloadCcdJob


class DownloadCcdJobSerializer(serializers.ModelSerializer):
    owner = serializers.SerializerMethodField()

    class Meta:
        model = DownloadCcdJob
        fields = (
            "id",
            "owner",
            "date_initial",
            "date_final",
            "dynclass",
            "name",
            "status",
            "start",
            "finish",
            "ccds_to_download",
            "ccds_downloaded",
            "nights",
            "asteroids",
            "estimated_execution_time",
            "execution_time",
            "estimated_t_size",
            "t_size_downloaded",
            "path",
            "error",
        )

    def get_owner(self, obj):
        try:
            return obj.owner.username
        except:
            return None
