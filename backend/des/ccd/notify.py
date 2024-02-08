import logging
import traceback

import humanize
from common.notify import Notify
from des.dao import DownloadCcdJobDao

logger = logging.getLogger("download_ccds")


def notify_start_job(job_id):
    try:
        db = DownloadCcdJobDao(pool=False)
        # Recupera o Model pelo ID
        job = db.get_by_id(job_id)
        user = db.get_user(job["owner_id"])

        context = dict(
            {
                "username": user["username"],
                "job_id": job["id"],
                "start": job["date_initial"],
                "end": job["date_final"],
                "dynclass": job["dynclass"],
                "nights": job["nights"],
                "asteroids": job["asteroids"],
                "ccds_to_download": job["ccds_to_download"],
                "estimated_execution_time": str(job["estimated_execution_time"]).split(
                    "."
                )[0],
                "estimated_t_size": humanize.naturalsize(int(job["estimated_t_size"])),
            }
        )

        Notify().send_html_email(
            subject="Download DES CCDs Job %s Started" % job_id,
            to=user["email"],
            template="notification_download_ccd_start.html",
            context=context,
        )

        logger.info("Sending start email to the user")

    except Exception as e:
        trace = traceback.format_exc()
        logger.error(trace)
        logger.error(e)


def notify_fail_job(job_id):
    try:
        db = DownloadCcdJobDao(pool=False)
        # Recupera o Model pelo ID
        job = db.get_by_id(job_id)
        user = db.get_user(job["owner_id"])

        context = dict(
            {
                "username": user["username"],
                "job_id": job["id"],
                "job_start": job["start"].strftime("%Y-%m-%d %H:%M:%S"),
                "job_end": job["finish"].strftime("%Y-%m-%d %H:%M:%S"),
                "execution_time": str(job["execution_time"]).split(".")[0],
            }
        )

        Notify().send_html_email(
            subject="Download DES CCDs Job %s Failed" % job_id,
            to=user["email"],
            template="notification_download_ccd_fail.html",
            context=context,
        )

        logger.info("Sending Fail email to the user")

    except Exception as e:
        trace = traceback.format_exc()
        logger.error(trace)
        logger.error(e)


def notify_finish_job(job_id):
    try:
        db = DownloadCcdJobDao(pool=False)
        # Recupera o Model pelo ID
        job = db.get_by_id(job_id)
        user = db.get_user(job["owner_id"])

        context = dict(
            {
                "username": user["username"],
                "job_id": job["id"],
                "start": job["date_initial"],
                "end": job["date_final"],
                "job_start": job["start"].strftime("%Y-%m-%d %H:%M:%S"),
                "job_end": job["finish"].strftime("%Y-%m-%d %H:%M:%S"),
                "dynclass": job["dynclass"],
                "nights": job["nights"],
                "asteroids": job["asteroids"],
                "ccds_to_download": job["ccds_to_download"],
                "ccds_downloaded": job["ccds_downloaded"],
                "estimated_execution_time": str(job["estimated_execution_time"]).split(
                    "."
                )[0],
                "execution_time": str(job["execution_time"]).split(".")[0],
                "estimated_t_size": humanize.naturalsize(int(job["estimated_t_size"])),
                "t_size_downloaded": humanize.naturalsize(
                    int(job["t_size_downloaded"])
                ),
            }
        )

        Notify().send_html_email(
            subject="Download DES CCDs Job %s Finished" % job_id,
            to=user["email"],
            template="notification_download_ccd_finish.html",
            context=context,
        )

        logger.info("Sending Finish email to the user")

    except Exception as e:
        trace = traceback.format_exc()
        logger.error(trace)
        logger.error(e)


def notify_abort_job(job_id):
    try:
        db = DownloadCcdJobDao(pool=False)
        # Recupera o Model pelo ID
        job = db.get_by_id(job_id)
        user = db.get_user(job["owner_id"])

        context = dict(
            {
                "username": user["username"],
                "job_id": job["id"],
                "job_start": job["start"].strftime("%Y-%m-%d %H:%M:%S"),
                "job_end": job["finish"].strftime("%Y-%m-%d %H:%M:%S"),
                "execution_time": str(job["execution_time"]).split(".")[0],
            }
        )

        Notify().send_html_email(
            subject="Download DES CCDs Job %s Aborted" % job_id,
            to=user["email"],
            template="notification_download_ccd_abort.html",
            context=context,
        )

        logger.info("Sending Abort email to the user")

    except Exception as e:
        trace = traceback.format_exc()
        logger.error(trace)
        logger.error(e)
