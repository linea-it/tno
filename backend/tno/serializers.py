import humanize
from django.contrib.auth.models import User
from rest_framework import serializers
from skybot.models.position import Position

from tno.models import (Asteroid, BspPlanetary, Catalog, JohnstonArchive,
                        LeapSecond, Occultation, PredictionJob,
                        PredictionJobResult, PredictionJobStatus, Profile)


class UserSerializer(serializers.ModelSerializer):
    dashboard = serializers.SerializerMethodField()

    class Meta:
        model = User
        fields = ("username", "dashboard")

    def get_dashboard(self, obj):
        if hasattr(obj, 'profile'):
            return obj.profile.dashboard
        else:
            # creating a new profile if the user does not have one
            profile = Profile(user_id=obj.id, dashboard=False)
            profile.save()
            return profile.dashboard


class JohnstonArchiveSerializer(serializers.ModelSerializer):
    class Meta:
        model = JohnstonArchive
        fields = (
            "id",
            "number",
            "name",
            "provisional_designation",
            "dynamical_class",
            "a",
            "e",
            "perihelion_distance",
            "aphelion_distance",
            "i",
            "diameter",
            "diameter_flag",
            "albedo",
            "b_r_mag",
            "taxon",
            "density",
            "known_components",
            "discovery",
            "updated",
        )


class LeapSecondSerializer(serializers.ModelSerializer):
    class Meta:
        model = LeapSecond
        fields = '__all__'


class BspPlanetarySerializer(serializers.ModelSerializer):
    class Meta:
        model = BspPlanetary
        fields = '__all__'


class CatalogSerializer(serializers.ModelSerializer):
    class Meta:
        model = Catalog
        fields = (
            "id",
            "name",
            "display_name"
        )


class AsteroidSerializer(serializers.ModelSerializer):
    class Meta:
        model = Asteroid
        fields = (
            "id",
            "number",
            "name",
            "base_dynclass",
            "dynclass",
        )


class OccultationSerializer(serializers.ModelSerializer):
    # dynclass = serializers.CharField(source='asteroid.dynclass')
    # base_dynclass = serializers.CharField(source='asteroid.base_dynclass')
    alias = serializers.SerializerMethodField()
    map_url = serializers.SerializerMethodField()
    
    class Meta:
        model = Occultation
        exclude = (
            'occ_path_min_longitude', 
            'occ_path_max_longitude', 
            'occ_path_min_latitude', 
            'occ_path_max_latitude')

    def get_alias(self, obj):
        return obj.get_alias()

    def get_map_url(self, obj):
        request = self.context.get("request")
        relative_url = obj.get_map_relative_url()
        if relative_url == None:
            return None
        # Convert to absolute url
        return request.build_absolute_uri(relative_url)


class PredictionJobSerializer(serializers.ModelSerializer):
    owner = serializers.SerializerMethodField()
    class Meta:
        model = PredictionJob
        fields = '__all__'

    def get_owner(self, obj):
        try:
            return obj.owner.username
        except:
            return None


class PredictionJobResultSerializer(serializers.ModelSerializer):
    predict_start_date = serializers.DateField(source='job.predict_start_date')
    predict_end_date = serializers.DateField(source='job.predict_end_date')
    class Meta:
        model = PredictionJobResult
        fields = '__all__'


class PredictionJobStatusSerializer(serializers.ModelSerializer):
    class Meta:
        model = PredictionJobStatus
        fields = '__all__'
