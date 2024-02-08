from sys import argv

from run_pred_occ import rerun_job


def main():
    if len(argv) > 1:
        jobid = argv[1]
    else:
        raise ValueError("No job")

    rerun_job(jobid)


if __name__ == "__main__":
    main()
