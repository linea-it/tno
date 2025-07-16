from sys import argv

from run_pred_occ import rerun_job, update_job_progress


def main():
    if len(argv) > 1:
        jobid = argv[1]
    else:
        raise ValueError("No job")

    rerun_job(jobid)

    # update_job_progress(jobid)


if __name__ == "__main__":
    main()
