from rest_framework import serializers
from des.models import OrbitTraceJobResult


class OrbitTraceJobResultSerializer(serializers.ModelSerializer):
    
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
