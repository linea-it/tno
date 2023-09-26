# Create your tasks here
from celery import shared_task
from tno.models import Occultation
from datetime import datetime, timedelta
from django.conf import settings
import os
import json
from tno.sora_map import sora_occultation_map


# Example task
@shared_task
def add(x=2, y=2):
    print("Executou Add!")
    return x + y


# Example Periodic task
# Tarefa configurada para executar a cada 30 segundos
# Proposito de exemplo de funcionamento de uma tarefa periodica com 
# Celery beat
@shared_task
def teste_periodic_task():
    print(f"Executou Tarefa Pediodica. {datetime.now()}")
    return True

# Exemplo de task sendo executada por uma chamada na api
# http://localhost/api/teste/
@shared_task
def teste_api_task():
    print(f"Executou Tarefa submetida pela API. {datetime.now()}")
    return True

@shared_task
def create_occ_map_task(**kwargs):
    return sora_occultation_map(**kwargs)
    


# task para gerar os mapas das ocultações todos os dias as 23:00
# a task tentará gerar os mapas das 50 primeiras ocultações do próximo dia
@shared_task
def generate_maps():
    tomorrow = datetime.now().date() + timedelta(1)
    qtdMaps = settings.SORA_QTD_MAPS if hasattr(settings, 'SORA_QTD_MAPS') else 50
    occultations = Occultation.objects.filter(date_time__date = tomorrow).order_by('date_time')[:qtdMaps]
    for occ in occultations:
        try:
            conteudo = create_json_occ(occ)
            log_sora_map("generating map " + occ.name + "_" +  occ.date_time.strftime("Y%m%d%H%M%S"))
            # a função gera arquivos json na pasta settings.SORA_INPUT que são usados pelo sora como requisição para geração dos mapas
            write_json_file(generate_filename(), conteudo)
        except OSError as e:
            # se não conseguir loga.
            log_sora_map("Error: %s - %s." % (e.filename, e.strerror))

@shared_task
def cleanup_maps():
    lastweek = datetime.now() - timedelta(days=7)
    lista= []
    for entry in os.scandir(settings.SORA_OUTPUT):
        if entry.is_file():
            filetime = datetime.fromtimestamp(os.path.getctime(os.path.join(settings.SORA_OUTPUT, entry.name)))
            # se o arquivo tem mais de 7 dias, deleta
            if filetime < lastweek:
                lista.append(os.path.join(settings.SORA_OUTPUT, entry.name))
    delete_files(lista)

def delete_files(lista):
    for arquivo in lista:
        try:
            log_sora_map("removing %s " % arquivo)
            os.remove(arquivo)
        except OSError as e:
            # se não conseguir loga.
            log_sora_map("Error: %s - %s." % (e.filename, e.strerror))

def create_json_occ(occ):
    return {'name': occ.name,
            'radius': occ.diameter if occ.diameter != None else 0,
            'coord': occ.ra_star_candidate + " " + occ.dec_star_candidate, 
            'time': occ.date_time.strftime('%Y-%m-%dT%H:%M:%S.%f'), 
            'ca': occ.closest_approach,
            'pa': occ.position_angle,
            'vel': occ.velocity,
            'dist': occ.delta,
            'mag': occ.g,
            'longi': occ.long
            }
        

def write_json_file(nome_arquivo, conteudo):
    caminho_arquivo = os.path.join(settings.SORA_INPUT, nome_arquivo)
    # Escreve o conteúdo no arquivo JSON
    with open(caminho_arquivo, 'w') as arquivo:
        json.dump(conteudo, arquivo)

def generate_filename():
    # Obter a data e hora atual
    timestamp = datetime.now().strftime("%Y%m%d%H%M%S%f")
    # Concatenar o prefixo e o timestamp para formar o nome do arquivo
    nome_arquivo = f"input_{timestamp}_.json"
    
    return nome_arquivo

def log_sora_map(conteudo):
    try:
        # se o arquivo existir escreve nele
        with open(settings.SORA_LOG, 'a') as arquivo:
            arquivo.write(datetime.now().strftime("%Y%m%d%H%M%S%f") + " " + conteudo + '\n')
    except FileNotFoundError:
        # Caso o arquivo não exista, cria um novo arquivo e escreve nele
        with open(settings.SORA_LOG, 'w') as arquivo:
            arquivo.write(datetime.now().strftime("%Y%m%d%H%M%S%f") + " " + conteudo + '\n')
