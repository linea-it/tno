from apscheduler.schedulers.background import BackgroundScheduler

def start_des_skybot_daemon():
    """Inicia a Daemon do pipele Des Skybot. 
    """
    
    from des.skybot.pipeline import DesSkybotPipeline
    pipeline = DesSkybotPipeline()
    scheduler = BackgroundScheduler()

    # # Daemon que verifica se tem Jobs a serem executados, 
    # # se tiver inicia a etapa de consulta ao skybot.
    # scheduler.add_job(
    #     pipeline.check_execution_queue, 
    #     'interval', 
    #     # minutes=1
    #     seconds=30
    #     )

    # # Deamon que verifica se tem Jobs EXECUTANDO se tiver 
    # # executa o import dos dados.
    # scheduler.add_job(
    #     pipeline.check_load_data_queue, 
    #     'interval', 
    #     # minutes=1
    #     seconds=30
    #     )

    scheduler.start()




