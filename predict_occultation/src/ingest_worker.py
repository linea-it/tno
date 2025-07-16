import traceback

from run_pred_occ import get_job_running, ingest_predictions, timestamp

try:
    running_id = get_job_running()
    if running_id:
        print(f"{timestamp()} - [Ingest Worker] Job running: [{running_id}]")
        ingest_predictions(running_id)
    # else:
    #     print(f"{timestamp()} - [Ingest Worker] No job running.")

except Exception:
    print(f"{timestamp()} - [Ingest Worker] Error in ingest_worker")
    traceback.print_exc()
