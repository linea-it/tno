from rest_framework import serializers
from predict_occultation.models import PredictionTask
from predict_occultation.models import PredictionAttempt
from predict_occultation.models import WorkersHeartbeat


class PredictionTaskSerializer(serializers.ModelSerializer):
    class Meta:
        model = PredictionTask
        fields = '__all__'



class PredictionAttemptSerializer(serializers.ModelSerializer):
    class Meta:
        model = PredictionAttempt
        fields = '__all__'

class PredictionTaskDetailSerializer(serializers.ModelSerializer):

    attempts = PredictionAttemptSerializer(many=True)
    class Meta:
        model = PredictionTask
        fields = '__all__'        


class WorkersHeartbeatSerializer(serializers.ModelSerializer):
    status = serializers.SerializerMethodField()
    name = serializers.SerializerMethodField()
    class Meta:
        model = WorkersHeartbeat
        fields = '__all__'        

    def get_status(self, obj):
        return obj.status()
    
    def get_name(self, obj):
        return obj.get_worker_display()