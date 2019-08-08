from apscheduler.schedulers.background import BackgroundScheduler
import logging
from datetime import datetime
import requests
from django.conf import settings
import json


def get_condor_api_host():
    return "%s/%s/" % (settings.CONDOR_API.strip('/'), settings.CONDOR_CLUSTER.strip('/'))


def start_check_jobs():

    # print("Start Check Jobs")

    logger = logging.getLogger("condor")

    # scheduler = BackgroundScheduler()
    # scheduler.add_job(teste, 'interval', minutes=1)
    # scheduler.start()

    # logger.debug("Start Check Jobs")

    pass


def check_condor_job(cluster_id, proc_id):
    logger = logging.getLogger("condor")
    logger.debug("check_condor_job: ClusterId: [%s] ProcId: [%s]" % (
        cluster_id, proc_id))

    try:
        condor_api_jobs = "%s/%s" % (get_condor_api_host().strip('/'),  'jobs')

        r = requests.get(condor_api_jobs, params={
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
            pass

    except Exception as e:
        logger.error(e)
        raise


def check_job_history(cluster_id, proc_id):
    logger = logging.getLogger("condor")
    logger.debug("check_job_history: ClusterId: [%s] ProcId: [%s]" % (
        cluster_id, proc_id))

    try:
        condor_api_jobs = "%s/%s" % (
            get_condor_api_host().strip('/'),  'history')

        # projection  = ','.join([
        #         'ClusterId', 'ProcId', 'GlobalJobId', 'JobStatus', 'JobStartDate', 'EnteredCurrentStatus', 
        #         'Args', 'Owner', 'RemoteHost', 'RequestCpus', 'RequiresWholeMachine', 'Out', 'UserLog'])

        r = requests.get(condor_api_jobs, params={
            'ClusterId': cluster_id,
            'ProcId': proc_id,
            # 'cols': projection,
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
            pass

    except Exception as e:
        logger.error(e)
        raise


def submit_condor_job(payload):
    logger = logging.getLogger("condor")

    try:
        submit_api_url = "%s/%s" % (get_condor_api_host().strip('/'),
                                    'submit_job')

        logger.debug("Submit API URL: %s" % submit_api_url)

        headers = {'Content-Type': 'application/json'}

        r = requests.post(submit_api_url, headers=headers,
                          data=json.dumps(payload))
        r.status_code

        response = r.json()

        logger.debug("Result Status Code: [%s] Response: [ %s ]" % (
            r.status_code, response))

        if response['success'] is True:
            # Submetido com sucesso
            for job in response['jobs']:
                logger.info("Job in Condor was created. ClusterId [ %s ] ProcId [ %s ]" % (
                    job['ClusterId'], job['ProcId']))

        return response

    except Exception as e:
        logger.error(
            "Failed to submit a new job. Payload: [ %s ]" % json.dumps(payload))
        logger.error(e)
