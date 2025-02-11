# Create your tasks here
import json
import logging
import math
from datetime import datetime, timezone
from pathlib import Path
from time import sleep
from typing import Optional

import pandas as pd
from celery import chain, group, shared_task
from dateutil.relativedelta import relativedelta
from django.conf import settings
from django.core.cache import cache
from tno.dao.asteroid_cache import AsteroidCacheDao
from tno.dao.dynclass_cache import DynclassCacheDao
from tno.dao.occultation import OccultationDao
from tno.models import DynclassCache, Highlights, Occultation
from tno.occviz import occultation_path_coeff, visibility_from_coeff
from tno.predict_job import (
    run_predicition_for_upper_end_update,
    run_prediction_for_updated_asteroids,
)
from tno.prediction_map import (
    garbage_collector_maps,
    sora_occultation_map,
    upcoming_events_to_create_maps,
)


@shared_task
def add(x=2, y=2):
    # Example task
    print("Executou Add!")
    return x + y


@shared_task
def teste_periodic_task():
    # Example Periodic task
    # Tarefa configurada para executar a cada 30 segundos
    # Proposito de exemplo de funcionamento de uma tarefa periodica com
    # Celery beat
    print(f"Executou Tarefa Pediodica. {datetime.now()}")
    return True


@shared_task
def teste_api_task():
    # Exemplo de task sendo executada por uma chamada na api
    # http://localhost/api/teste/
    print(f"Executou Tarefa submetida pela API. {datetime.now()}")
    return True


@shared_task
def garbage_collector():
    """Executado a cada 3 horas
    OBS: esta função não é exclusiva para os mapas.
    Outras funções de garbage collector podem ser adicionadas aqui.
    """
    # Remove expired Predict Maps
    garbage_collector_maps()


@shared_task
def predict_jobs_by_updated_asteroids(**kwargs):
    if settings.PREDICTION_JOB_AUTO_UPDATE == True:
        run_prediction_for_updated_asteroids(debug=False)


@shared_task
def predict_jobs_for_upper_end_update(**kwargs):
    if settings.PREDICTION_JOB_AUTO_UPDATE == True:
        run_predicition_for_upper_end_update(debug=False)


@shared_task
def create_occ_map_task(**kwargs):
    sora_occultation_map(**kwargs)


@shared_task
def prediction_maps_log_error(request, exc, traceback):
    logger = logging.getLogger("predict_maps")
    logger.error(f"{request.id} {exc} {traceback}")


@shared_task
def create_thumbnail_maps():
    logger = logging.getLogger("predict_maps")
    logger.info("Starting create_thumbnail_maps task")

    # Get upcoming events
    to_run = upcoming_events_to_create_maps()
    logger.info(f"Tasks to be executed in this block: [{len(to_run)}].")

    # Celery tasks signature
    header = [create_occ_map_task.s(**i) for i in to_run]
    job = group(header)
    job.link_error(prediction_maps_log_error.s())

    results = job.apply_async()
    logger.info(f"All [{len(results)}] subtasks are submited.")

    # Util em desenvolvimento para acompanhar as tasks
    # # Submete as tasks aos workers
    # result = job.apply_async()

    # # Aguarda todas as subtasks terminarem
    # while result.ready() == False:
    #     print(f"Completed: {result.completed_count()}")
    #     sleep(3)

    # t2 = datetime.now()
    # dt = t2 - t0
    # logger.info(f"All {len(to_run)} tasks completed in {humanize.naturaldelta(dt)}")


@shared_task
def calculate_occultation_path(occultation_id, **kwargs):
    print(f"calculate_occultation_path: {occultation_id}")
    output = occultation_path_coeff(**kwargs)
    print(output)
    occ_event = Occultation.objects.get(pk=occultation_id)

    occ_event.have_path_coeff = False
    occ_event.occ_path_min_longitude = None
    occ_event.occ_path_max_longitude = None
    occ_event.occ_path_min_latitude = None
    occ_event.occ_path_max_latitude = None
    occ_event.occ_path_is_nightside = None
    occ_event.occ_path_coeff = {}

    if output["coeff_latitude"] != None and output["coeff_longitude"] != None:
        occ_event.have_path_coeff = True
        occ_event.occ_path_min_longitude = (
            float(output["min_longitude"]) if output["min_longitude"] != None else None
        )
        occ_event.occ_path_max_longitude = (
            float(output["max_longitude"]) if output["max_longitude"] != None else None
        )
        occ_event.occ_path_min_latitude = (
            float(output["min_latitude"]) if output["min_latitude"] != None else None
        )
        occ_event.occ_path_max_latitude = (
            float(output["max_latitude"]) if output["max_latitude"] != None else None
        )
        occ_event.occ_path_is_nightside = bool(output["nightside"])
        occ_event.occ_path_coeff = output

    occ_event.save()

    return {"occultation_id": occultation_id, "have_coeff": occ_event.have_path_coeff}


@shared_task
def create_occultation_path_coeff():
    now = datetime.utcnow()
    next_events = Occultation.objects.filter(
        date_time__gte=now, have_path_coeff=False
    ).order_by("date_time")[0:500]

    # Desenvolvimento apenas!
    # Cria os paths para um periodo especifico.
    # print("-----------------------------------")
    # now = datetime.strptime(f"2023-08-01 00:00:00", '%Y-%m-%d %H:%M:%S')
    # next_events = Occultation.objects.filter(
    #     date_time__gte=now, have_path_coeff=False).order_by('date_time')[0:20000]
    # print(len(next_events))
    # print("-----------------------------------")

    job = group(
        calculate_occultation_path.s(
            occultation_id=event.id,
            date_time=event.date_time.isoformat(),
            ra_star_candidate=event.ra_star_candidate,
            dec_star_candidate=event.dec_star_candidate,
            closest_approach=event.closest_approach,
            position_angle=event.position_angle,
            velocity=event.velocity,
            delta_distance=event.delta,
            offset_ra=event.off_ra,
            offset_dec=event.off_dec,
            object_diameter=event.diameter,
            ring_radius=None,
        )
        for event in next_events
    )

    # Submete as tasks aos workers
    job.apply_async()

    return len(next_events)
    # # Util em desenvolvimento para acompanhar as tasks
    # # Aguarda todas as subtasks terminarem
    # result = job.apply_async()
    # while result.ready() == False:
    #     print(f"Coeff Completed: {result.completed_count()}")
    #     sleep(3)


@shared_task
def assync_visibility_from_coeff(event_id, result_file, **kwargs):
    is_visible = visibility_from_coeff(**kwargs)

    if is_visible:
        with open(Path(result_file)) as fp:
            job = json.load(fp)
            job["results"].append(event_id)

        with open(Path(result_file)) as fp:
            json.dump(job, fp)

    return event_id, bool(is_visible)


@shared_task(soft_time_limit=7200, time_limit=10800)
def update_asteroid_table():
    """Updates the asteroid table data using data downloaded from MPC."""
    from tno.asteroid_table.asteroid_table_manager import AsteroidTableManager

    atm = AsteroidTableManager()
    atm.run_update_asteroid_table()


@shared_task
def run_subscription_filter_task(force_run=False):
    """
    Executes the event filters based on user preferences.
    """
    from newsletter.process_event_filter import ProcessEventFilters

    logger = logging.getLogger("subscription")
    logger.info(" Starting Celery run_subscription filter_task ".center(52, "#"))
    try:
        process = ProcessEventFilters(stdout=True)
        process.run_filter(force_run=force_run)
    except Exception as e:
        logger.error(f"Error in run_subscription_filter_task: {e}", exc_info=True)
        raise


@shared_task
def send_mail_subscription_task():
    """
    Sends emails based on processed event filters.
    """
    from newsletter.events_send_mail import SendEventsMail

    logger = logging.getLogger("subscription")
    logger.info(" Starting Celery send_mail_subscription_task ".center(52, "#"))
    try:
        sendmail = SendEventsMail(stdout=True)
        sendmail.exec_send_mail()
        logger.info("send_mail_subscription_task completed successfully")
    except Exception as e:
        logger.error(f"Error in send_mail_task: {e}", exc_info=True)
        raise


@shared_task
def run_subscription_filter_and_send_mail(force_run=False):
    """
    Chains run_filter_task and send_mail_task to run sequentially.
    """
    logger = logging.getLogger("subscription")
    logger.info(" Starting subscription task workflow ".center(52, "#"))
    try:
        workflow = chain(
            run_subscription_filter_task.s(force_run=force_run),
            send_mail_subscription_task.si(),
        )
        workflow.apply_async()
        logger.info(
            "Chained run_subscription_filter_task and send_mail_subscription_task successfully"
        )
    except Exception as e:
        logger.error(
            f"Error in run_subscription_filter_and_send_mail: {e}", exc_info=True
        )
        raise


@shared_task
def update_asteroid_classes_cache():

    update_base_dynclass_cache()
    update_dynclass_cache()


def update_base_dynclass_cache():
    queryset = DynclassCache.objects.order_by("skybot_dynbaseclass")

    rows = [x.skybot_dynbaseclass for x in queryset]
    result = {"results": rows, "count": len(rows)}

    # Store the data in the cache
    cache.set("base_dynclass_with_prediction", result, 86400)
    return None


def update_dynclass_cache():
    queryset = DynclassCache.objects.order_by("skybot_dynsubclass")

    rows = [x.skybot_dynsubclass for x in queryset]
    result = {"results": rows, "count": len(rows)}

    # Store the data in the cache
    cache.set("dynclass_with_prediction", result, 86400)
    return None


@shared_task
def update_occultations_highlights():

    logger = logging.getLogger("occultation_highlights")
    logger.info("---------------------------------------")
    logger.info("Starting Occultation Highlights queries")

    today_utc = datetime.now(timezone.utc).date()
    logger.info(f"TODAY UTC: {today_utc}")

    # Model instance to store the highlights
    highlights = Highlights()

    logger.info("Quering the monthly forecast occultations")
    month_count = Occultation.objects.filter(
        date_time__date__month=today_utc.month
    ).count()
    logger.info(f"Month count: {month_count} for month {today_utc.month}")
    highlights.month_count = month_count

    logger.info("Quering the next month occultations")
    next_month = today_utc + relativedelta(months=1)
    next_month_count = Occultation.objects.filter(
        date_time__date__month=next_month.month
    ).count()
    logger.info(f"Next Month count: {month_count} for month {today_utc.month}")
    highlights.next_month_count = next_month_count

    logger.info("Quering the weekly forecast occultations")
    week_number = today_utc.isocalendar().week
    week_count = Occultation.objects.filter(date_time__date__week=week_number).count()
    logger.info(f"Week count: {week_count} for week {week_number}")
    highlights.week_count = week_count

    logger.info("Quering the next week occultations")
    next_week_number = week_number + 1
    next_week_count = Occultation.objects.filter(
        date_time__date__week=next_week_number
    ).count()
    logger.info(f"Next Week count: {next_week_count} for week {next_week_number}")
    highlights.next_week_count = next_week_count

    logger.info("Quering today occultations")
    today_count = Occultation.objects.filter(date_time__date=today_utc).count()
    logger.info(f"Today count: {today_count} for {today_utc}")
    highlights.day_count = today_count

    logger.info("Quering the total occultations count")
    occultations_count = Occultation.objects.count()
    logger.info(f"Total occultations count: {occultations_count}")
    highlights.occultations_count = occultations_count

    if occultations_count > 0:

        logger.info("Quering the unique asteroids")
        unique_asteroids = Occultation.objects.values("name").distinct().count()
        logger.info(f"Unique asteroids: {unique_asteroids}")
        highlights.unique_asteroids = unique_asteroids

        logger.info("Quering the earliest occultation")
        earliest_occultation = Occultation.objects.earliest("date_time").date_time
        logger.info(f"Earliest occultation: {earliest_occultation}")
        highlights.earliest_occultation = earliest_occultation

        logger.info("Quering the latest occultation")
        latest_occultation = Occultation.objects.latest("date_time").date_time
        logger.info(f"Latest occultation: {latest_occultation}")
        highlights.latest_occultation = latest_occultation

    logger.info("Saving the highlights")
    highlights.save()

    highlights.refresh_from_db()
    logger.info(f"Highlights saved successfully with the following id: {highlights.id}")
    return highlights.id


@shared_task
def update_unique_asteroids():

    logger = logging.getLogger("asteroid_cache")
    logger.info("---------------------------------------")
    logger.info("Starting Unique Asteroids queries")

    occ_dao = OccultationDao(pool=False)
    ast_dao = AsteroidCacheDao(pool=False)
    logger.info("Counting the distinct asteroid names")
    count_asteroids = occ_dao.count_distict_asteroid_name()
    logger.info(f"Distinct asteroid names: {count_asteroids}")

    page = 0
    limit = 10000
    offset = 0
    current_count = 0
    total_pages = math.ceil(count_asteroids / limit)

    logger.info(f"Total pages: {total_pages}")

    while page < total_pages:
        logger.info(f"Querying page: {page} of {total_pages}")
        rows = occ_dao.distinct_asteroid_name(limit=limit, offset=offset)
        logger.info(f"Query returned {len(rows)} rows.")

        df = pd.DataFrame(
            rows,
            columns=["distinct_1", "number", "principal_designation", "alias"],
        )
        df = df.rename(columns={"distinct_1": "name"})

        # 1. Criar uma coluna com a contagem de valores preenchidos em cada linha
        df["non_null_count"] = df.notna().sum(axis=1)
        # 2. Para cada valor duplicado em 'principal_designation', selecionar o índice da linha com a maior contagem
        idx = df.groupby("principal_designation")["non_null_count"].idxmax()
        # 3. Filtrar o DataFrame mantendo apenas as linhas selecionadas e remover a coluna auxiliar
        df = df.loc[idx].drop(columns="non_null_count")

        df.to_csv("/data/tmp/unique_asteroids.csv", index=False)

        # Tratamento dos valores nulos
        df["number"] = df["number"].fillna(0)
        df["number"] = df["number"].astype(int)
        df["number"] = df["number"].astype(str)
        df["number"] = df["number"].replace("0", "")

        # 1. Criar uma coluna com a contagem de valores preenchidos em cada linha
        df["non_null_count"] = df.notna().sum(axis=1)
        # 2. Para cada valor duplicado em 'principal_designation', selecionar o índice da linha com a maior contagem
        idx = df.groupby("principal_designation")["non_null_count"].idxmax()
        # 3. Filtrar o DataFrame mantendo apenas as linhas selecionadas e remover a coluna auxiliar
        df = df.loc[idx].drop(columns="non_null_count")

        logger.info(f"Upinserting {len(df)} rows")
        row_affected = ast_dao.upinsert(df)
        logger.info(f"Upinserted {row_affected} rows")

        current_count += row_affected
        page += 1
        offset += limit

    logger.info(f"Finished updating the unique asteroids. Total: {current_count}")
    return current_count


@shared_task
def update_unique_dynclass():

    logger = logging.getLogger("asteroid_cache")
    logger.info("---------------------------------------")
    logger.info("Starting Unique Dynclass queries")

    occ_dao = OccultationDao(pool=False)
    dyc_dao = DynclassCacheDao(pool=False)

    # OBS: Esta query em produção pode demorar mais de 1 minuto para ser executada
    rows = occ_dao.distinct_dynclass()
    logger.info(f"Query returned {len(rows)} rows.")

    df = pd.DataFrame(
        rows,
        columns=["distinct_1", "base_dynclass"],
    )
    df = df.rename(
        columns={
            "distinct_1": "skybot_dynsubclass",
            "base_dynclass": "skybot_dynbaseclass",
        }
    )

    logger.info(f"Upinserting {len(df)} rows")
    row_affected = dyc_dao.upinsert(df)
    logger.info(f"Upinserted {row_affected} rows")

    logger.info(f"Finished updating the unique asteroids. Total: {row_affected}")
    return row_affected
