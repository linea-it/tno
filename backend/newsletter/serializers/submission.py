from ..models import Submission
from rest_framework import serializers


class SubmissionSerializer(serializers.ModelSerializer):

    class Meta:
        model = Submission
        fields = "__all__"
