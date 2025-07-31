from sys import argv

from run_pred_occ import complete_job


def main():
    if len(argv) > 1:
        jobid = argv[1]
    else:
        raise ValueError("No job")

    complete_job(jobid)


if __name__ == "__main__":
    main()
