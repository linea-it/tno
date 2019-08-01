from praia.models import Run, AstrometryAsteroid, AstrometryInput, AstrometryJob
from datetime import datetime, timezone

def register_input(run_id, name, asteroid_input):
    # try:

    asteroid = AstrometryAsteroid.objects.get(
        astrometry_run=run_id, name=name)

    input_model, create=AstrometryInput.objects.update_or_create(
        asteroid = asteroid,
        input_type = asteroid_input["input_type"],
        defaults = {
            'filename': asteroid_input["filename"],
            'file_size': asteroid_input["file_size"],
            'file_type': asteroid_input["file_type"],
            'file_path': asteroid_input["file_path"],
            'error_msg': asteroid_input["error_msg"],
            'start_time': asteroid_input["start_time"],
            'finish_time': asteroid_input["finish_time"],
            'execution_time': asteroid_input["execution_time"],
        })
    input_model.save()

    return input_model


def register_condor_job(astrometryRun, asteroid, clusterid, procid, job_status):

    job = AstrometryJob.objects.create(
        astrometry_run=astrometryRun,
        asteroid=asteroid,
        clusterid=clusterid,
        procid=procid,
        job_status=job_status,
        start_time=datetime.now(timezone.utc)
    )
    job.save()

    return job

