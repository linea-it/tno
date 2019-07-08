from rest_framework import serializers
import humanize
from .models import Run, Configuration, AstrometryAsteroid, AstrometryInput, AstrometryOutput
from tno.models import CustomList, Proccess
from django.utils import timezone


class RunSerializer(serializers.ModelSerializer):
    owner = serializers.SerializerMethodField()

    configuration = serializers.PrimaryKeyRelatedField(
        queryset=Configuration.objects.all(), many=False)

    input_list = serializers.PrimaryKeyRelatedField(
        queryset=CustomList.objects.all(), many=False)

    start_time = serializers.SerializerMethodField()

    configuration_displayname = serializers.SerializerMethodField()

    input_displayname = serializers.SerializerMethodField()

    proccess = serializers.PrimaryKeyRelatedField(
        queryset=Proccess.objects.all(), many=False, required=False)

    proccess_displayname = serializers.SerializerMethodField()

    h_execution_time = serializers.SerializerMethodField()
    h_time = serializers.SerializerMethodField()

    class Meta:
        model = Run
        fields = (
            'id',
            'owner',
            'start_time',
            'finish_time',
            'configuration',
            'input_list',
            'status',
            'h_execution_time',
            'h_time',
            'configuration_displayname',
            'input_displayname',
            'proccess',
            'proccess_displayname',
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

    def get_input_displayname(self, obj):
        try:
            return obj.input_list.displayname
        except:
            return None

    def get_proccess_displayname(self, obj):
        try:
            return "%s - %s" % (obj.proccess.id, obj.input_list.displayname)
        except:
            return None

    def get_start_time(self, obj):
        try:
            return obj.start_time.strftime('%Y-%m-%d %H:%M:%S')
        except:
            return None

    def get_h_execution_time(self, obj):
        try:
            return humanize.naturaldelta(obj.execution_time)
        except:
            return None

    def get_h_time(self, obj):
        try:
            return humanize.naturaltime(timezone.now() - obj.start_time)
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


class AstrometryAsteroidSerializer(serializers.ModelSerializer):

    astrometry_run = serializers.PrimaryKeyRelatedField(
        queryset=Run.objects.all(), many=False)

    class Meta:
        model = AstrometryAsteroid
        fields = (
            'id',
            'astrometry_run',
            'name',
            'number',
            'status',
            'error_msg',
        )


class AstrometryInputSerializer(serializers.ModelSerializer):

    asteroid = serializers.PrimaryKeyRelatedField(
        queryset=AstrometryAsteroid.objects.all(), many=False)

    class Meta:
        model = AstrometryInput
        fields = (
            'id',
            'asteroid',
            'input_type',
            'filename',
            'file_size',
            'file_type',
            'file_path',
        )


class AstrometryOutputSerializer(serializers.ModelSerializer):

    asteroid = serializers.PrimaryKeyRelatedField(
        queryset=AstrometryAsteroid.objects.all(), many=False)

    class Meta:
        model = AstrometryOutput
        fields = (
            'id',
            'asteroid',
            'type',
            'filename',
            'file_size',
            'file_type',
            'file_path',
        )
