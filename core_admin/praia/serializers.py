from rest_framework import serializers
import humanize
from .models import Run, Configuration, AstrometryAsteroid, AstrometryInput, AstrometryOutput
from tno.models import CustomList, Proccess, Catalog
from django.utils import timezone


class RunSerializer(serializers.ModelSerializer):
    owner = serializers.SerializerMethodField()

    configuration = serializers.PrimaryKeyRelatedField(
        queryset=Configuration.objects.all(), many=False)

    input_list = serializers.PrimaryKeyRelatedField(
        queryset=CustomList.objects.all(), many=False)

    catalog = serializers.PrimaryKeyRelatedField(
        queryset=Catalog.objects.all(), many=False)

    catalog_name = serializers.SerializerMethodField()

    start_time = serializers.SerializerMethodField()

    finish_time = serializers.SerializerMethodField()

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
            'execution_time',
            'configuration',
            'catalog',
            'catalog_name',
            'input_list',
            'count_objects',
            'status',
            'h_execution_time',
            'h_time',
            'configuration_displayname',
            'input_displayname',
            'proccess',
            'proccess_displayname',
            'count_success',
            'count_failed',
            'count_warning',
            'count_not_executed',
            'step'
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

    def get_catalog_name(self, obj):
        try:
            return obj.catalog.display_name
        except:
            return None

    def get_start_time(self, obj):
        try:
            return obj.start_time.strftime('%Y-%m-%d %H:%M:%S')
        except:
            return None

    def get_finish_time(self, obj):
        try:
            return obj.finish_time.strftime('%Y-%m-%d %H:%M:%S')
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

    def get_catalog_name(self, obj):
        try:
            return obj.catalog.display_name

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

    proccess_displayname = serializers.SerializerMethodField()

    catalog_name = serializers.SerializerMethodField()

    h_execution_time = serializers.SerializerMethodField()

    class Meta:
        model = AstrometryAsteroid
        fields = (
            'id',
            'astrometry_run',
            'proccess_displayname',
            'name',
            'number',
            'status',
            'error_msg',
            'ccd_images',
            'catalog_rows',
            'execution_time',
            'catalog_name',
            'h_execution_time',
        )

    def get_proccess_displayname(self, obj):
        try:
            return "%s - %s" % (obj.astrometry_run.proccess.id, obj.astrometry_run.input_list.displayname)
        except:
            return None

    def get_catalog_name(self, obj):
        try:
            return obj.astrometry_run.catalog.display_name

        except:
            return None

    def get_h_execution_time(self, obj):
        try:
            return humanize.naturaldelta(obj.execution_time)
        except:
            return None



class AstrometryInputSerializer(serializers.ModelSerializer):

    asteroid = serializers.PrimaryKeyRelatedField(
        queryset=AstrometryAsteroid.objects.all(), many=False)

    h_file_size = serializers.SerializerMethodField()

    execution_time = serializers.SerializerMethodField()

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
            'h_file_size',
            'execution_time',
        )

    def get_h_file_size(self, obj):
        try:
            return humanize.naturalsize(obj.file_size)
        except:
            return None

    def get_execution_time(self, obj):
        try:
            return humanize.naturaldelta(obj.execution_time)
        except:
            return None


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
