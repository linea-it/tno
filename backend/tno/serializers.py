from skybot.models.position import Position
import humanize
from django.contrib.auth.models import User
from rest_framework import serializers

from tno.models import JohnstonArchive
from tno.models import Asteroid, Occultation, LeapSecond, BspPlanetary, Catalog, PredictionJob, PredictionJobResult, PredictionJobStatus


class UserSerializer(serializers.ModelSerializer):
    dashboard = serializers.SerializerMethodField()
    class Meta:
        model = User
        fields = ("username", "dashboard")

    def get_dashboard(self, obj):
        if hasattr(obj, 'profile'):
            return obj.profile.dashboard
        else:
            return False


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
    dynclass = serializers.CharField(source='asteroid.dynclass')
    class Meta:
        model = Occultation
        fields = (
            "id",
            "number",
            "name",
            "dynclass",
            "date_time",
            "ra_star_deg",
            "dec_star_deg",
            "ra_target_deg",
            "dec_target_deg",
            "ra_star_candidate",
            "dec_star_candidate",
            "closest_approach",
            "position_angle",
            "velocity",
            "delta",
            "g",
        )

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
    class Meta:
        model = PredictionJobResult
        fields = '__all__'

class PredictionJobStatusSerializer(serializers.ModelSerializer):
    class Meta:
        model = PredictionJobStatus
        fields = '__all__'