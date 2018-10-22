from rest_framework import serializers
from .models import PredictRun, PredictAsteroid, LeapSecond, BspPlanetary
from tno.models import Proccess, CustomList, Catalog
from orbit.models import OrbitRun
import humanize
from django.utils import timezone

class PredictRunSerializer(serializers.ModelSerializer):
    owner = serializers.SerializerMethodField()

    input_list = serializers.PrimaryKeyRelatedField(
        queryset=CustomList.objects.all(), many=False)

    input_displayname = serializers.SerializerMethodField()

    proccess = serializers.PrimaryKeyRelatedField(
        queryset=Proccess.objects.all(), many=False)

    proccess_displayname = serializers.SerializerMethodField()

    catalog = serializers.PrimaryKeyRelatedField(
        queryset=Catalog.objects.all(), many=False)

    leap_second = serializers.PrimaryKeyRelatedField(
        queryset=LeapSecond.objects.all(), many=False)

    bsp_planetary = serializers.PrimaryKeyRelatedField(
        queryset=BspPlanetary.objects.all(), many=False)

    input_orbit = serializers.PrimaryKeyRelatedField(
        queryset=OrbitRun.objects.all(), many=False)

    start_time = serializers.SerializerMethodField()
    finish_time = serializers.SerializerMethodField()

    h_execution_time = serializers.SerializerMethodField()
    h_time = serializers.SerializerMethodField()

    execution_seconds = serializers.SerializerMethodField()

    class Meta:
        model = PredictRun
        fields = (
            'id',
            'owner',
            'proccess',
            'proccess_displayname',
            'catalog',
            'leap_second',
            'bsp_planetary',
            'start_time',
            'finish_time',
            'execution_time',
            'h_execution_time',
            'h_time',
            'average_time',
            'input_list',
            'input_orbit',
            'status',
            'input_displayname',
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


class PredictAsteroidSerializer(serializers.ModelSerializer):
    predict_run = serializers.PrimaryKeyRelatedField(
        queryset=PredictRun.objects.all(), many=False)

    h_time = serializers.SerializerMethodField()
    h_execution_time = serializers.SerializerMethodField()
    h_size = serializers.SerializerMethodField()
    proccess_displayname = serializers.SerializerMethodField()

    class Meta:
        model = PredictAsteroid
        fields = (
            'id',
            'predict_run',
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

class LeapSecondsSerializer(serializers.ModelSerializer):

    class Meta:
        model = LeapSecond
        fields = (
            'id',
            'name',
            'display_name',
            'url',
            'upload',
        )

class BspPlanetarySerializer(serializers.ModelSerializer):

    class Meta:
        model = BspPlanetary
        fields = (
            'id',
            'name',
            'display_name',
            'url',
            'upload',
        )
