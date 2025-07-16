import traceback

from run_pred_occ import complete_job, get_job_to_complete, timestamp

try:
    to_complete = get_job_to_complete()
    if to_complete:
        print(f"{timestamp()} - [Complete Worker] Job to complete: [{to_complete}]")
        complete_job(to_complete)
    # else:
    #     print(f"{timestamp()} - [Complete Worker] No job to complete.")

except Exception:
    print(f"{timestamp()} - [Complete Worker] Error in complete_worker")
    traceback.print_exc()
