from datetime import datetime, timezone
from pathlib import Path
from typing import Optional

from sora.prediction.occmap import plot_occ_map as occmap


def sora_occultation_map(
        name: str,
        diameter: Optional[float],
        ra_star_candidate: str,
        dec_star_candidate: str,
        date_time: datetime,
        closest_approach: float,
        position_angle: float,
        velocity: float,
        delta: float,
        g: float,
        long: float,
        filepath: Path,
        dpi: int = 50):

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

    filepath = path.joinpath(filename)
    if filepath.exists():
        return filepath
    else:
        raise Exception(f"Map file was not generated. {filepath}")
