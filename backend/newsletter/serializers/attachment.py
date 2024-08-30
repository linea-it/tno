from rest_framework import serializers

from ..models import Attachment


class AttachmentSerializer(serializers.ModelSerializer):

    class Meta:
        model = Attachment
        fields = "__all__"
