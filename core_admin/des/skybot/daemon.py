# from apscheduler.schedulers.background import BackgroundScheduler
# from des.skybot.pipeline import DesSkybotPipeline
# # TODO: Tentar usar essa função do Remove, criar uma função aqui que tenha acesso ao schedule.
# # https://stackoverflow.com/questions/33036321/python-apscheduler-not-stopping-a-job-even-after-using-remove-job/33037283#33037283



# def start_des_skybot_daemon():
#     """Inicia a Daemon do pipele Des Skybot. 
#     """
    
#     from des.skybot.pipeline import DesSkybotPipeline
#     pipeline = DesSkybotPipeline()
#     scheduler = BackgroundScheduler()

#     # Daemon que verifica se tem Jobs a serem executados, 
#     # se tiver inicia a etapa de consulta ao skybot.
#     scheduler.add_job(
#         pipeline.check_request_queue, 
#         'interval', 
#         # minutes=1
#         seconds=15,
#         max_instances=1,
#     )

#     # # Deamon que verifica se tem Jobs EXECUTANDO se tiver 
#     # # executa o import dos dados.
#     # scheduler.add_job(
#     #     pipeline.check_loaddata_queue, 
#     #     'interval', 
#     #     # minutes=1
#     #     seconds=20
#     #     )

#     scheduler.start()

from apscheduler.schedulers.background import BackgroundScheduler
from des.skybot.pipeline import DesSkybotPipeline

def check_request_queue():
    DesSkybotPipeline().check_request_queue()



scheduler = BackgroundScheduler()
scheduler.add_job(
        check_request_queue, 
        'interval', 
        # minutes=1
        seconds=15,
        max_instances=1,
        id='job_request'
    )
# scheduler.start()