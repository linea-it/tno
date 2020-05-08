from apscheduler.schedulers.background import BackgroundScheduler

def start_des_skybot_daemon():
    """
        Inicia a Daemon do pipele Des Skybot. 
        verifica se tem algum job na fila para ser executado. 
    """
    from des.skybot.pipeline import DesSkybotPipeline
    # pipeline = DesSkybotPipeline()
    # scheduler = BackgroundScheduler()
    # scheduler.add_job(
    #     pipeline.check_execution_queue, 
    #     'interval', 
    #     # minutes=1
    #     seconds=10
    #     )
    # scheduler.start()

