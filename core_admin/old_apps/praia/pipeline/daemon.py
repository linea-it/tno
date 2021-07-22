from apscheduler.schedulers.background import BackgroundScheduler
import logging
from praia.pipeline.register import check_astrometry_running
from praia.models import Run

def start_astrometry_daemon():

    # print("Start Check Jobs")

    # logger = logging.getLogger("condor")

    # scheduler = BackgroundScheduler()
    # scheduler.add_job(check_astrometry_running, 'interval', minutes=1)
    # scheduler.start()

    # logger.debug("Start Check Jobs")


    pass