from django.contrib import admin
from tno.models import (
    Asteroid,
    AsteroidCache,
    AsteroidJob,
    BspPlanetary,
    Catalog,
    DynclassCache,
    Highlights,
    JohnstonArchive,
    LeapSecond,
    Occultation,
    PredictionJob,
    PredictionJobResult,
    PredictionJobStatus,
    Profile,
)


@admin.register(Profile)
class ProfileAdmin(admin.ModelAdmin):
    list_display = (
        "user",
        "dashboard",
    )

    raw_id_fields = ("user",)


@admin.register(AsteroidJob)
class AsteroidJobAdmin(admin.ModelAdmin):
    list_display = (
        "id",
        "status",
        "start",
        "end",
        "exec_time",
        "asteroids_before",
        "asteroids_after",
        "new_records",
        "error",
    )


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


@admin.register(AsteroidCache)
class AsteroidCacheAdmin(admin.ModelAdmin):
    list_display = ("id", "name", "number", "principal_designation", "alias")
    search_fields = ("name", "number", "principal_designation")


@admin.register(DynclassCache)
class DynclassCacheCacheAdmin(admin.ModelAdmin):
    list_display = (
        "id",
        "skybot_dynbaseclass",
        "skybot_dynsubclass",
    )
    search_fields = (
        "skybot_dynbaseclass",
        "skybot_dynsubclass",
    )


@admin.register(Occultation)
class OccultationAdmin(admin.ModelAdmin):
    list_display = (
        "id",
        "name",
        "date_time",
        "ra_star_deg",
        "dec_star_deg",
        "ra_target_deg",
        "dec_target_deg",
        "created_at",
    )
    search_fields = ("name", "number")

    # Troca o tipo de imput de Select para um text field com botao de busca
    # para os campos de chave estrangeira que tem milhares de registros e causa tavamento da interface
    # raw_id_fields = ("asteroid",)


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
        "registration_date",
    )
    search_fields = ("name", "display_name")


@admin.register(PredictionJob)
class PredictionJobAdmin(admin.ModelAdmin):
    list_display = (
        "id",
        "status",
        "predict_start_date",
        "predict_end_date",
        "predict_interval",
        "filter_type",
        "filter_value",
        "count_asteroids",
        "count_occ",
        "count_success",
        "count_failures",
        "avg_exec_time",
        "exec_time",
    )


@admin.register(PredictionJobResult)
class PredictionJobResultAdmin(admin.ModelAdmin):
    list_display = (
        "id",
        "job",
    )

    # Troca o tipo de input de Select para um text field com botao de busca
    # para os campos de chave estrangeira que tem milhares de registros e causa tavamento da interface
    raw_id_fields = ("job",)


@admin.register(Highlights)
class HighlightsAdmin(admin.ModelAdmin):
    list_display = (
        "month_count",
        "next_month_count",
        "week_count",
        "next_week_count",
        "day_count",
        "unique_asteroids",
        "occultations_count",
        "earliest_occultation",
        "latest_occultation",
        "created_at",
    )
