import logging
import os
import shutil
import traceback
from concurrent.futures import ThreadPoolExecutor, as_completed, wait
from datetime import datetime, timedelta, timezone

import humanize
import pandas as pd
from django.conf import settings
from matplotlib import dates as dt
from matplotlib import pyplot as plt

from common.download import Download
from common.unpack_fz import funpack
from des.dao import (DesSkybotPositionDao, DownloadCcdJobDao,
                     DownloadCcdJobResultDao)

logger = logging.getLogger('download_ccds')


def download_ccd(idx, ccd, base_url, ccd_image_dir, auth):
    """Faz o Download de um CCD do serviço do DES.

    Args:
        idx (int): Posição do registro no array de ccds a serem baixados
        ccd (dict): Um dicionario que representa uma instancia do Model des/Ccd
        base_url (str): referece ao valor da settings.DES_ARCHIVE_URL
        ccd_image_dir (str): diretório onde o arquivo sera baixado, settings.CCD_IMAGES_DIR
        auth (tuple): uma tupla com os dados de authenticação do serviço DES (settings.DES_USERNAME, settings.DES_PASSWORD)


    Returns:
        dict: Um dicionario que representa uma instancia do Model des/Ccd + atributo 'download_stats'
    """
    logger.info("Downloading IDX: [%s] CCD_ID: [%s] Filename: [%s]" % (
        idx, ccd['id'], ccd['filename']))

    try:
        start = datetime.now(timezone.utc)

        # Iniciar o Download aqui
        filename = ccd['filename'] + ccd['compression']
        download_url = '/'.join([base_url.strip('/'),
                                 ccd['path'].strip('/'), filename])

        logger.debug(download_url)

        filepath, download_stats = Download().download_file_from_url(
            download_url, ccd_image_dir, filename, timeout=60, auth=auth)

        # Double Check
        if not os.path.exists(filepath):
            raise("Failed to download the file.")

        # Termino do Download
        finish = datetime.now(timezone.utc)
        tdelta = finish - start
        logger.info("Downloaded  IDX: [%s] CCD_ID: [%s] in %s" % (
            idx, ccd['id'], humanize.naturaldelta(tdelta)))

        # Descompactar .fz para .fits
        funpack(filepath)

        # Remover arquico compactado.
        os.unlink(filepath)

        ccd.update({
            'download_stats': download_stats
        })
        return ccd
    except Exception as e:
        logger.error(
            "Failed      IDX: [%s] - CCD_ID: [%s] Error: %s" % (idx, ccd['id'], e))
        return ccd


def register_download(job_id, ccd):
    """Registra os dados do Download na tabela des_downloadccdjobresult.

    Args:
        job_id (int): Id referente ao Model des/DownloadCcdJob
        ccd (dict): Um dicionario que representa uma instancia do Model des/Ccd + atributo 'download_stats'  que é adicioando pela função de download.
    """
    logger.debug("Register download: %s" % ccd['id'])

    try:

        # Conect in database with SqlAlchemy
        db = DownloadCcdJobResultDao(pool=False)

        record = dict({
            'job': job_id,
            'ccd': ccd['id'],
            'start': ccd['download_stats']['start_time'],
            'finish': ccd['download_stats']['finish_time'],
            'execution_time': timedelta(seconds=ccd['download_stats']['download_time']),
            'file_size': ccd['download_stats']['file_size'],
        })

        db.create(record)

        logger.debug("CCD Image: ID [ %s ] Created: [ %s ] Filename: [ %s ]" %
                     (ccd['id'], True, ccd['filename']))
    except Exception as e:
        logger.error("CCD Image: ID [ %s ] Created: [ %s ] Filename: [ %s ]" %
                     (ccd['id'], False, ccd['filename']))

        logger.error(e)


def download_and_register(job_id, idx, ccd, base_url, ccd_image_dir, auth):
    """Executa as funções de download e registro em sequencia.

    Args:
        job_id (int): Id referente ao Model des/DownloadCcdJob
        idx (int): Posição do registro no array de ccds a serem baixados
        ccd (dict): Um dicionario que representa uma instancia do Model des/Ccd
        base_url (str): referece ao valor da settings.DES_ARCHIVE_URL
        ccd_image_dir (str): diretório onde o arquivo sera baixado, settings.CCD_IMAGES_DIR
        auth (tuple): uma tupla com os dados de authenticação do serviço DES (settings.DES_USERNAME, settings.DES_PASSWORD)

    Returns:
        dict: retorna o dict do ccd com um atributo a mais 'download_stats' com as infos do download
    """
    ccd = download_ccd(idx, ccd, base_url, ccd_image_dir, auth)

    register_download(job_id, ccd)

    return ccd


def download_des_ccds(job_id, ccds, max_workers=10):
    """ Esta função funciona como um workflow para o job Download Des CCD.
        recebe uma lista de ccds e efetua o download e o registro do tempo de download.
        os downloads podem ser feitas em paralelo utilizando max_workers.

    Args:
        job_id (int): Id referente ao Model des/DownloadCcdJob
        ccds (array): Um Array de Models des/Ccd
        max_workers (int, optional): quantidade de downloads que podem ser feitos em paralelo. Defaults to 10.

    """
    db = DownloadCcdJobDao(pool=False)
    logger.info("Started Download CCDs")
    logger.debug("CCDs to Download: [%s]" % len(ccds))

    start = datetime.now(timezone.utc)

    base_url = settings.DES_ARCHIVE_URL
    logger.debug("DES_ARCHIVE_URL: %s" % base_url)
    # Verificar se o Download de CCDs esta habilitado.
    if base_url is None:
        logger.warning(
            "DES CCD download is DISABLED. to enable setting the DES_ARCHIVE_URL, DES_USERNAME and DES_PASSWORD environment variables")
        logger.info('DONE!')
        return 0

    ccd_image_dir = settings.CCD_IMAGES_DIR
    auth = (settings.DES_USERNAME, settings.DES_PASSWORD)

    # Maximo de Downloads em paralelo 10
    pool = ThreadPoolExecutor(max_workers=max_workers)
    futures = []
    idx = 0

    for ccd in ccds:

        # Verificar se o ccd ja existe,
        # So faz o download para ccd que nao existe.
        filepath = os.path.join(ccd_image_dir, ccd['filename'])
        if not os.path.exists(filepath):
            futures.append(pool.submit(
                download_and_register,
                job_id,
                idx,
                ccd,
                base_url,
                ccd_image_dir,
                auth
            ))

            idx += 1

    wait(futures)

    # Registar os Downloads na tabela CCD Images
    results = []
    for future in futures:
        results.append(future.result())

    downloaded = 0
    failed = 0
    for ccd in results:
        if 'download_stats' in ccd:
            downloaded += 1
            # register_download(job_id, ccd)
        else:
            failed += 1

    # Termino do Download
    finish = datetime.now(timezone.utc)
    tdelta = finish - start
    logger.debug("Downloaded [%s] CCDs In %s." % (
        downloaded, humanize.naturaldelta(tdelta)))

    if failed > 0:
        logger.warning(
            "%s CCDs have failed and have not been downloaded." % failed)

    return results


def save_result(results, job_path):

    filepath = os.path.join(job_path, 'results.csv')

    df = pd.DataFrame(results, columns=[
                      'id', 'start_time', 'finish_time', 'download_time', 'file_size', 'filename', 'file_path'])

    # Escreve o dataframe em arquivo.
    df.to_csv(filepath, sep=';', header=True, index=False)

    logger.info("An archive was created with the Results.")
    logger.debug("Results File: [%s]" % filepath)

    return filepath


def plot_time_profile(filepath, job_path):
    """Cria um plot de time profile, usando o arquivo de resultado do job.
    o arquivo csv, precisa ter as colunas start_time e finish_time.

    Args:
        filepath (str): Filepath para o arquivo CSV de resultados do job.
        job_path (str): path para o diretório do job.

    based in:
        https://stackoverflow.com/questions/31820578/how-to-plot-stacked-event-duration-gantt-charts-using-python-pandas
        https://stackoverflow.com/questions/18066781/create-gantt-plot-with-python-matplotlib
    """

    df = pd.read_csv(filepath, delimiter=';', usecols=[
                     'start_time', 'finish_time'])

    df.start_time = pd.to_datetime(df.start_time)
    df.finish_time = pd.to_datetime(df.finish_time)

    # Com eixo X Formatado
    # locator = dt.AutoDateLocator()
    # fig, ax = plt.subplots()
    # ax.hlines(df.index, dt.date2num(df.start_time),
    #           dt.date2num(df.finish_time))
    # ax.xaxis.set_major_locator(dt.YearLocator())
    # ax.xaxis.set_major_formatter(dt.AutoDateFormatter(locator))

    # Sem o Eixo X
    fig = plt.figure()
    ax = fig.add_subplot(111)
    ax.xaxis_date()
    plt.hlines(df.index, dt.date2num(df.start_time),
               dt.date2num(df.finish_time))
    plt.xticks([], [])

    output = os.path.join(job_path, 'time_profile.png')
    fig.savefig(output)

    logger.info("A time profile plot was created for this job.")
    logger.debug("Time Profile File: [%s]" % output)

    return output


def run_job(job_id):

    logger.info("Starting the job with id %s" % job_id)

    # Recuperar o Job
    db = DownloadCcdJobDao(pool=False)
    cjrdao = DownloadCcdJobResultDao(pool=False)
    try:
        # Recupera os dados do job atualizado
        job = db.get_by_id(job_id)

        # Criar um diretório para o Job
        basedir = os.path.join(settings.CCD_IMAGES_DIR, 'download_jobs')
        if not os.path.exists(basedir):
            os.mkdir(basedir)

        jobpath = os.path.join(basedir, 'job_%s' % job['id'])

        # Se o diretório já existir e o debug estiver ligado remover o diretório
        if os.path.exists(jobpath) and settings.DEBUG is True:
            logger.info(
                "Job directory already exists. JobPath: [%s]" % jobpath)
            try:
                shutil.rmtree(jobpath)
                logger.info("Directory deleted. JobPath: [%s]" % jobpath)
            except OSError as e:
                logger.error("%s : %s" % (jobpath, e.strerror))

        # Cria o diretório
        os.mkdir(jobpath)

        # Configura o log para escrever uma copia no diretório.
        fh = logging.FileHandler(os.path.join(jobpath, 'download.log'))
        formatter = logging.Formatter(
            '%(asctime)s [%(levelname)s] %(message)s')
        fh.setFormatter(formatter)
        logger.addHandler(fh)

        # Alterar o status do job para running
        logger.info("Changing job status to running. JobId: [%s]" % job_id)
        job['status'] = 2
        job['path'] = jobpath
        job = db.update_record(job)

        logger.debug(job)

        # fazer a query para gerar a lista de ccds
        logger.info("Running the query to retrieve the ccds.")

        t0 = datetime.now()

        spdao = DesSkybotPositionDao(pool=True)

        dt_start = job['date_initial'].strftime("%Y-%m-%d 00:00:00")
        dt_end = job['date_final'].strftime("%Y-%m-%d 23:59:59")
        ccds = spdao.ccds_for_position(
            start=dt_start,
            end=dt_end,
            dynclass=job['dynclass'],
            name=job['name'])

        df = pd.DataFrame(ccds)

        t1 = datetime.now()
        tdelta = tdelta = t1 - t0

        # Atualiza no job a quantidade de ccds;
        job['ccds_to_download'] = len(ccds)

        # Atualizar no job a quantidade de nights
        t_nights = 0
        if len(ccds) > 0:
            t_nights = df['date_obs'].nunique()

        job['nights'] = t_nights

        # Atualizar o total de Asteroids relacionados ao job
        if job['name'] is not None:
            t_asteroids = 1
        else:
            t_asteroids = spdao.count_asteroids_by_dynclass(
                start=dt_start,
                end=dt_end,
                dynclass=job['dynclass'])
        job['asteroids'] = t_asteroids

        job = db.update_record(job)

        logger.info("%s CCDs returned in %s." %
                    (len(ccds), humanize.naturaldelta(tdelta, minimum_unit="milliseconds")))

        # Iniciando o Download dos CCDs
        results = download_des_ccds(job['id'], ccds)

        #  Guardar os resultados do Job em arquivo
        rows = []
        for row in results:
            record = dict({
                'id': row['id'],
                'start_time': None,
                'finish_time': None,
                'download_time': 0,
                'file_size': 0,
                'filename': None,
                'file_path': None,
            })
            if 'download_stats' in row:
                record.update({
                    'start_time': row['download_stats']['start_time'],
                    'finish_time': row['download_stats']['finish_time'],
                    'download_time': row['download_stats']['download_time'],
                    'file_size': row['download_stats']['file_size'],
                    'filename': row['download_stats']['filename'],
                    'file_path': row['download_stats']['file_path'],
                })
            rows.append(record)

        # Salva os resultados em um arquivo csv.
        file_result = save_result(rows, job['path'])

        # Cria o Time profile
        plot_time_profile(file_result, job['path'])

        # Recupera os dados do job atualizado
        job = db.get_by_id(job_id)

        # Total em bytes baixados neste job
        t_size_downloaded = cjrdao.file_size_by_job(job['id'])

        # Total de CCDs baixados no Job
        ccds_downloaded = cjrdao.count_by_job(job['id'])

        # Altera para o status para Completed
        job['status'] = 3
        job['ccds_downloaded'] = ccds_downloaded
        job['t_size_downloaded'] = t_size_downloaded
        job = db.update_record(job)

        logger.debug(job)

    except Exception as e:
        trace = traceback.format_exc()
        logger.error(trace)
        logger.error(e)
        # Recupera os dados do job atualizado
        job = db.get_by_id(job_id)
        # Altera o status para Failed
        job['status'] = 4
        # Guarda o erro
        job['error'] = str(e)

        db.complete_job(job)

    finally:
        # Recupera os dados do job atualizado
        job = db.get_by_id(job_id)

        # Calcula o tempo total de execução do Job.
        t0 = job['start']
        t1 = datetime.now(timezone.utc)
        tdelta = t1 - t0
        job['finish'] = t1
        job['execution_time'] = tdelta

        db.complete_job(job)
        logger.info("Job completed %s" %
                    humanize.naturaldelta(tdelta, minimum_unit="seconds"))
        logger.info("Done!")


def start_pipeline():

    logger.info("------------ Start Pipeline ------------")

    db = DownloadCcdJobDao(pool=False)

    # Verificar se já existe algum job com status Running.
    running = db.get_by_status(2)
    # self.logger.info("Checando a Fila: Running [%s]" % len(running))

    if len(running) == 0:
        # Se nao tiver nenhum job executando verifica se tem jobs com status Idle
        # esperando para serem executados.
        idle = db.get_by_status(1)
        if len(idle) > 0:

            logger.debug(
                "There are %s jobs waiting to run" % len(idle))

            to_run = idle[0]

            run_job(to_run['id'])
        else:
            logger.debug(
                "No jobs in the queue to run.")
    else:
        logger.debug(
            "There is already a job running.")
