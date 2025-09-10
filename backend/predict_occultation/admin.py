from django.contrib import admin
from .models import PredictionTask, PredictionAttempt, PredictionState


@admin.register(PredictionTask)
class PredictionTaskAdmin(admin.ModelAdmin):
    list_display = ("id", "asteroid_id", "state", "priority", "attempt_count", "max_retries", "created_at", "updated_at", "aborted")
    list_filter = ("state", "priority", "aborted")
    search_fields = ("asteroid_id",)
    # ordering = ("-priority", "-created_at")
    ordering = ("-created_at",)
    actions = ["abort_tasks", "retry_tasks"]

    def abort_tasks(self, request, queryset):
        count = 0
        for task in queryset:
            if task.state not in [PredictionState.DONE, PredictionState.ABORTED]:
                task.mark_aborted()
                count += 1
        self.message_user(request, f"{count} tasks abortadas.")
    abort_tasks.short_description = "Abortar tasks selecionadas"

    def retry_tasks(self, request, queryset):
        count = 0
        for task in queryset:
            if task.state in [PredictionState.FAILED, PredictionState.ABORTED]:
                task.retry()
                count += 1
        self.message_user(request, f"{count} tasks re-enfileiradas.")
    retry_tasks.short_description = "Retry nas tasks selecionadas"


@admin.register(PredictionAttempt)
class PredictionAttemptAdmin(admin.ModelAdmin):
    list_display = ("id", "task", "stage", "success", "started_at", "finished_at")
    list_filter = ("stage", "success")
    search_fields = ("task__asteroid_id",)
