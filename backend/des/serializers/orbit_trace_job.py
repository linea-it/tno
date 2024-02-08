from des.models import OrbitTraceJob
from rest_framework import serializers


class OrbitTraceJobSerializer(serializers.ModelSerializer):
    owner = serializers.SerializerMethodField()

    class Meta:
        model = OrbitTraceJob
        fields = "__all__"

    def get_owner(self, obj):
        try:
            return obj.owner.username
        except:
            return None
