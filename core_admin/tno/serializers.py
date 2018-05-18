from rest_framework import serializers

from django.contrib.auth.models import User
from .models import Pointing, SkybotOutput, CustomList

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
    class Meta:
        model = CustomList
        fields = (
            'displayname',
            'description',
            'database',
            'schema',
            'tablename',
            'rows',
            'columns',
            'size',
            'creation_date',
            'sql',
            'sql_creation'
        )
