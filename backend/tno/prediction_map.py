import logging
from datetime import datetime, timezone
from pathlib import Path
from typing import Optional, Union

import humanize
from django.conf import settings
from sora.prediction.occmap import plot_occ_map as occmap

from tno.models import Occultation
import os

import numpy as np
from itertools import groupby
from operator import itemgetter

def get_size_of_map_folder():
    maps_directory = Path(settings.PREDICTION_MAP_DIR)
    return sum(f.stat().st_size for f in maps_directory.glob('**/*') if f.is_file())

def get_map_folder_size_limit():
    # Tamanho maximo desejado em Mb para a pasta de mapas.
    max_folder_size = int(
        settings.PREDICTION_MAP_MAX_FOLDER_SIZE) * 1000 * 1000
    # Limite é 90% do total, deve ter pelo menos 10% livre
    min_free = (max_folder_size * 0.1)
    size_limit = max_folder_size - min_free
    return size_limit


def map_event_has_already_happened(filepath: Path) -> bool:
    # checks if the event has already happened
    # Considera que o evento já aconteceu quando se passa mais de um dia do evento
    now_utc = datetime.utcnow()
    filename = filepath.name
    event_dt = filename.strip('.jpg').split('-')[1]
    date_time = datetime.strptime(event_dt, '%Y%m%d%H%M%S')
    dt = now_utc.date() - date_time.astimezone(tz=timezone.utc).date()
    if dt.days > 0:
        return True
    return False


def garbage_collector_maps():
    logger = logging.getLogger("garbage_collector")
    logger.debug("Starting garbage collector for predictions maps")

    t0 = datetime.now()
    maps_directory = Path(settings.PREDICTION_MAP_DIR)

    size_before = get_size_of_map_folder()
    logger.debug(
        f"Maps folder Size before {humanize.naturalsize(size_before)}")

    count_removed = 0
    size_reclaimed = 0
    for path in maps_directory.glob('*.jpg'):
        if map_event_has_already_happened(path):
            size = path.stat().st_size
            path.unlink()
            count_removed += 1
            size_reclaimed += size

    size_after = get_size_of_map_folder()
    logger.debug(f"Maps folder Size After {humanize.naturalsize(size_after)}")

    t1 = datetime.now()
    dt = t1 - t0
    logger.info(
        f"Predict Maps: {count_removed} removed {humanize.naturalsize(size_reclaimed)} Reclaimed in {humanize.naturaldelta(dt, minimum_unit='microseconds')}")


def map_folder_have_free_space() -> bool:
    logger = logging.getLogger("predict_maps")

    size_limit = get_map_folder_size_limit()
    logger.debug(f"Maps folder size limit: {humanize.naturalsize(size_limit)}")
    # O Tamanho maximo não é absoluto, podendo variar para mais
    # Exemplo 68% ocupado, vai executar a criação de mais mapas
    # Podendo extrapolar o tamanho maximo desejado.
    current_size = get_size_of_map_folder()
    logger.debug(
        f"Maps folder current size: {humanize.naturalsize(current_size)}")

    # Tem pelo menos 30% livre
    have_free_space = current_size < size_limit
    logger.debug(f"Maps folder have free space?: {have_free_space}")
    return have_free_space

def upcoming_events_to_create_maps() -> list:
    logger = logging.getLogger("predict_maps")
    logger.info(f"Looking for upcoming events")

    # Checar o tamanho da pasta x tamanho limite im MB
    # Recupera proximos eventos
    # Dividir em blocos 100
    # checa se já existe mapa.
    # Checa se a predição é mais recente do que o arquivo mapa.
    # Retorna uma lista de eventos que precisam de mapa.

    # Pasta de mapas tem espaço?
    if not map_folder_have_free_space():
        logger.info("There is not enough free space.")
        return []

    # Os mapas são gerados em lotes, caso um lote extrapole o limite
    # O proximo só será executado quando tiver algum espaço livre na pasta
    events = []
    # Block size determina quantas tasks serao criadas
    block_size = int(settings.PREDICTION_MAP_BLOCK_SIZE)
    now = datetime.utcnow()
    next_events = Occultation.objects.filter(
        date_time__gte=now).order_by('date_time')

    logger.debug(f"Next events count: {next_events.count()}")
    for obj in next_events:
        # Verifica se existe mapa já criado e se esta atualizado
        if obj.map_is_updated():
            # logger.debug(
            #     f"Predict event {obj.id} ignored because the map is already updated.")
            continue

        events.append({
            "name": obj.name,
            "diameter": obj.diameter,
            "ra_star_candidate": obj.ra_star_candidate,
            "dec_star_candidate": obj.dec_star_candidate,
            "date_time": obj.date_time.isoformat(),
            "closest_approach": obj.closest_approach,
            "position_angle": obj.position_angle,
            "velocity": obj.velocity,
            "delta": obj.delta,
            "g": obj.g,
            "long": obj.long,
            "filepath": str(obj.get_map_filepath())
        })

        if len(events) == block_size:
            break

    logger.debug(f"Events in this block: {len(events)}.")
    return events


def sora_occultation_map(
        name: str,
        diameter: Optional[float],
        ra_star_candidate: str,
        dec_star_candidate: str,
        date_time: Union[datetime, str],
        closest_approach: float,
        position_angle: float,
        velocity: float,
        delta: float,
        g: float,
        long: float,
        filepath: Union[Path, str],
        dpi: int = 50) -> str:

    if isinstance(filepath, str):
        filepath = Path(filepath)
    if isinstance(date_time, str):
        date_time = datetime.fromisoformat(date_time)

    filename = filepath.name
    fname, fmt = filename.split('.')
    path = filepath.parent

    radius = float(diameter / 2) if diameter != None else 0
    coord = f"{ra_star_candidate}{dec_star_candidate}"
    # Time format is isoformat in UTC withou +00:00
    # ex: 2023-09-26T00:54:13.683590Z
    time = date_time.isoformat().replace("+00:00", "Z")
    occmap(
        name=name,
        radius=radius,
        coord=coord,
        time=time,
        ca=closest_approach,
        pa=position_angle,
        vel=velocity,
        dist=delta,
        mag=g,
        longi=long,
        dpi=dpi,
        nameimg=fname,
        path=path,
        fmt=fmt)

    if not filepath.exists():
        raise Exception(f"Map file was not generated. {filepath}")

    return str(filename)



def get_longest_consecutive_numbers(numbers):
    # https://stackoverflow.com/questions/55616217/find-longest-consecutive-range-of-numbers-in-list
    idx = max(
        (
            list(map(itemgetter(0), g)) 
            for i, g in groupby(enumerate(np.diff(numbers)==1), itemgetter(1)) 
            if i
        ), 
        key=len
    )
    return (idx[0], idx[-1]+1)



def maps_folder_stats():
    
    # Verifica a situação do diretório de mapas.
    map_paths = sorted(Path(settings.PREDICTION_MAP_DIR).iterdir(), key=os.path.getmtime)

    maps_count = len(map_paths)
    maps_dates = []
    for map_path in map_paths:
        filename = map_path.name
        event_dt = filename.strip('.jpg').split('-')[1]
        date = datetime.strptime(event_dt, '%Y%m%d%H%M%S').date()
        maps_dates.append(date)

    oldest_file = datetime.fromtimestamp(map_paths[0].stat().st_mtime)
    newest_file = datetime.fromtimestamp(map_paths[-1].stat().st_mtime)

    # Remove Duplicated dates
    maps_dates = sorted(list(set(maps_dates)))

    first_map = maps_dates[0]
    last_map = maps_dates[-1]

    if len(maps_dates) > 1:
        # Convert dates to integer
        date_ints = [d.toordinal() for d in maps_dates]
        start, end = get_longest_consecutive_numbers(list(date_ints))
        first_map = maps_dates[start]
        last_map = maps_dates[end]

        return {
            "maps_count": maps_count,
            "maps_total_size": get_size_of_map_folder(),
            "maps_size_limit": get_map_folder_size_limit(),
            "period": [first_map.isoformat(), last_map.isoformat()],
            "oldest_file": oldest_file.astimezone(tz=timezone.utc).isoformat(),
            "newest_file": newest_file.astimezone(tz=timezone.utc).isoformat(),
        }   
    
    