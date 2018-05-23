from rest_framework import serializers

from django.contrib.auth.models import User
from .models import Pointing, SkybotOutput, CustomList
import humanize

class UserSerializer(serializers.ModelSerializer):
    class Meta:
        model = User
        fields = ('username',)


class SkybotOutputSerializer(serializers.ModelSerializer):

    pointing = serializers.PrimaryKeyRelatedField(
        queryset=Pointing.objects.all(), many=False)

    class Meta:
        model = SkybotOutput
        fields = (
            'pointing',
            'num',
            'name',
            'dynclass',
            'ra',
            'dec',
            'raj2000',
            'decj2000',
            'mv',
            'errpos',
            'd',
            'dracosdec',
            'ddec',
            'dgeo',
            'dhelio',
            'phase',
            'solelong',
            'px',
            'py',
            'pz',
            'vx',
            'vy',
            'vz',
            'jdref',
            'externallink',
            'expnum',
            'ccdnum',
            'band',
            )


class ObjectClassSerializer(serializers.ModelSerializer):
    class Meta:
        model = SkybotOutput
        fields = ('dynclass',)

class CustomListSerializer(serializers.ModelSerializer):
    owner = serializers.SerializerMethodField()
    creation_date = serializers.DateTimeField(read_only=True)
    h_size = serializers.SerializerMethodField()

    class Meta:
        model = CustomList
        fields = (
            'id',
            'owner',
            'displayname',
            'tablename',            
            'description',
            'database',
            'schema',
            'rows',
            'n_columns',
            'columns',
            'size',
            'creation_date',
            'creation_time',
            'sql',
            'sql_creation',            
            'filter_name',
            'filter_dynclass',
            'filter_magnitude',
            'filter_diffdatenights',
            'filter_morefilter',
            'status',
            'error_msg',
            'h_size',
        )

    def get_owner(self, obj):
        try:
            return obj.owner.username
        except:
            return None

    def get_h_size(self, obj):
        try:
            return humanize.naturalsize(obj.size)
        except:
            return None