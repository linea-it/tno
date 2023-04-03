from rest_framework import serializers
from des.models import OrbitTraceJobResult


class OrbitTraceJobResultSerializer(serializers.ModelSerializer):
    
    job = serializers.PrimaryKeyRelatedField()
    asteroid = serializers.PrimaryKeyRelatedField()

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
            "error",
        )
