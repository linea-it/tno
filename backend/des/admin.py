from django.contrib import admin

from .models import (
    Ccd,
    Exposure,
    SkybotJob,
    OrbitTraceJob,
    OrbitTraceJobResult,
    SkybotJobResult,
    SkybotPosition,
    SummaryDynclass,
    SkybotByYear,
    SkybotByDynclass,
    Observation,
)


@admin.register(Exposure)
class ExposureAdmin(admin.ModelAdmin):
    list_display = (
        "id",
        "nite",
        "date_obs",
        "pfw_attempt_id",
        "radeg",
        "decdeg",
        "exptime",
        "cloud_apass",
        "cloud_nomad",
        "t_eff",
        "release",
    )

    search_fields = ("id",)
    # This will help you to disbale add functionality
    def has_add_permission(self, request):
        return False

    # This will help you to disable delete functionaliyt
    def has_delete_permission(self, request, obj=None):
        return False

    # This will help you to disable the save buttons
    def changeform_view(self, request, object_id=None, form_url="", extra_context=None):
        extra_context = extra_context or {}
        extra_context["show_save_and_continue"] = False
        extra_context["show_save"] = False
        return super(ExposureAdmin, self).changeform_view(
            request, object_id, extra_context=extra_context
        )


@admin.register(Ccd)
class CcdAdmin(admin.ModelAdmin):
    list_display = (
        "id",
        "exposure",
        "ccdnum",
        "ra_cent",
        "dec_cent",
        "filename",
        "compression",
    )

    search_fields = (
        "id",
        "filename",
    )

    # This will help you to disbale add functionality
    def has_add_permission(self, request):
        return False

    # This will help you to disable delete functionaliyt
    def has_delete_permission(self, request, obj=None):
        return False

    # This will help you to disable the save buttons
    def changeform_view(self, request, object_id=None, form_url="", extra_context=None):
        extra_context = extra_context or {}
        extra_context["show_save_and_continue"] = False
        extra_context["show_save"] = False
        return super(CcdAdmin, self).changeform_view(
            request, object_id, extra_context=extra_context
        )

    # Troca o tipo de imput de Select para um text field com botao de busca
    # para os campos de chave estrangeira que tem milhares de registros e causa tavamento da interface
    raw_id_fields = ("exposure",)


@admin.register(SkybotPosition)
class SkybotPositionAdmin(admin.ModelAdmin):
    list_display = (
        "id",
        "position",
        "exposure",
        "ccd",
    )

    # Troca o tipo de imput de Select para um text field com botao de busca
    # para os campos de chave estrangeira que tem milhares de registros e causa tavamento da interface
    raw_id_fields = ("position", "ccd", "exposure")

    # Busca pelo nome do Asteroid
    search_fields = ("position__name",)

    # This will help you to disbale add functionality
    def has_add_permission(self, request):
        return False

    # This will help you to disable delete functionaliyt
    def has_delete_permission(self, request, obj=None):
        return False

    # This will help you to disable the save buttons
    def changeform_view(self, request, object_id=None, form_url="", extra_context=None):
        extra_context = extra_context or {}
        extra_context["show_save_and_continue"] = False
        extra_context["show_save"] = False
        return super(SkybotPositionAdmin, self).changeform_view(
            request, object_id, extra_context=extra_context
        )


@admin.register(SkybotJob)
class SkybotJobAdmin(admin.ModelAdmin):
    list_display = (
        "id",
        "status",
        "owner",
        "date_initial",
        "date_final",
        "execution_time",
        "exposures",
        "ccds",
        "nights",
    )

@admin.register(OrbitTraceJob)
class OrbitTraceJobAdmin(admin.ModelAdmin):
    list_display = (
        "id",
        "status",
        "owner",
        "bsp_planetary",
        "leap_seconds",
        "filter_type",
        "filter_value",
        "exec_time",
    )


@admin.register(SkybotJobResult)
class SkybotJobResultAdmin(admin.ModelAdmin):
    list_display = (
        "id",
        "job",
        "exposure",
        "ticket",
        "execution_time",
        "positions",
        "inside_ccd",
        "outside_ccd",
    )

    # Troca o tipo de imput de Select para um text field com botao de busca
    # para os campos de chave estrangeira que tem milhares de registros e causa tavamento da interface
    raw_id_fields = (
        "job",
        "exposure",
    )

@admin.register(OrbitTraceJobResult)
class OrbitTraceJobResultAdmin(admin.ModelAdmin):
    list_display = (
        "id",
        "job",
        "asteroid",
        "status",
        "name",
        "number",
        "base_dynclass",
        "dynclass",
        "observations",
        "ccds",
    )

    # Troca o tipo de input de Select para um text field com botao de busca
    # para os campos de chave estrangeira que tem milhares de registros e causa tavamento da interface
    raw_id_fields = (
        "job",
        "asteroid",
    )


@admin.register(SummaryDynclass)
class SummaryDynclassAdmin(admin.ModelAdmin):
    list_display = (
        "id",
        "job",
        "dynclass",
        "asteroids",
        "ccds",
        "positions",
        "u",
        "g",
        "r",
        "i",
        "z",
        "y",
    )

    search_fields = ("id", "dynclass")

    # Troca o tipo de imput de Select para um text field com botao de busca
    # para os campos de chave estrangeira que tem milhares de registros e causa tavamento da interface
    raw_id_fields = ("job",)


@admin.register(SkybotByYear)
class SkybotByYearAdmin(admin.ModelAdmin):
    list_display = (
        "id",
        "year",
        "nights",
        "exposures",
        "ccds",
        "nights_analyzed",
        "exposures_analyzed",
        "ccds_analyzed",
    )

    search_fields = (
        "id",
        "year",
    )


@admin.register(SkybotByDynclass)
class SkybotByDynclassAdmin(admin.ModelAdmin):
    list_display = (
        "id",
        "dynclass",
        "nights",
        "ccds",
        "asteroids",
        "positions",
        "u",
        "g",
        "r",
        "i",
        "z",
        "y",
    )

    search_fields = (
        "id",
        "dynclass",
    )


@admin.register(Observation)
class ObservationAdmin(admin.ModelAdmin):
    list_display = (
        "asteroid",
        # "ccd_id",
        "name",
        "date_obs",
        "date_jd",
        "ra",
        "dec",
        "offset_ra",
        "offset_dec",
        "mag_psf",
        "mag_psf_err",
        "created_at"
    )
    search_fields = ("name",)

    # Troca o tipo de imput de Select para um text field com botao de busca
    # para os campos de chave estrangeira que tem milhares de registros e causa tavamento da interface
    raw_id_fields = (
        "asteroid",
    )
