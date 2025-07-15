import traceback
from datetime import datetime

from run_pred_occ import predict_job_queue, run_job, timestamp

try:
    to_run_id = predict_job_queue()
    if to_run_id:
        print(f"{timestamp()} - [Submit Worker] Predict Job to run: [{to_run_id}]")
        data = run_job(to_run_id)
        print(f"{timestamp()} - [Submit Worker] Executed: {data}")
except Exception:
    print(f"{timestamp()} - [Submit Worker] Error in submit_worker")
    traceback.print_exc()
