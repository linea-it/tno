from orbit.models import OrbitRun, RefinedAsteroid, RefinedOrbit, RefinedOrbitInput, BspJplFile,ObservationFile
from rest_framework import serializers
from tno.models import Proccess, CustomList
import humanize
from django.utils import timezone
from django.conf import settings
import urllib.parse
from django.db.models import Sum
from datetime import datetime


class OrbitRunSerializer(serializers.ModelSerializer):
    owner = serializers.SerializerMethodField()

    input_list = serializers.PrimaryKeyRelatedField(
        queryset=CustomList.objects.all(), many=False)

    input_displayname = serializers.SerializerMethodField()

    proccess = serializers.PrimaryKeyRelatedField(
        queryset=Proccess.objects.all(), many=False)

    proccess_displayname = serializers.SerializerMethodField()

    start_time = serializers.SerializerMethodField()
    finish_time = serializers.SerializerMethodField()

    h_execution_time = serializers.SerializerMethodField()
    h_time = serializers.SerializerMethodField()

    execution_seconds = serializers.SerializerMethodField()

    class Meta:
        model = OrbitRun
        fields = (
            'id',
            'owner',
            'start_time',
            'finish_time',
            'execution_time',
            'execution_download_time',
            'execution_nima_time',
            'h_execution_time',
            'h_time',
            'average_time',
            'input_list',
            'status',
            'input_displayname',
            'proccess',
            'proccess_displayname',
            'count_objects',
            'count_executed',
            'count_not_executed',
            'count_success',
            'count_failed',
            'count_warning',
            'execution_seconds',
        )

    def get_owner(self, obj):
        try:
            return obj.owner.username
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
            return obj.start_time.strftime('%Y-%M-%d %H:%M:%S')
        except:
            return None

    def get_finish_time(self, obj):
        try:
            return obj.finish_time.strftime('%Y-%M-%d %H:%M:%S')
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

    def get_execution_seconds(self, obj):
        try:
            return obj.execution_time.total_seconds()
        except:
            return None


class RefinedAsteroidSerializer(serializers.ModelSerializer):
    orbit_run = serializers.PrimaryKeyRelatedField(
        queryset=OrbitRun.objects.all(), many=False)

    h_time = serializers.SerializerMethodField()
    execution_time = serializers.SerializerMethodField()
    h_execution_time = serializers.SerializerMethodField()
    h_size = serializers.SerializerMethodField()
    proccess_displayname = serializers.SerializerMethodField()

    class Meta:
        model = RefinedAsteroid
        fields = (
            'id',
            'orbit_run',
            'proccess_displayname',
            'name',
            'number',
            'status',
            'error_msg',
            'start_time',
            'finish_time',
            'execution_time',
            'h_time',
            'h_execution_time',
            'h_size'
        )

    def get_h_time(self, obj):
        try:
            return humanize.naturaltime(timezone.now() - obj.start_time)
        except:
            return None

    def get_execution_time(self, obj):
        try:
            return obj.execution_time.total_seconds()
        except:
            return None

    def get_h_execution_time(self, obj):
        try:
            return humanize.naturaldelta(obj.execution_time)
        except:
            return None

    def get_h_size(self, obj):
        try:
            total_size = obj.refined_orbit.aggregate(amount=Sum('file_size'))

            return humanize.naturalsize(total_size["amount"])
        except:
            return None

    def get_proccess_displayname(self, obj):
        try:
            return "%s - %s" % (obj.orbit_run.proccess.id, obj.orbit_run.input_list.displayname)
        except:
            return None


class RefinedOrbitSerializer(serializers.ModelSerializer):
    asteroid = serializers.PrimaryKeyRelatedField(
        queryset=RefinedAsteroid.objects.all(), many=False)

    src = serializers.SerializerMethodField()
    h_size = serializers.SerializerMethodField()

    class Meta:
        model = RefinedOrbit
        fields = (
            'id',
            'type',
            'asteroid',
            'filename',
            'file_size',
            'file_type',
            'src',
            'h_size'
        )

    def get_src(self, obj):
        try:
            media_url = settings.MEDIA_URL
            src = urllib.parse.urljoin(media_url, obj.relative_path.strip('/'))
            return src
        except:
            return None

    def get_h_size(self, obj):
        try:
            return humanize.naturalsize(obj.file_size)
        except:
            return None


class RefinedOrbitInputSerializer(serializers.ModelSerializer):
    asteroid = serializers.PrimaryKeyRelatedField(
        queryset=RefinedAsteroid.objects.all(), many=False)

    date_time = serializers.SerializerMethodField()

    class Meta:
        model = RefinedOrbitInput
        fields = (
            'id',
            'asteroid',
            'input_type',
            'source',
            'date_time',
            'filename',
        )

    def get_date_time(self, obj):
        try:
            return datetime.strftime(obj.date_time, "%Y-%m-%d %H:%M:%S")
        except:
            return None
from orbit.models import OrbitRun, RefinedAsteroid, RefinedOrbit, RefinedOrbitInput, BspJplFile, ObservationFile, OrbitalParameterFile
from rest_framework import serializers
from tno.models import Proccess, CustomList
import humanize
from django.utils import timezone
from django.conf import settings
import urllib.parse
from django.db.models import Sum
from datetime import datetime


class OrbitRunSerializer(serializers.ModelSerializer):
    owner = serializers.SerializerMethodField()

    input_list = serializers.PrimaryKeyRelatedField(
        queryset=CustomList.objects.all(), many=False)

    input_displayname = serializers.SerializerMethodField()

    proccess = serializers.PrimaryKeyRelatedField(
        queryset=Proccess.objects.all(), many=False)

    proccess_displayname = serializers.SerializerMethodField()

    start_time = serializers.SerializerMethodField()
    finish_time = serializers.SerializerMethodField()

    h_execution_time = serializers.SerializerMethodField()
    h_time = serializers.SerializerMethodField()

    execution_seconds = serializers.SerializerMethodField()

    class Meta:
        model = OrbitRun
        fields = (
            'id',
            'owner',
            'start_time',
            'finish_time',
            'execution_time',
            'execution_download_time',
            'execution_nima_time',
            'h_execution_time',
            'h_time',
            'average_time',
            'input_list',
            'status',
            'input_displayname',
            'proccess',
            'proccess_displayname',
            'count_objects',
            'count_executed',
            'count_not_executed',
            'count_success',
            'count_failed',
            'count_warning',
            'execution_seconds',
        )

    def get_owner(self, obj):
        try:
            return obj.owner.username
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
            return obj.start_time.strftime('%Y-%M-%d %H:%M:%S')
        except:
            return None

    def get_finish_time(self, obj):
        try:
            return obj.finish_time.strftime('%Y-%M-%d %H:%M:%S')
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

    def get_execution_seconds(self, obj):
        try:
            return obj.execution_time.total_seconds()
        except:
            return None


class RefinedAsteroidSerializer(serializers.ModelSerializer):
    orbit_run = serializers.PrimaryKeyRelatedField(
        queryset=OrbitRun.objects.all(), many=False)

    h_time = serializers.SerializerMethodField()
    execution_time = serializers.SerializerMethodField()
    h_execution_time = serializers.SerializerMethodField()
    h_size = serializers.SerializerMethodField()
    proccess_displayname = serializers.SerializerMethodField()

    class Meta:
        model = RefinedAsteroid
        fields = (
            'id',
            'orbit_run',
            'proccess_displayname',
            'name',
            'number',
            'status',
            'error_msg',
            'start_time',
            'finish_time',
            'execution_time',
            'h_time',
            'h_execution_time',
            'h_size'
        )

    def get_h_time(self, obj):
        try:
            return humanize.naturaltime(timezone.now() - obj.start_time)
        except:
            return None

    def get_execution_time(self, obj):
        try:
            return obj.execution_time.total_seconds()
        except:
            return None

    def get_h_execution_time(self, obj):
        try:
            return humanize.naturaldelta(obj.execution_time)
        except:
            return None

    def get_h_size(self, obj):
        try:
            total_size = obj.refined_orbit.aggregate(amount=Sum('file_size'))

            return humanize.naturalsize(total_size["amount"])
        except:
            return None

    def get_proccess_displayname(self, obj):
        try:
            return "%s - %s" % (obj.orbit_run.proccess.id, obj.orbit_run.input_list.displayname)
        except:
            return None


class RefinedOrbitSerializer(serializers.ModelSerializer):
    asteroid = serializers.PrimaryKeyRelatedField(
        queryset=RefinedAsteroid.objects.all(), many=False)

    src = serializers.SerializerMethodField()
    h_size = serializers.SerializerMethodField()

    class Meta:
        model = RefinedOrbit
        fields = (
            'id',
            'type',
            'asteroid',
            'filename',
            'file_size',
            'file_type',
            'src',
            'h_size'
        )

    def get_src(self, obj):
        try:
            media_url = settings.MEDIA_URL
            src = urllib.parse.urljoin(media_url, obj.relative_path.strip('/'))
            return src
        except:
            return None

    def get_h_size(self, obj):
        try:
            return humanize.naturalsize(obj.file_size)
        except:
            return None


class RefinedOrbitInputSerializer(serializers.ModelSerializer):
    asteroid = serializers.PrimaryKeyRelatedField(
        queryset=RefinedAsteroid.objects.all(), many=False)

    date_time = serializers.SerializerMethodField()

    class Meta:
        model = RefinedOrbitInput
        fields = (
            'id',
            'asteroid',
            'input_type',
            'source',
            'date_time',
            'filename',
        )

    def get_date_time(self, obj):
        try:
            return datetime.strftime(obj.date_time, "%Y-%m-%d %H:%M:%S")
        except:
            return None


class BspJplSerializer(serializers.ModelSerializer):

    class Meta:
        model = BspJplFile
        fields = (
            'name',
            'filename',
            'download_start_time',
            'download_finish_time',
            'file_size',
        )

class ObservationFileSerializer(serializers.ModelSerializer):

    class Meta:
        model = ObservationFile
        fields = (
            'id',
            'name',
            'source',
            'observations',
            'filename',
            'download_start_time',
            'download_finish_time',
            'file_size',
            'external_url',
            'download_url',
        )    


class OrbitalParameterSerializer(serializers.ModelSerializer):

    class Meta:
        model = OrbitalParameterFile
        fields = (
            'name',
            'source',
            'filename',
            'download_start_time',
            'download_finish_time',
            'file_size',
            'external_url',
            'download_url',
        )   


        
