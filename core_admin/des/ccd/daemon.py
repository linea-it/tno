from apscheduler.schedulers.background import BackgroundScheduler

from des.ccd import start_pipeline


def download_queue():
    start_pipeline()


scheduler = BackgroundScheduler()
scheduler.add_job(
    download_queue,
    "interval",
    # minutes=1
    seconds=20,
    max_instances=1,
    id="des_download_ccd",
)

scheduler.start()
