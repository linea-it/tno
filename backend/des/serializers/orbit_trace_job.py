from rest_framework import serializers
from des.models import OrbitTraceJob


class OrbitTraceJobSerializer(serializers.ModelSerializer):
    owner = serializers.SerializerMethodField()

    class Meta:
        model = OrbitTraceJob
        fields = (
            "id",
            "owner",
            "status",
            "submit_time",
            "start",
            "end",
            "exec_time",
            "estimated_execution_time",
            "bsp_planetary",
            "leap_seconds",
            "match_radius",
            "filter_type",
            "filter_value",
            "count_asteroids",
            "count_ccds",
            "count_observations",
            "count_success",
            "count_failures",
            "parsl_init_blocks",
            "h_exec_time",
            "bps_days_to_expire",
            "debug",
            "time_profile",
            "path",
            "error",
            "traceback",
        )

    def get_owner(self, obj):
        try:
            return obj.owner.username
        except:
            return None