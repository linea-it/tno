from rest_framework import serializers
from des.models import AstrometryJob


class AstrometryJobSerializer(serializers.ModelSerializer):
    owner = serializers.SerializerMethodField()

    class Meta:
        model = AstrometryJob
        fields = (
            "id",
            "owner",
            "asteroids",
            "dynclass",
            "status",
            "start",
            "finish",
            "execution_time",
            "estimated_execution_time",
            "t_asteroids",
            "path",
            "error",
        )
        read_only_fields = (
            "id",
            "status",
            "start",
            "finish",
            "execution_time",
            "estimated_execution_time",
            "t_asteroids",
            "path",
            "error",
        )

    def get_owner(self, obj):
        try:
            return obj.owner.username
        except:
            return None
