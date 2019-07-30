from apscheduler.schedulers.background import BackgroundScheduler
import logging
from datetime import datetime

def teste():
    logger = logging.getLogger("astrometry")

    msg = "Teste Check Jobs: %s" % datetime.now()
    logger.debug(msg)
    print(msg)

def start_check_jobs():

    print("Start Check Jobs")
    
    logger = logging.getLogger("astrometry")

    scheduler = BackgroundScheduler()
    scheduler.add_job(teste, 'interval', minutes=1)
    scheduler.start()

    logger.debug("Start Check Jobs")



    