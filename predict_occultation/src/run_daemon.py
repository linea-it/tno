from run_pred_occ import predict_job_queue
from run_pred_occ import run_job as predict_run_job

if __name__ == "__main__":
    try:
        # Submete jobs em idle para execução.
        to_run_id = predict_job_queue()

        if to_run_id:
            print(f"Predict Job to run: [{to_run_id}]")
            predict_run_job(to_run_id)

    except Exception as e:
        # Este exception é para evitar que a daemon desligue em caso de falha.
        print(e)
