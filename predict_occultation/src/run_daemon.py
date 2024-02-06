
from run_pred_occ import predict_job_queue, run_job as predict_run_job


def predict_occultation_queue():
    to_run_id = predict_job_queue()

    if to_run_id:
        print(f"Predict Job to run: [{to_run_id}]")
        data = predict_run_job(to_run_id)
        print(f"Executed: %s" % str(data))

    return to_run_id

if __name__ == '__main__':
    try:
        run_id = predict_occultation_queue()
    except Exception as e:
        # Este exception é para evitar que a daemon desligue em caso de falha.
        print(e)
