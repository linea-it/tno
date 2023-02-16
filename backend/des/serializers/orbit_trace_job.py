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
            "submit_time",
            "start",
            "end",
            "exec_time",
            "estimated_execution_time",
            "bsp_planetary",
            "leap_seconds",
            "observatory_location",
            "match_radius",
            "expected_asteroids",
            "processed_asteroids",
            "filter_type",
            "filter_value",
            "count_asteroids",
            "count_ccds",
            "count_observations",
            "count_success",
            "count_failures",
            "parsl_init_blocks",
            "h_exec_time",
            "results",
            "error",
        )

    def get_owner(self, obj):
        try:
            return obj.owner.username
        except:
            return None
