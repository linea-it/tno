from orbit.models import OrbitRun
from rest_framework import serializers
from tno.models import Proccess, CustomList
import humanize
from django.utils import timezone
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

    class Meta:
        model = OrbitRun
        fields = (
            'id',
            'owner',
            'start_time',
            'finish_time',
            'execution_time',
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
        return obj.start_time.strftime('%Y-%M-%d %H:%M:%S')

    def get_finish_time(self, obj):
        return obj.finish_time.strftime('%Y-%M-%d %H:%M:%S')

    def get_h_execution_time(self, obj):
        return humanize.naturaldelta(obj.execution_time)

    def get_h_time(self, obj):
        return humanize.naturaltime(timezone.now() - obj.start_time)
