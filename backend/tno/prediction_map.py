import logging
import os
from datetime import datetime, time, timezone
from itertools import groupby
from operator import itemgetter
from pathlib import Path
from typing import Optional, Union

import humanize
import numpy as np
from django.conf import settings
from django.db.models import Q
from sora.prediction.occmap import plot_occ_map
from tno.models import Occultation


def get_size_of_map_folder():
    maps_directory = Path(settings.PREDICTION_MAP_DIR)
    return sum(f.stat().st_size for f in maps_directory.glob("**/*") if f.is_file())


def get_map_folder_desired_size():
    # Tamanho maximo desejado em Mb para a pasta de mapas.
    max_folder_size = int(settings.PREDICTION_MAP_MAX_FOLDER_SIZE) * 1000 * 1000
    return max_folder_size


def get_map_folder_size_limit():
    max_folder_size = get_map_folder_desired_size()
    # Limite é 90% do total, deve ter pelo menos 10% livre
    min_free = max_folder_size * 0.1
    size_limit = max_folder_size - min_free
    return size_limit


def map_event_has_already_happened(path: Path) -> bool:
    # checks if the event has already happened
    # Considera que o evento já aconteceu quando se passa mais de um dia do evento
    now_utc = datetime.utcnow().date()
    event_date = (
        datetime.strptime(path.name, "%Y-%m-%d").astimezone(tz=timezone.utc).date()
    )
    dt = now_utc - event_date

    if dt.days > 0:
        return True
    return False


def delete_old_maps(path: Path):
    # iterate over maps files and delete
    count_removed = 0
    for path in path.glob("*"):
        if path.is_file():
            path.unlink()
            count_removed += 1
    return count_removed


def garbage_collector_maps():
    logger = logging.getLogger("garbage_collector")
    logger.debug("Starting garbage collector for predictions maps")

    t0 = datetime.now()
    maps_directory = Path(settings.PREDICTION_MAP_DIR)

    size_before = get_size_of_map_folder()
    logger.debug(f"Maps folder Size before {humanize.naturalsize(size_before)}")

    count_removed = 0
    size_reclaimed = 0

    # Iterate over maps subdirectories named as the date of the event
    for event_dir in maps_directory.iterdir():
        if not event_dir.is_dir():
            continue

        if map_event_has_already_happened(event_dir):
            print(f"Event has already happened: {event_dir}")
            size = sum(file.stat().st_size for file in event_dir.rglob("*"))
            count_removed += delete_old_maps(event_dir)
            size_reclaimed += size
            event_dir.rmdir()

    size_after = get_size_of_map_folder()
    logger.debug(f"Maps folder Size After {humanize.naturalsize(size_after)}")

    t1 = datetime.now()
    dt = t1 - t0
    logger.info(
        f"Predict Maps: {count_removed} removed {humanize.naturalsize(size_reclaimed)} Reclaimed in {humanize.naturaldelta(dt, minimum_unit='microseconds')}"
    )


def map_folder_have_free_space() -> bool:
    logger = logging.getLogger("predict_maps")

    size_limit = get_map_folder_size_limit()
    logger.debug(f"Maps folder size limit: {humanize.naturalsize(size_limit)}")
    # O Tamanho maximo não é absoluto, podendo variar para mais
    # Exemplo 68% ocupado, vai executar a criação de mais mapas
    # Podendo extrapolar o tamanho maximo desejado.
    current_size = get_size_of_map_folder()
    logger.debug(f"Maps folder current size: {humanize.naturalsize(current_size)}")

    # Tem pelo menos 30% livre
    have_free_space = current_size < size_limit
    logger.debug(f"Maps folder have free space?: {have_free_space}")
    return have_free_space


def upcoming_events_to_create_maps(
    date_start: Optional[str] = None,
    date_end: Optional[str] = None,
    limit: Optional[int] = None,
    magnitude_limit: Optional[int] = 15,
) -> list:
    logger = logging.getLogger("predict_maps")
    logger.info(f"Looking for upcoming events")

    # Checar o tamanho da pasta x tamanho limite im MB
    # Recupera proximos eventos
    # Dividir em blocos
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
    if limit != None:
        block_size = int(limit)

    if date_start == None:
        date_start = datetime.now(timezone.utc)  # Corrected UTC handling
    if isinstance(date_start, str):
        date_start = datetime.fromisoformat(date_start).astimezone(tz=timezone.utc)

    next_events = Occultation.objects.filter(date_time__gte=date_start).order_by(
        "date_time"
    )

    if isinstance(date_end, str):
        date_end = datetime.fromisoformat(date_end).astimezone(tz=timezone.utc)
        next_events = next_events.filter(date_time__lte=date_end)

    logger.info(f"Next events count: {next_events.count()}")
    logger.info(f"Query: {next_events.query}")

    # lets avoid bring all data
    reached_block_size = False
    i = 0
    while not reached_block_size:

        event_data = next_events[i * block_size : (i + 1) * block_size]

        # iterate over the first block
        for obj in event_data:

            # Verifica se existe mapa já criado e se esta atualizado
            if obj.map_is_updated():
                # logger.debug(
                #     f"Predict event {obj.id} ignored because the map is already updated.")
                continue

            events.append(
                {
                    "name": obj.name,
                    "diameter": obj.diameter,
                    "ra_star_candidate": obj.ra_star_candidate,
                    "dec_star_candidate": obj.dec_star_candidate,
                    "date_time": obj.date_time.isoformat(),
                    "closest_approach": obj.closest_approach,
                    "position_angle": obj.position_angle,
                    "velocity": obj.velocity,
                    "delta": obj.delta,
                    "g": obj.g_star,
                    "long": obj.long,
                    "error": (
                        None
                        if obj.closest_approach_uncertainty is None
                        else obj.closest_approach_uncertainty * 1000
                    ),  # it is multiplied by 1000 because sora need the value in miliarcsec
                    "filepath": str(obj.get_map_filepath()),
                    "labels": False,
                    "mapstyle": 2,
                    "arrow": False,
                    "dpi": 16,
                    "resolution": 3,
                    "zoom": 1,
                }
            )

            # if block size was reached break imediately
            if len(events) == block_size:
                break

        if len(events) >= block_size:
            reached_block_size = True
            break
        else:
            i += 1

    events = events[:block_size]
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
    dpi: Optional[int] = 200,
    error: Optional[float] = None,
    labels: Optional[bool] = True,
    arrow: Optional[bool] = True,
    mapstyle: Optional[int] = 1,
    resolution: Optional[int] = 2,
    zoom: Optional[int] = 1,
) -> str:

    if isinstance(filepath, str):
        filepath = Path(filepath)
    if isinstance(date_time, str):
        date_time = datetime.fromisoformat(date_time)

    filename = filepath.name
    fname, fmt = filename.split(".")
    path = filepath.parent
    path.mkdir(parents=True, exist_ok=True)

    logger = logging.getLogger("predict_maps")

    radius = float(diameter / 2) if diameter != None else 0
    coord = f"{ra_star_candidate}{dec_star_candidate}"
    # Time format is isoformat in UTC withou +00:00
    # ex: 2023-09-26T00:54:13.683590Z
    time = date_time.isoformat().replace("+00:00", "Z")
    plot_occ_map(
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
        fmt=fmt,
        error=error,
        lncolor="#00468D",
        ptcolor="#00468D",
        ercolor="#D32F2F",
        outcolor="#D3D3D3",
        labels=labels,
        mapstyle=mapstyle,
        arrow=arrow,
        resolution=resolution,
        zoom=zoom,
    )

    if not filepath.exists():
        raise Exception(f"Map file was not generated. {filepath}")

    return str(filename)


def get_longest_consecutive_numbers(numbers):
    numbers = sorted(numbers)
    try:
        # https://stackoverflow.com/questions/55616217/find-longest-consecutive-range-of-numbers-in-list
        idx = max(
            (
                list(map(itemgetter(0), g))
                for i, g in groupby(enumerate(np.diff(numbers) == 1), itemgetter(1))
                if i
            ),
            key=len,
        )
        return (idx[0], idx[-1] + 1, True)
    except:
        return (0, -1, False)


def maps_folder_stats():

    result = {
        "total_count": 0,
        "total_size": 0,
        "h_total_size": humanize.naturalsize(0),
        "folder_max_size": 0,
        "h_folder_max_size": humanize.naturalsize(0),
        "folder_size_threshold": 0,
        "h_folder_size_threshold": humanize.naturalsize(0),
        "period": [None, None],
        "oldest_file": None,
        "newest_file": None,
    }

    # Verifica a situação do diretório de mapas.
    map_paths = sorted(
        Path(settings.PREDICTION_MAP_DIR).iterdir(), key=os.path.getmtime
    )

    maps_count = len(map_paths)
    maps_dates = []
    for map_path in map_paths:
        filename = map_path.name
        event_dt = filename.strip(".jpg").split("-")[-1]
        date = datetime.strptime(event_dt, "%Y%m%d%H%M%S").date()
        maps_dates.append(date)

    total_size = get_size_of_map_folder()
    folder_max_size = get_map_folder_desired_size()
    folder_size_threshold = get_map_folder_size_limit()

    result.update(
        {
            "total_count": maps_count,
            "total_size": total_size,
            "h_total_size": humanize.naturalsize(total_size),
            "folder_max_size": folder_max_size,
            "h_folder_max_size": humanize.naturalsize(folder_max_size),
            "folder_size_threshold": folder_size_threshold,
            "h_folder_size_threshold": humanize.naturalsize(folder_size_threshold),
        }
    )

    oldest = None
    newest = None
    if len(map_paths) > 0:
        oldest_file = datetime.fromtimestamp(map_paths[0].stat().st_mtime)
        oldest = oldest_file.astimezone(tz=timezone.utc).isoformat()
        newest_file = datetime.fromtimestamp(map_paths[-1].stat().st_mtime)
        newest = newest_file.astimezone(tz=timezone.utc).isoformat()

        # Remove Duplicated dates
        maps_dates = sorted(list(set(maps_dates)))

        first_map = maps_dates[0]
        last_map = maps_dates[-1]

        if len(maps_dates) > 1:
            # Convert dates to integer
            date_ints = [d.toordinal() for d in maps_dates]
            print(date_ints)
            start, end, consecutive = get_longest_consecutive_numbers(list(date_ints))
            first_map = maps_dates[start]
            last_map = maps_dates[end]

        result.update(
            {
                "period": [first_map.isoformat(), last_map.isoformat()],
                "period_is_consecutive": consecutive,
                "oldest_file": oldest,
                "newest_file": newest,
            }
        )

    return result
