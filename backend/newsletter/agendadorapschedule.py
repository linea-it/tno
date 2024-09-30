from apscheduler.schedulers.blocking import BlockingScheduler

# inicializa o agendador
scheduler = BlockingScheduler()


# função que será executada pelo agendador
def tarefa():
    print("Tarefa executada!")


# adiciona a tarefa a ser executada às 8h da manhã todos os dias
scheduler.add_job(tarefa, "cron", hour=8)

# inicia o agendador
scheduler.start()
