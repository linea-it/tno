from rest_framework import serializers

from .models import Run, Configuration

class RunSerializer(serializers.ModelSerializer):

    configuration = serializers.PrimaryKeyRelatedField(
        queryset=Configuration.objects.all(), many=False)

    class Meta:
        model = Run
        fields = (
            'id',
            'owner',
            'start_time',
            'finish_time',
            'configuration'
            )

class ConfigurationSerializer(serializers.ModelSerializer):

    class Meta:
        model = Configuration
        fields = (
            'id',
            'owner',
            'creation_date',
            'displayname',
            )
