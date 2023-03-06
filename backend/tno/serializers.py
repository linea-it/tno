from skybot.models.position import Position
import humanize
from django.contrib.auth.models import User
from rest_framework import serializers

from tno.models import JohnstonArchive
from tno.models import Asteroid, Occultation, LeapSecond, BspPlanetary, Catalog, PredictionJob


class UserSerializer(serializers.ModelSerializer):
    class Meta:
        model = User
        fields = ("username",)


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
    class Meta:
        model = Occultation
        fields = (
            "id",
            "number",
            "name",
        )

class PredictionJobSerializer(serializers.ModelSerializer):
    class Meta:
        model = PredictionJob
        fields = '__all__'
