# Create your tasks here
import logging
from datetime import datetime
from typing import Optional

from celery import group, shared_task

from tno.prediction_map import (
    garbage_collector_maps,
    sora_occultation_map,
    upcoming_events_to_create_maps,
)
from tno.occviz import occultation_path_coeff2, visibility_from_coeff
from tno.models import Occultation
from time import sleep


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
def create_occ_map_task(**kwargs):
    return sora_occultation_map(**kwargs)


@shared_task
def prediction_maps_log_error(request, exc, traceback):
    logger = logging.getLogger("predict_maps")
    logger.error(f"{request.id} {exc} {traceback}")


@shared_task
def create_prediction_maps():
    # Exemplo de como executar a task manualmente pelo bash do container
    # python manage.py shell -c "from tno.tasks import create_prediction_maps;create_prediction_maps.delay()"
    logger = logging.getLogger("predict_maps")
    logger.info("---------------------------------")
    logger.info("Start of creating prediction maps")

    t0 = datetime.now()

    to_run = upcoming_events_to_create_maps()

    logger.info(f"Tasks to be executed in this block: [{len(to_run)}].")

    # Celery tasks signature
    header = [create_occ_map_task.s(**i) for i in to_run]
    job = group(header)
    job.link_error(prediction_maps_log_error.s())

    job.apply_async()

    logger.info(f"All subtasks are submited.")

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
    output = occultation_path_coeff2(**kwargs)
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
def assync_visibility_from_coeff(event_id, **kwargs):
    is_visible, info = visibility_from_coeff(**kwargs)
    return event_id, bool(is_visible)


@shared_task
def update_asteroid_table():
    """Updates the asteroid table data using data downloaded from MPC."""
    from tno.asteroid_table.asteroid_table_manager import AsteroidTableManager

    atm = AsteroidTableManager()
    atm.run_update_asteroid_table()
