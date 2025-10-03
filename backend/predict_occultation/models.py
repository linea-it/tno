from django.db import models

from django.utils import timezone
from datetime import timedelta
# Create your models here.

class PredictionState(models.TextChoices):
    PENDING = "PENDING", "Pending"
    PREPARING = "PREPARING", "Preparing"
    READY_FOR_RUN = "READY_FOR_RUN", "Ready for Run"
    SUBMITTING = "SUBMITTING", "Submitting"
    QUEUED = "QUEUED", "Queued"
    RUNNING = "RUNNING", "Running"
    WAITING_RESULTS = "WAITING_RESULTS", "Waiting Results"
    INGESTING = "INGESTING", "Ingesting"
    DONE = "DONE", "Done"
    FAILED = "FAILED", "Failed"
    STALLED = "STALLED", "Stalled"
    ABORTED = "ABORTED", "Aborted"


class AttemptStage(models.TextChoices):
    PREPARE = "PREPARE", "Prepare"
    SUBMIT = "SUBMIT", "Submit"
    RUN = "RUN", "Run"
    INGEST = "INGEST", "Ingest"


class PredictionTask(models.Model):
    asteroid_id = models.CharField(max_length=100, db_index=True)

    priority = models.IntegerField(default=100) # menor = mais prioritário
    state = models.CharField(
        max_length=32, 
        choices=PredictionState.choices, 
        default=PredictionState.PENDING
    )
    # diretórios e artefatos
    workdir = models.CharField(max_length=1024, blank=True)
    input_manifest = models.JSONField(default=dict, blank=True)
    output_manifest = models.JSONField(default=dict, blank=True)

    # execução no cluster
    slurm_job_id = models.CharField(max_length=64, blank=True)
    
    # controle
    attempt_count = models.IntegerField(default=0)
    max_retries = models.IntegerField(default=3)
    next_retry_at = models.DateTimeField(null=True, blank=True)
    last_error = models.TextField(blank=True)

    # timestamps
    created_at = models.DateTimeField(default=timezone.now)
    updated_at = models.DateTimeField(auto_now=True)
    
    aborted = models.BooleanField(default=False)

    BASE_DELAY = 60  # segundos (1 minuto)

    def mark_failed(self, error: str ):
        """
        Marca task como falhada e agenda retry se ainda não atingiu limite.
        """
        self.attempt_count += 1
        self.last_error = error
        if self.attempt_count >= self.max_retries:
            self.state = PredictionState.STALLED
            self.next_retry_at = None
        else:
            # Exponential backoff
            delay_seconds = self.BASE_DELAY * (2 ** (self.attempt_count - 1))
            self.state = PredictionState.PENDING
            self.next_retry_at = timezone.now() + timedelta(seconds=delay_seconds)

        self.save(update_fields=["state", "last_error", "attempt_count", "next_retry_at", "updated_at"])


    def mark_aborted(self):
        self.state = PredictionState.ABORTED
        self.aborted = True
        self.save(update_fields=["state", "aborted", "updated_at"])

    def retry(self):
        """
        Retry manual (ignora delay).
        """
        if self.state in [PredictionState.FAILED, PredictionState.STALLED, PredictionState.ABORTED]:
            self.state = PredictionState.PENDING
            self.last_error = ""
            self.aborted = False
            self.next_retry_at = None
            self.attempt_count = 0
            self.save(update_fields=["state", "last_error", "aborted", "attempt_count", "next_retry_at", "updated_at"])


    class Meta:
        indexes = [
            models.Index(fields=["state", "priority", "-created_at"]),
        ]



class WorkersStatus(models.TextChoices):
    RUNNING = "RUNNING", "Running"
    STALE = "STALE", "Stale"
    # BUSY = "BUSY", "Busy"
    # IDLE = "IDLE", "Idle"

class WorkersHeartbeat(models.Model):
    worker = models.CharField(max_length=32, unique=True)
    started_at = models.DateTimeField(default=timezone.now)
    updated_at = models.DateTimeField(auto_now=True, null=True, blank=True)
    uptime = models.IntegerField(default=0)  # em segundos

    def start_heartbeat(self):
        self.started_at = timezone.now()
        self.updated_at = timezone.now()
        self.save(update_fields=["started_at", "updated_at"])

    def update_heartbeat(self):
        self.updated_at = timezone.now()

        delta = timezone.now() - self.started_at
        self.uptime = int(delta.total_seconds())

        self.save(update_fields=["updated_at", "uptime"])

    def status(self):
        delta = timezone.now() - self.updated_at
        if delta.total_seconds() > 300:  # 5 minutos sem atualização
            return WorkersStatus.STALE
        return WorkersStatus.RUNNING