import logging
import time
from concurrent.futures import ThreadPoolExecutor, as_completed, wait
from datetime import datetime, timezone, timedelta
import humanize
from random import randrange
from django.conf import settings
from urllib.parse import urljoin
from common.download import Download
import os
from tno.models import Pointing, CcdImage
import subprocess


def unpack_fz(filepath):
    # Descompactar .fz -> .fits usando funpack no sistema.
    process = subprocess.Popen(["funpack %s" % filepath],
                               stdin=subprocess.PIPE, stdout=subprocess.PIPE, stderr=subprocess.PIPE, shell=True)

    out, error = process.communicate()

    if process.returncode > 0:
        raise Exception(
            "Failed to run Funpack. OUT: [%s] Error: [%s]" % (out.decode("utf-8"), error.decode("utf-8")))


def download_ccd(idx, ccd, base_url, ccd_image_dir, auth):
    logger = logging.getLogger('download_ccds')
    logger.debug("Downloading IDX: [%s] CCD_ID: [%s] Filename: [%s]" % (
        idx, ccd['id'], ccd['filename']))

    try:
        start = datetime.now(timezone.utc)

        # Iniciar o Download aqui
        filename = ccd['filename'] + ccd['compression']
        download_url = '/'.join([base_url, ccd['path'], filename])

        logger.debug(download_url)

        filepath, download_stats = Download().download_file_from_url(
            download_url, ccd_image_dir, filename, timeout=60, auth=auth)

        # Double Check
        if not os.path.exists(filepath):
            raise("Failed to download the file.")

        # Termino do Download
        finish = datetime.now(timezone.utc)
        tdelta = finish - start
        logger.debug("Downloaded  IDX: [%s] CCD_ID: [%s] in %s" % (
            idx, ccd['id'], humanize.naturaldelta(tdelta)))

        # Descompactar .fz para .fits
        unpack_fz(filepath)

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


def register_download(ccd):
    logger = logging.getLogger('download_ccds')

    try:
        # Recuperar o Apontamento
        pointing = Pointing.objects.get(id=ccd['id'])
        logger.debug("Pointing Id: %s" % pointing.id)

    except Pointing.DoesNotExist:
        logger.warning("DoesNotExist: ID [ %s ] Filename: [ %s ]" % (
            ccd['id'], ccd['filename']))

    try:
        record, created = CcdImage.objects.update_or_create(
            desfile_id=pointing.desfile_id,
            filename=ccd['filename'],
            defaults={
                'pointing': pointing,
                'download_start_time': ccd['download_stats']['start_time'],
                'download_finish_time': ccd['download_stats']['finish_time'],
                'download_time': timedelta(seconds=ccd['download_stats']['download_time']),
                'file_size': ccd['download_stats']['file_size'],
            }
        )

        record.save()
        pointing.downloaded = True
        pointing.save()

        logger.info("CCD Image: ID [ %s ] Created: [ %s ] Filename: [ %s ]" %
                    (record.id, created, record.filename))
    except Exception as e:
        logger.error(e)


def download_des_ccds(ccds, max_workers=10):

    logger = logging.getLogger('download_ccds')
    logger.info("--------------------------------------------------")
    logger.info("Started Download DES CCDs")
    logger.info("CCDs: [%s]" % len(ccds))

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
                download_ccd,
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
            register_download(ccd)
        else:
            failed += 1

    # Termino do Download
    finish = datetime.now(timezone.utc)
    tdelta = finish - start
    logger.debug("Downloaded [%s] CCDs In %s. \nNot Downloaded [%s]" % (
        downloaded, humanize.naturaldelta(tdelta), failed))
    logger.info("Done!")

    return downloaded


def count_available_des_ccds(ccds):
    ccd_image_dir = settings.CCD_IMAGES_DIR
    count = 0

    for ccd in ccds:
        # Verificar se o ccd existe no diretório,
        filepath = os.path.join(ccd_image_dir, ccd['filename'])
        if os.path.exists(filepath):
            count += 1

    return count
