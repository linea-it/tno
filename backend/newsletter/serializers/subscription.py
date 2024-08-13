from newsletter.models import Subscription
from rest_framework import serializers


class SubscriptionSerializer(serializers.ModelSerializer):
    email = serializers.EmailField(source="user.email")

    class Meta:
        model = Subscription
        exclude = ("user",)
