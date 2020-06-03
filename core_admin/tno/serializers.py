import humanize
from django.contrib.auth.models import User
from rest_framework import serializers

from .models import Pointing, CustomList, Proccess, Catalog, JohnstonArchive 
# from .models import SkybotOutput
# from .models import SkybotRun 
# from .models import CcdImage


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


# class SkybotRunSerializer(serializers.ModelSerializer):

#     owner = serializers.SerializerMethodField()
#     h_execution_time = serializers.SerializerMethodField()
#     start = serializers.SerializerMethodField()
#     finish = serializers.SerializerMethodField()
   

#     class Meta:
#         model = SkybotRun
#         fields = (
#             'id',
#             'owner',
#             'exposure',
#             'rows',
#             'start',
#             'finish',
#             'status',
#             'date_initial',
#             'date_final',
#             'type_run',
#             'ra_cent',
#             'dec_cent',
#             'ra_ul',
#             'dec_ul',
#             'ra_ur',
#             'dec_ur',
#             'ra_lr',
#             'dec_lr',
#             'ra_ll',
#             'dec_ll',
#             'radius',
#             'h_execution_time',
#             'execution_time',
#         )

#     def get_owner(self, obj):
#         try:
#             return obj.owner.username
#         except:
#             return None

#     def get_start(self, obj):
#         try:
#             return obj.start.strftime('%Y-%m-%d %H:%M:%S')
#         except:
#             return None

#     def get_finish(self, obj):
#         try:
#             return obj.finish.strftime('%Y-%m-%d %H:%M:%S')
#         except:
#             return None

#     def get_h_execution_time(self, obj):
#         try:
#             return humanize.naturaldelta(obj.execution_time)
#         except:
#             return None

#     def get_execution_time(self, obj):
#         try:
#             return obj.execution_time
#         except:
#             return None


# class SkybotOutputSerializer(serializers.ModelSerializer):

#     class Meta:
#         model = SkybotOutput
#         fields = (
#             'id',
#             'num',
#             'name',
#             'dynclass',
#             'ra',
#             'dec',
#             'raj2000',
#             'decj2000',
#             'mv',
#             'errpos',
#             'd',
#             'dracosdec',
#             'ddec',
#             'dgeo',
#             'dhelio',
#             'phase',
#             'solelong',
#             'px',
#             'py',
#             'pz',
#             'vx',
#             'vy',
#             'vz',
#             'jdref',
#         )


# class ObjectClassSerializer(serializers.ModelSerializer):
#     class Meta:
#         model = SkybotOutput
#         fields = ('dynclass',)


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


# class CcdImageSerializer(serializers.ModelSerializer):

#     class Meta:
#         model = CcdImage
#         fields = (
#             'id',
#             'pointing',
#             'desfile_id',
#             'filename',
#             'download_start_time',
#             'download_finish_time',
#             'download_time',
#             'file_size',
#         )
