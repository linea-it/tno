import json
import logging
from datetime import datetime

import requests
from django.conf import settings


def get_condor_api_host():
    return "%s/%s/" % (settings.CONDOR_API.strip('/'), settings.CONDOR_CLUSTER.strip('/'))


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
            # logger.debug(r.json())
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

        r = requests.get(condor_api_jobs, params={
            'ClusterId': cluster_id,
            'ProcId': proc_id,
        })

        if r.status_code == requests.codes.ok:
            # logger.debug(r.json())
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

        logger.info("Submit API URL: %s" % submit_api_url)

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


def remove_job(clusterId, procId):
    """
        Remove um Job no condor pelo seu ID
    """
    logger = logging.getLogger("condor")
    logger.info(
        "Remove Job: ClusterId: [%s] ProcId: [%s]" % (clusterId, procId))

    try:
        condor_api_jobs = "%s/%s" % (
            get_condor_api_host().strip('/'),  'remove')

        r = requests.get(condor_api_jobs, params={
            'ClusterId': clusterId,
            'ProcId': procId,
        })

        if r.status_code == requests.codes.ok:
            # logger.debug(r.json())
            result = r.json()
            if result['success']:
                return result['job']
            else:
                return None
        else:
            logger.error(
                "Failed to remove a job. Payload: [ %s ]" % r)

    except Exception as e:
        logger.error(e)
        raise


def get_job_by_id(clusterId, procId):
    """
        Recupera informacoes de um Job mesmo que esteja no history
    """
    logger = logging.getLogger("condor")
    logger.info("get_job_by_id: ClusterId: [%s] ProcId: [%s]" % (
        clusterId, procId))

    try:
        condor_api_jobs = "%s/%s" % (
            get_condor_api_host().strip('/'),  'get_job')

        r = requests.get(condor_api_jobs, params={
            'ClusterId': clusterId,
            'ProcId': procId,
        })

        if r.status_code == requests.codes.ok:
            # logger.debug(r.json())
            record = r.json()
            if len(record):
                return record
            else:
                return None
        else:
            # TODO tratar falha na requisicao
            pass

    except Exception as e:
        logger.error(e)
        raise
