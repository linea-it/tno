from rest_framework import serializers

from .models import Run, Configuration

class RunSerializer(serializers.ModelSerializer):
    owner = serializers.SerializerMethodField()
    configuration = serializers.PrimaryKeyRelatedField(
        queryset=Configuration.objects.all(), many=False)
    configuration_displayname = serializers.SerializerMethodField()

    class Meta:
        model = Run
        fields = (
            'id',
            'owner',
            'start_time',
            'finish_time',
            'configuration',
            'status',
            'configuration_displayname'
            )

    def get_owner(self, obj):
        try:
            return obj.owner.username
        except:
            return None

    def get_configuration_displayname(self, obj):
        try:
            return obj.configuration.displayname
        except:
            return None


class ConfigurationSerializer(serializers.ModelSerializer):
    owner = serializers.SerializerMethodField()

    class Meta:
        model = Configuration
        fields = (
            'id',
            'owner',
            'creation_date',
            'displayname',
            )

    def get_owner(self, obj):
        try:
            return obj.owner.username
        except:
            return None