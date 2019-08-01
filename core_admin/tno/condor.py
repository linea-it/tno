from apscheduler.schedulers.background import BackgroundScheduler
import logging
from datetime import datetime
import requests

def teste():
    logger = logging.getLogger("condor")

    msg = "Teste Check Jobs: %s" % datetime.now()
    logger.debug(msg)
    print(msg)

    from praia.models import Run

    running_process = Run.objects.filter(status='running')

    for process in running_process:
        pass
        # asteroids = 

    logger.debug(len(running_proccess))


def start_check_jobs():

    # print("Start Check Jobs")
    
    logger = logging.getLogger("condor")

    scheduler = BackgroundScheduler()
    scheduler.add_job(teste, 'interval', minutes=1)
    scheduler.start()

    # logger.debug("Start Check Jobs")



def check_condor_job(cluster_id, proc_id):
    logger = logging.getLogger("condor")
    logger.debug("check_condor_job: ClusterId: [%s]" % cluster_id)

    try:
        r = requests.get('http://loginicx.linea.gov.br:5000/jobs', params={
            'ClusterId': cluster_id,
            'ProcId': proc_id
        })

        if r.status_code == requests.codes.ok:
            logger.debug(r.json())
            rows = r.json()
            if len(rows) == 1:
                return rows[0]
            else:
                return None
        else:
            # TODO tratar falha na requisicao
            logger.error("Falha na requisicao")

    except Exception as e:
        logger.error(e)
        raise