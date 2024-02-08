from des.models import OrbitTraceJobStatus
from rest_framework import serializers


class OrbitTraceJobStatusSerializer(serializers.ModelSerializer):

    job = serializers.PrimaryKeyRelatedField(read_only=True)

    class Meta:
        model = OrbitTraceJobStatus
        fields = "__all__"
