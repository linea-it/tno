from django.contrib import admin

from tno.models import JohnstonArchive
from tno.models import Asteroid
from tno.models import BspPlanetary
from tno.models import LeapSecond
from tno.models import Occultation
from tno.models import Catalog
from tno.models import PredictionJob, PredictionJobResult


@admin.register(Asteroid)
class AsteroidAdmin(admin.ModelAdmin):
    list_display = (
        "id",
        "name",
        "number",
        "base_dynclass",
        "dynclass",
    )
    search_fields = (
        "name",
        "number",
    )


@admin.register(Occultation)
class OccultationAdmin(admin.ModelAdmin):
    list_display = (
        "id",
        "asteroid",
        "date_time",
        "ra_star_deg",
        "dec_star_deg",
        "ra_target_deg",
        "dec_target_deg",
    )
    search_fields = ("name", "number")

    # Troca o tipo de imput de Select para um text field com botao de busca
    # para os campos de chave estrangeira que tem milhares de registros e causa tavamento da interface
    raw_id_fields = ("asteroid",)


@admin.register(JohnstonArchive)
class JohnstonArchiveAdmin(admin.ModelAdmin):
    list_display = (
        "id",
        "number",
        "name",
        "provisional_designation",
        "dynamical_class",
        "diameter",
        "density",
        "updated",
    )


@admin.register(LeapSecond)
class LeapSecondAdmin(admin.ModelAdmin):
    list_display = (
        "name",
        "display_name",
        "url",
    )
    search_fields = ("name", "display_name")


@admin.register(BspPlanetary)
class BspPlanetaryAdmin(admin.ModelAdmin):
    list_display = (
        "name",
        "display_name",
        "url",
    )
    search_fields = ("name", "display_name")

@admin.register(Catalog)
class CatalogAdmin(admin.ModelAdmin):
    list_display = (
        "name",
        "display_name",
        "database",
        "schema",
        "tablename",
        "ra_property",
        "dec_property",
        "registration_date"
    )
    search_fields = ("name", "display_name")


@admin.register(PredictionJob)
class PredictionJobAdmin(admin.ModelAdmin):
    list_display = (
        "id",
        "status",
        "predict_start_date",
        "predict_end_date",
        "filter_type",
        "filter_value",
        "catalog"
    )


@admin.register(PredictionJobResult)
class PredictionJobResultAdmin(admin.ModelAdmin):
    list_display = (
        "id",
        "job",
        "asteroid",
    )