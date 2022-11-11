# TODO: Seria interessante ter apenas um scheduler para toda a aplicação. poderia ser usado django-apscheduler para gerenciar. Tentar usar essa função do Remove, criar uma função aqui que tenha acesso ao schedule.


from apscheduler.schedulers.background import BackgroundScheduler

from des.skybot.pipeline import DesSkybotPipeline


def check_request_queue():
    DesSkybotPipeline().check_request_queue()


def check_loaddata_queue():
    DesSkybotPipeline().check_loaddata_queue()


scheduler = BackgroundScheduler()
scheduler.add_job(
    check_request_queue,
    "interval",
    # minutes=1
    seconds=15,
    max_instances=1,
    id="des_skybot_request",
)

scheduler.add_job(
    check_loaddata_queue,
    "interval",
    # minutes=1
    seconds=20,
    max_instances=1,
    id="des_skybot_loaddata",
)

scheduler.start()
