from rest_framework import serializers

from des.models import Ccd, Exposure, SkybotPosition
from skybot.models import Position


class SkybotPositionSerializer(serializers.ModelSerializer):

    position = serializers.PrimaryKeyRelatedField(
        queryset=Position.objects.all(), many=False
    )

    exposure = serializers.PrimaryKeyRelatedField(
        queryset=Exposure.objects.all(), many=False
    )

    expnum = serializers.SerializerMethodField()
    band = serializers.SerializerMethodField()

    ccd = serializers.PrimaryKeyRelatedField(queryset=Ccd.objects.all(), many=False)

    ccdnum = serializers.SerializerMethodField()

    number = serializers.SerializerMethodField()
    name = serializers.SerializerMethodField()
    dynclass = serializers.SerializerMethodField()
    ra = serializers.SerializerMethodField()
    dec = serializers.SerializerMethodField()
    raj2000 = serializers.SerializerMethodField()
    decj2000 = serializers.SerializerMethodField()
    mv = serializers.SerializerMethodField()
    errpos = serializers.SerializerMethodField()
    d = serializers.SerializerMethodField()
    dracosdec = serializers.SerializerMethodField()
    ddec = serializers.SerializerMethodField()
    dgeo = serializers.SerializerMethodField()
    dhelio = serializers.SerializerMethodField()
    phase = serializers.SerializerMethodField()
    solelong = serializers.SerializerMethodField()
    px = serializers.SerializerMethodField()
    py = serializers.SerializerMethodField()
    pz = serializers.SerializerMethodField()
    vx = serializers.SerializerMethodField()
    vy = serializers.SerializerMethodField()
    vz = serializers.SerializerMethodField()
    jdref = serializers.SerializerMethodField()
    ticket = serializers.SerializerMethodField()

    class Meta:
        model = SkybotPosition
        fields = (
            "id",
            "position",
            "exposure",
            "expnum",
            "band",
            "ccd",
            "ccdnum",
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

    def get_expnum(self, obj):
        try:
            return obj.exposure.expnum
        except:
            return None

    def get_band(self, obj):
        try:
            return obj.exposure.band
        except:
            return None

    def get_ccdnum(self, obj):
        try:
            return obj.ccd.ccdnum
        except:
            return None

    def get_number(self, obj):
        try:
            return obj.position.number
        except:
            return None

    def get_name(self, obj):
        try:
            return obj.position.name
        except:
            return None

    def get_dynclass(self, obj):
        try:
            return obj.position.dynclass
        except:
            return None

    def get_ra(self, obj):
        try:
            return obj.position.ra
        except:
            return None

    def get_dec(self, obj):
        try:
            return obj.position.dec
        except:
            return None

    def get_raj2000(self, obj):
        try:
            return obj.position.raj2000
        except:
            return None

    def get_decj2000(self, obj):
        try:
            return obj.position.decj2000
        except:
            return None

    def get_mv(self, obj):
        try:
            return obj.position.mv
        except:
            return None

    def get_errpos(self, obj):
        try:
            return obj.position.errpos
        except:
            return None

    def get_d(self, obj):
        try:
            return obj.position.d
        except:
            return None

    def get_dracosdec(self, obj):
        try:
            return obj.position.dracosdec
        except:
            return None

    def get_ddec(self, obj):
        try:
            return obj.position.ddec
        except:
            return None

    def get_dgeo(self, obj):
        try:
            return obj.position.dgeo
        except:
            return None

    def get_dhelio(self, obj):
        try:
            return obj.position.dhelio
        except:
            return None

    def get_phase(self, obj):
        try:
            return obj.position.phase
        except:
            return None

    def get_solelong(self, obj):
        try:
            return obj.position.solelong
        except:
            return None

    def get_px(self, obj):
        try:
            return obj.position.px
        except:
            return None

    def get_py(self, obj):
        try:
            return obj.position.py
        except:
            return None

    def get_pz(self, obj):
        try:
            return obj.position.pz
        except:
            return None

    def get_vx(self, obj):
        try:
            return obj.position.vx
        except:
            return None

    def get_vy(self, obj):
        try:
            return obj.position.vy
        except:
            return None

    def get_vz(self, obj):
        try:
            return obj.position.vz
        except:
            return None

    def get_jdref(self, obj):
        try:
            return obj.position.jdref
        except:
            return None

    def get_ticket(self, obj):
        try:
            return str(obj.position.ticket)
        except:
            return None
