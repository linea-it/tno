from run_pred_occ import (
    complete_job,
    get_job_running,
    get_job_to_complete,
    ingest_predictions,
    predict_job_queue,
)
from run_pred_occ import run_job as predict_run_job


def predict_occultation_queue():
    to_run_id = predict_job_queue()

    if to_run_id:
        print(f"Predict Job to run: [{to_run_id}]")
        data = predict_run_job(to_run_id)
        print(f"Executed: %s" % str(data))

    return to_run_id


if __name__ == "__main__":
    try:
        # Submete jobs em idle para execução.
        run_id = predict_occultation_queue()

        # Verifica se existe algum job em execução.
        # Running or Consolidating.
        running_id = get_job_running()
        if running_id:
            print(f"Job running: [{running_id}]")
            ingest_predictions(running_id)
        else:
            print("No job running.")

        # Jobs completos com status "Consolidating".
        to_complete = get_job_to_complete()
        if to_complete:
            print(f"Job to complete: [{to_complete}]")
            complete_job(to_complete)

    except Exception as e:
        # Este exception é para evitar que a daemon desligue em caso de falha.
        print(e)
