# TODO: Seria interessante ter apenas um scheduler para toda a aplicação. poderia ser usado django-apscheduler para gerenciar. Tentar usar essa função do Remove, criar uma função aqui que tenha acesso ao schedule.


from apscheduler.schedulers.background import BackgroundScheduler

from des.models import AstrometryJob
from des.astrometry_pipeline import DesAstrometryPipeline
import subprocess


def check_jobs_to_run():
    """Verifica a fila de jobs, se tiver algum job com status idle.
    inicia a execução do job.
    Este metodo está é uma Daemon, ele é executado de tempos em tempos.
    """
    import logging
    log = logging.getLogger('des_astrometry')

    job_test = AstrometryJob.objects.get(id=8)
    job_test.status = 1
    job_test.save()

    # Verificar se já existe algum job com status Running ou Lauched.
    running = AstrometryJob.objects.filter(status__in=[2, 7])
    log.debug("Running Jobs: %s" % len(running))

    if len(running) == 0:
        # Se nao tiver nenhum job executando verifica se tem jobs com status Idle
        # esperando para serem executados.
        idle = AstrometryJob.objects.filter(status=1)
        log.debug("Idle Jobs: %s" % len(idle))

        if len(idle) > 0:
            to_run = idle[0]

            jobid = to_run.id
            # jobpath = DesAstrometryPipeline().create_job_path(jobid)
            jobpath = DesAstrometryPipeline().prepare_job(jobid)

            log.debug("Jobid: [%s] JobPath: [%s]" % (jobid, jobpath))

            # args = "umask 0002 && python /orbit_trace/orbit_trace.py %s %s"

            args = "/home/appuser/run_astrometry.sh %s %s" % (
                str(jobid), jobpath)

            log.debug("Command: [%s]" % (args))
            subprocess.Popen(args, shell=True,)

            # Altera o status para Launched
            to_run.status = 7
            to_run.save()

            log.debug("Des Astrometry JobId[%s] Launched! log can be tracked on path: [%s]" % (
                jobid, jobpath))

# scheduler = BackgroundScheduler()
# scheduler.add_job(
#     check_jobs_idle,
#     'interval',
#     # minutes=1
#     seconds=15,
#     max_instances=1,
#     id='des_skybot_request'
# )

# scheduler.start()
