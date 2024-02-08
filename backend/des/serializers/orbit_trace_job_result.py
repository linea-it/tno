from des.models import OrbitTraceJobResult
from rest_framework import serializers


class OrbitTraceJobResultSerializer(serializers.ModelSerializer):

    job = serializers.PrimaryKeyRelatedField(read_only=True)
    asteroid = serializers.PrimaryKeyRelatedField(read_only=True)

    class Meta:
        model = OrbitTraceJobResult
        fields = (
            "id",
            "job",
            "asteroid",
            "name",
            "number",
            "base_dynclass",
            "dynclass",
            "status",
            "spk_id",
            "observations",
            "ccds",
            "exec_time",
            "error",
        )
