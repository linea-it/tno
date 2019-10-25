from rest_framework import serializers
from .models import *
from tno.models import Proccess, CustomList, Catalog
from orbit.models import OrbitRun
import humanize
from django.utils import timezone
from django.conf import settings
import urllib.parse
from datetime import datetime


class PredictRunSerializer(serializers.ModelSerializer):
    owner = serializers.SerializerMethodField()

    input_list = serializers.PrimaryKeyRelatedField(
        queryset=CustomList.objects.all(), many=False)

    input_displayname = serializers.SerializerMethodField()

    process = serializers.PrimaryKeyRelatedField(
        queryset=Proccess.objects.all(), many=False)

    process_displayname = serializers.SerializerMethodField()

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

    occultations = serializers.SerializerMethodField()

    class Meta:
        model = PredictRun
        fields = (
            'id',
            'owner',
            'process',
            'process_displayname',
            'catalog',
            'leap_second',
            'bsp_planetary',
            'ephemeris_initial_date',
            'ephemeris_final_date',
            'ephemeris_step',
            'catalog_radius',
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
            'execution_dates',
            'execution_ephemeris',
            'execution_catalog',
            'execution_search_candidate',
            'execution_maps',
            'execution_register',
            'count_objects',
            'count_success',
            'count_failed',
            'count_warning',
            'count_not_executed',
            'execution_seconds',
            'occultations'
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

    def get_process_displayname(self, obj):
        try:
            return "%s - %s" % (obj.process.id, obj.input_list.displayname)
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

    def get_occultations(self, obj):
        try:
            return Occultation.objects.filter(asteroid__predict_run=obj.pk).count()
        except:
            return None


class PredictAsteroidSerializer(serializers.ModelSerializer):
    predict_run = serializers.PrimaryKeyRelatedField(
        queryset=PredictRun.objects.all(), many=False)

    execution_time = serializers.SerializerMethodField()
    h_execution_time = serializers.SerializerMethodField()
    proccess_displayname = serializers.SerializerMethodField()

    occultations = serializers.SerializerMethodField()
    catalog = serializers.SerializerMethodField()
    planetary_ephemeris = serializers.SerializerMethodField()
    leap_second = serializers.SerializerMethodField()

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
            'catalog_rows',
            'execution_time',
            'h_execution_time',
            'start_ephemeris',
            'finish_ephemeris',
            'execution_ephemeris',
            'start_catalog',
            'finish_catalog',
            'execution_catalog',
            'start_search_candidate',
            'finish_search_candidate',
            'execution_search_candidate',
            'start_maps',
            'finish_maps',
            'execution_maps',
            'occultations',
            'catalog',
            'planetary_ephemeris',
            'leap_second',
        )

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

    def get_proccess_displayname(self, obj):
        try:
            return "%s - %s" % (obj.orbit_run.proccess.id, obj.orbit_run.input_list.displayname)
        except:
            return None

    def get_occultations(self, obj):
        try:
            return obj.occultation.count()
        except:
            return None

    def get_catalog(self, obj):
        try:
            return obj.predict_run.catalog.display_name
        except:
            return None

    def get_planetary_ephemeris(self, obj):
        try:
            return obj.predict_run.bsp_planetary.display_name
        except:
            return None

    def get_leap_second(self, obj):
        try:
            return obj.predict_run.leap_second.display_name
        except:
            return None


class PredictInputSerializer(serializers.ModelSerializer):
    asteroid = serializers.PrimaryKeyRelatedField(
        queryset=PredictAsteroid.objects.all(), many=False)

    h_size = serializers.SerializerMethodField()

    class Meta:
        model = PredictInput
        fields = (
            'id',
            'asteroid',
            'input_type',
            'filename',
            'file_size',
            'file_type',
            'file_path',
            'h_size',
        )

    def get_h_size(self, obj):
        try:
            return humanize.naturalsize(obj.file_size)
        except:
            return None


class PredictOutputSerializer(serializers.ModelSerializer):
    asteroid = serializers.PrimaryKeyRelatedField(
        queryset=PredictAsteroid.objects.all(), many=False)

    h_size = serializers.SerializerMethodField()
    src = serializers.SerializerMethodField()

    class Meta:
        model = PredictOutput
        fields = (
            'id',
            'asteroid',
            'type',
            'filename',
            'file_size',
            'file_type',
            # 'file_path',
            'h_size',
            'src'
        )

    def get_h_size(self, obj):
        try:
            return humanize.naturalsize(obj.file_size)
        except:
            return None

    def get_src(self, obj):
        try:
            return urllib.parse.urljoin(settings.MEDIA_URL, obj.file_path.strip('/'))
        except:
            return None


class OccultationSerializer(serializers.ModelSerializer):
    asteroid = serializers.PrimaryKeyRelatedField(
        queryset=PredictAsteroid.objects.all(), many=False)

    date_time = serializers.SerializerMethodField()
    src = serializers.SerializerMethodField()
    already_happened = serializers.SerializerMethodField()
    asteroid_name = serializers.SerializerMethodField()
    asteroid_number = serializers.SerializerMethodField()
    creation_date = serializers.SerializerMethodField()

    class Meta:
        model = Occultation
        fields = (
            'id',
            'asteroid',
            'asteroid_name',
            'asteroid_number',
            'date_time',
            'ra_star_candidate',
            'dec_star_candidate',
            'ra_target',
            'dec_target',
            'closest_approach',
            'position_angle',
            'velocity',
            'delta',
            'g',
            'j',
            'h',
            'k',
            'long',
            'loc_t',
            'off_ra',
            'off_dec',
            'proper_motion',
            'ct',
            'multiplicity_flag',
            'e_ra',
            'e_dec',
            'pmra',
            'pmdec',
            'src',
            'already_happened',
            'creation_date'
        )

    def get_date_time(self, obj):
        try:
            return datetime.strftime(obj.date_time, "%Y-%m-%d %H:%M:%S")
        except:
            return None

    def get_src(self, obj):
        try:
            return urllib.parse.urljoin(settings.MEDIA_URL, obj.file_path.strip('/'))
        except:
            return None

    def get_asteroid_name(self, obj):
        try:
            return obj.asteroid.name
        except:
            return None

    def get_asteroid_number(self, obj):
        try:
            return obj.asteroid.number
        except:
            return None

    def get_already_happened(self, obj):
        a = obj.date_time
        b = timezone.now()
        c = (a < b)
        return c

    def get_creation_date(self, obj):
        try:
            return obj.asteroid.predict_run.finish_time
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
