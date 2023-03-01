from rest_framework import serializers
from des.models import OrbitTraceJobResult


class OrbitTraceJobResultSerializer(serializers.ModelSerializer):
    owner = serializers.SerializerMethodField()

    class Meta:
        model = OrbitTraceJobResult
        fields = (
            "id",
            "job",
            "asteroid",
            "asteroid_name",
            "asteroid_number",
            "base_dynclass",
            "dynclass",
            "status",
            "spk_id",
            "observations",
            "ccds",
            "error",
        )

    def get_owner(self, obj):
        try:
            return obj.job.owner.username
        except:
            return None
