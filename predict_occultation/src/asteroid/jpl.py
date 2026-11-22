import base64
import http
import json
import pathlib
import re
import shutil
from datetime import datetime as dt

import requests
import spiceypy as spice

satellites_bsp = {
    "PLUTO": "https://naif.jpl.nasa.gov/pub/naif/generic_kernels/spk/satellites/plu060.bsp",
    "1930 BM": "https://naif.jpl.nasa.gov/pub/naif/generic_kernels/spk/satellites/plu060.bsp",
}


def _expand_horizons_identifier(identifier):
    """Normalize packed designations for Horizons (C2025A6 -> C/2025 A6)."""
    if not identifier:
        return identifier
    s = str(identifier).strip()
    if re.match(r"^[CPDAX]/\d{4}\s", s, re.IGNORECASE):
        return s
    m = re.match(r"^([CPDAX])(\d{4})([A-Za-z].*)$", s, re.IGNORECASE)
    if m:
        return f"{m.group(1).upper()}/{m.group(2)} {m.group(3)}"
    m = re.match(r"^(\d{4})T(\d+)$", s, re.IGNORECASE)
    if m:
        return f"{m.group(1)} T-{m.group(2)}"
    m = re.match(r"^(\d{4})([A-Za-z].*)$", s)
    if m:
        return f"{m.group(1)} {m.group(2)}"
    return s


def _horizons_command_candidates(identifier):
    """COMMAND order: original DES, expanded DES, then name form. No spkid."""
    expanded = _expand_horizons_identifier(identifier)
    raw = str(identifier).strip()
    ordered = []
    for token in (
        f"'DES={raw}'",
        f"'DES={expanded}'" if expanded != raw else None,
        f"'{expanded};'",
        f"'{raw};'" if raw != expanded else None,
    ):
        if token and token not in ordered:
            ordered.append(token)
    return ordered


def commit_staged_files(pairs):
    """Move staged files onto their destinations. Restore originals on failure.

    `pairs` is `(source, dest)` in commit order. Put the uncertainty file
    before the BSP so a failed BSP replace cannot leave a new BSP beside
    an old uncertainty file.
    """
    saved = []
    try:
        for src, dest in pairs:
            src = pathlib.Path(src)
            dest = pathlib.Path(dest)
            backup = dest.parent / f".{dest.name}.rollback"
            if backup.exists():
                backup.unlink()
            if dest.exists():
                dest.replace(backup)
            else:
                backup = None
            try:
                src.replace(dest)
            except Exception:
                if backup is not None and backup.exists():
                    backup.replace(dest)
                raise
            saved.append((dest, backup))
    except Exception:
        for dest, backup in reversed(saved):
            if dest.exists():
                dest.unlink()
            if backup is not None and backup.exists():
                backup.replace(dest)
        raise
    else:
        for _dest, backup in saved:
            if backup is not None and backup.exists():
                backup.unlink()


def get_asteroid_uncertainty_from_jpl(
    identifier, initial_date, final_date, directory, filename, step=12
):
    url = "https://ssd.jpl.nasa.gov/api/horizons.api"
    base_params = {
        "format": "text",
        "OBJ_DATA": "NO",
        "MAKE_EPHEM": "YES",
        "EPHEM_TYPE": "OBSERVER",
        "CENTER": "500@399",
        "START_TIME": f"{initial_date}",
        "STOP_TIME": f"{final_date}",
        "STEP_SIZE": f"{step}h",
        "QUANTITIES": '"9,36"',
        "CAL_FORMAT": "JD",
    }

    object_apmag_uncert_data = {}
    last_status = None

    for command in _horizons_command_candidates(identifier):
        params = dict(base_params)
        params["COMMAND"] = command
        response = requests.get(url, params=params)
        last_status = response.status_code
        if response.status_code != 200:
            continue
        if "$$SOE" not in response.text or "$$EOE" not in response.text:
            continue
        try:
            lines = response.text.splitlines()
            start_idx = lines.index("$$SOE") + 1
            end_idx = lines.index("$$EOE")
            data = []
            for line in lines[start_idx:end_idx]:
                columns = line.split()
                if len(columns) < 5:
                    continue
                data.append(
                    {
                        "JDUT": float(columns[0]),
                        "APmag": (
                            float(columns[1])
                            if columns[1] != "n.a."
                            else float("nan")
                        ),
                        "RA_3sigma": (
                            float(columns[3])
                            if columns[3] != "n.a."
                            else float("nan")
                        ),
                        "DEC_3sigma": (
                            float(columns[4])
                            if columns[4] != "n.a."
                            else float("nan")
                        ),
                    }
                )
            if data:
                object_apmag_uncert_data = {
                    "jd": [item["JDUT"] for item in data],
                    "apmag": [item["APmag"] for item in data],
                    "ra_3sigma": [item["RA_3sigma"] for item in data],
                    "dec_3sigma": [item["DEC_3sigma"] for item in data],
                }
                break
        # TODO: Não é possivel usar um raise exception pq quando a incerteza falha, falha ele simula falha de download de bsp pq esta sendo feito no mesmo try na classe asteroid
        except Exception:
            continue

    if last_status not in (None, 200) and not object_apmag_uncert_data:
        raise Exception(
            f"Error retrieving asteroid uncertainties from JPL {last_status} - {http.HTTPStatus(last_status).phrase}"
        )

    path = pathlib.Path(directory)
    if not path.exists():
        raise ValueError("The directory {} does not exist!".format(path))

    output_file = path.joinpath(filename)

    if object_apmag_uncert_data:
        with open(output_file, "w") as f:
            json.dump(object_apmag_uncert_data, f)

    return output_file


def get_bsp_from_jpl(identifier, initial_date, final_date, directory, filename):
    date1 = dt.strptime(initial_date, "%Y-%m-%d")
    date2 = dt.strptime(final_date, "%Y-%m-%d")
    diff = date2 - date1

    if diff.days <= 32:
        raise ValueError(
            "The [final_date] must be more than 32 days later than [initial_date]"
        )

    path = pathlib.Path(directory)
    if not path.exists():
        raise ValueError("The directory {} does not exist!".format(path))

    spk_file = path.joinpath(filename)
    tmp_file = path.joinpath(f".{filename}.partial")

    urlJPL = "https://ssd.jpl.nasa.gov/api/horizons.api"
    base_parameters = {
        "format": "json",
        "EPHEM_TYPE": "SPK",
        "OBJ_DATA": "YES",
        "START_TIME": date1.strftime("%Y-%b-%d"),
        "STOP_TIME": date2.strftime("%Y-%b-%d"),
    }

    last_error = None
    data = None
    for command in _horizons_command_candidates(identifier):
        parameters = dict(base_parameters)
        parameters["COMMAND"] = command
        r = requests.get(urlJPL, params=parameters, stream=True)
        if r.status_code != 200:
            last_error = (
                f"Code {r.status_code} - {http.HTTPStatus(r.status_code).phrase}"
            )
            continue
        if r.headers.get("Content-Type") != "application/json":
            last_error = f"Unexpected Content-Type for COMMAND={command}"
            continue
        try:
            payload = json.loads(r.text)
        except ValueError as e:
            last_error = f"Unable to decode JSON. {e}"
            continue

        if (
            "error" in payload
            and "SPK creation is not available" in payload["error"]
        ):
            key = _expand_horizons_identifier(identifier).upper()
            if key in satellites_bsp or identifier.upper() in satellites_bsp:
                sat_url = satellites_bsp.get(key) or satellites_bsp[identifier.upper()]
                sat = requests.get(sat_url, stream=True)
                if sat.status_code == 200:
                    with open(spk_file, "wb") as f:
                        f.write(sat.content)
                    return spk_file
                last_error = f"Failed to download satellite BSP. Status code: {sat.status_code}"
                continue
            last_error = payload["error"]
            continue

        if "spk" in payload:
            data = payload
            break
        last_error = f"COMMAND={command} -> {r.text[:300]}"

    if data is None or "spk" not in data:
        raise Exception(f"SPK file not generated: {last_error}")

    try:
        with open(tmp_file, "wb") as f:
            f.write(base64.b64decode(data["spk"]))
        tmp_file.replace(spk_file)
        return spk_file
    except OSError as e:
        if tmp_file.exists():
            tmp_file.unlink()
        raise Exception(f"Unable to create file '{spk_file}': {e}")


def findSPKID(bsp):
    """Search the spk id of a small Solar System object from bsp file

    Args:
        bsp (str): File path for bsp jpl file.

    Returns:
        str: Spk id of Object or None
    """

    spice.furnsh([bsp])
    kind = "spk"

    fillen = 256
    typlen = 33
    srclen = 256
    keys = ["Target SPK ID   :", "ASTEROID_SPK_ID ="]
    n = len(keys[0])

    name, kind, source, loc = spice.kdata(0, kind, fillen, typlen, srclen)
    flag = False
    spk = ""
    while not flag:
        try:
            m, header, flag = spice.dafec(loc, 1)
            row = header[0]
            if row[:n] in keys:
                spk = row[n:].strip()
                break
        except:
            break

    spice.kclear()

    if spk == "":
        return None

    return str(spk)
