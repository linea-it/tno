from django.contrib.auth.models import User
from rest_framework import serializers
from tno.models import (
    Asteroid,
    AsteroidJob,
    BspPlanetary,
    Catalog,
    JohnstonArchive,
    LeapSecond,
    Occultation,
    PredictionJob,
    PredictionJobResult,
    Profile,
)


class UserSerializer(serializers.ModelSerializer):
    dashboard = serializers.SerializerMethodField()

    class Meta:
        model = User
        fields = ("username", "dashboard")

    def get_dashboard(self, obj):
        if hasattr(obj, "profile"):
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
        fields = "__all__"


class BspPlanetarySerializer(serializers.ModelSerializer):
    class Meta:
        model = BspPlanetary
        fields = "__all__"


class CatalogSerializer(serializers.ModelSerializer):
    class Meta:
        model = Catalog
        fields = ("id", "name", "display_name")


class AsteroidJobSerializer(serializers.ModelSerializer):
    class Meta:
        model = AsteroidJob
        fields = "__all__"


class AsteroidSerializer(serializers.ModelSerializer):
    class Meta:
        model = Asteroid
        fields = "__all__"


class OccultationSerializer(serializers.ModelSerializer):
    id = serializers.SerializerMethodField()
    map_url = serializers.SerializerMethodField()

    class Meta:
        model = Occultation
        exclude = (
            "hash_id",
            "occ_path_min_longitude",
            "occ_path_max_longitude",
            "occ_path_min_latitude",
            "occ_path_max_latitude",
        )

    def get_id(self, obj):
        if obj.hash_id != None:
            return obj.hash_id
        else:
            return obj.id

    def get_map_url(self, obj):
        relative_url = obj.get_map_relative_url()
        if not relative_url:
            return None

        # Attempt to use request if available; otherwise, return relative URL
        request = self.context.get("request")
        return request.build_absolute_uri(relative_url) if request else relative_url


class PredictionJobSerializer(serializers.ModelSerializer):
    owner = serializers.SerializerMethodField()

    class Meta:
        model = PredictionJob
        fields = "__all__"

    def get_owner(self, obj):
        try:
            return obj.owner.username
        except:
            return None


class PredictionJobResultSerializer(serializers.ModelSerializer):
    predict_start_date = serializers.DateField(source="job.predict_start_date")
    predict_end_date = serializers.DateField(source="job.predict_end_date")
    status_name = serializers.SerializerMethodField()

    class Meta:
        model = PredictionJobResult
        fields = "__all__"

    def get_status_name(self, obj):
        if obj.status == 1:
            return "Success"
        elif obj.status == 2:
            return "Failed"
        elif obj.status == 3:
            return "Queued"
        elif obj.status == 4:
            return "Running"
        elif obj.status == 5:
            return "Aborted"
        else:
            return "Unknown"
