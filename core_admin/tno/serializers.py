import humanize
from django.contrib.auth.models import User
from rest_framework import serializers

from .models import Pointing, SkybotOutput, CustomList, Proccess, Catalog, JohnstonArchive, SkybotRun


class UserSerializer(serializers.ModelSerializer):
    class Meta:
        model = User
        fields = ('username',)


class PointingSerializer(serializers.ModelSerializer):
    date_obs = serializers.SerializerMethodField()

    class Meta:
        model = Pointing
        fields = (
            'id',
            'pfw_attempt_id',
            'desfile_id',
            'nite',
            'date_obs',
            'expnum',
            'ccdnum',
            'band',
            'exptime',
            'cloud_apass',
            'cloud_nomad',
            't_eff',
            'crossra0',
            'radeg',
            'decdeg',
            'racmin',
            'racmax',
            'deccmin',
            'deccmax',
            'ra_cent',
            'dec_cent',
            'rac1',
            'rac2',
            'rac3',
            'rac4',
            'decc1',
            'decc2',
            'decc3',
            'decc4',
            'ra_size',
            'dec_size',
            'path',
            'filename',
            'compression',
            'downloaded',
        )

    def get_date_obs(self, obj):
        try:
            return obj.date_obs.strftime('%Y/%m/%d')
        except:
            return None

class SkybotRunSerializer(serializers.ModelSerializer):
    # date_obs = serializers.SerializerMethodField()

    class Meta:
        model = SkybotRun
        fields = (
            'owner',
            'exposure',
            'start',
            'finish',
            'status',
            'date_initial',
            'date_final',
            'type_run',
            'ra_cent',
            'dec_cent',
            'radius',
            'ra_ul',
            'dec_ul',
            'ra_ur',
            'dec_ur',
            'ra_lr',
            'dec_lr',
            'ra_ll',
            'dec_ll',
        )

    # def get_date_obs(self, obj):
    #     try:
    #         return obj.date_obs.strftime('%Y/%m/%d')
    #     except:
    #         return None

class SkybotOutputSerializer(serializers.ModelSerializer):
    pointing = serializers.PrimaryKeyRelatedField(
        queryset=Pointing.objects.all(), many=False)

    class Meta:
        model = SkybotOutput
        fields = (
            'id',
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


class ProccessSerializer(serializers.ModelSerializer):

    class Meta:
        model = Proccess
        fields = (
            'id',
            'owner',
            'start_time',
            'finish_time',
            'status',
        )


class CatalogSerializer(serializers.ModelSerializer):

    class Meta:
        model = Catalog
        fields = (
            'id',
            'name',
            'display_name',
            'schema',
            'tablename',
            'rows',
            'columns',
            'size'
        )


class JohnstonArchiveSerializer(serializers.ModelSerializer):

    class Meta:
        model = JohnstonArchive
        fields = (
            'id',
            'number',
            'name',
            'provisional_designation',
            'dynamical_class',
            'a',
            'e',
            'perihelion_distance',
            'aphelion_distance',
            'i',
            'diameter',
            'diameter_flag',
            'albedo',
            'b_r_mag',
            'taxon',
            'density',
            'known_components',
            'discovery',
            'updated',
        )
