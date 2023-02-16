from rest_framework import serializers
from des.models import OrbitTraceJob


class OrbitTraceJobSerializer(serializers.ModelSerializer):
    owner = serializers.SerializerMethodField()

    class Meta:
        model = OrbitTraceJob
        fields = (
            "id",
            "owner",
            "date_initial",
            "date_final",
            "status",
            "start",
            "end",
            "exec_time",
            "estimated_execution_time",
            "path",
            "results",
            "error",
        )

    def get_owner(self, obj):
        try:
            return obj.owner.username
        except:
            return None
