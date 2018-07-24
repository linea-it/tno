from orbit.models import OrbitRun
from rest_framework import serializers
from tno.models import Proccess, CustomList


class OrbitRunSerializer(serializers.ModelSerializer):
    owner = serializers.SerializerMethodField()

    input_list = serializers.PrimaryKeyRelatedField(
        queryset=CustomList.objects.all(), many=False)

    input_displayname = serializers.SerializerMethodField()

    proccess = serializers.PrimaryKeyRelatedField(
        queryset=Proccess.objects.all(), many=False)

    proccess_displayname = serializers.SerializerMethodField()

    class Meta:
        model = OrbitRun
        fields = (
            'id',
            'owner',
            'start_time',
            'finish_time',
            'input_list',
            'status',
            'input_displayname',
            'proccess',
            'proccess_displayname'
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