from rest_framework import serializers

from skybot.models.position import Position


class PositionSerializer(serializers.ModelSerializer):

    ticket = serializers.SerializerMethodField()

    class Meta:
        model = Position
        fields = (
            "id",
            "number",
            "name",
            "dynclass",
            "ra",
            "dec",
            "raj2000",
            "decj2000",
            "mv",
            "errpos",
            "d",
            "dracosdec",
            "ddec",
            "dgeo",
            "dhelio",
            "phase",
            "solelong",
            "px",
            "py",
            "pz",
            "vx",
            "vy",
            "vz",
            "jdref",
            "ticket",
        )

    def get_ticket(self, obj):
        try:
            return str(obj.ticket)
        except:
            return None
