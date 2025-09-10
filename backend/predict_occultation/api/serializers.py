from rest_framework import serializers
from predict_occultation.models import PredictionTask
from predict_occultation.models import PredictionAttempt


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