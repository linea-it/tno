#!/usr/bin/env python3
"""
TEMPORARY manual-support utility. Not part of the production daemon.

Scan already-downloaded BSPs, detect JPL orbit updates via one bulk SBDB query,
then filter locally. Optionally force-redownload updated BSPs.

See README_refresh_bsp_by_soln_date.md for usage.
"""

from __future__ import annotations

import argparse
import base64
import http
import json
import re
import sys
import time
from datetime import date, datetime, timezone
from pathlib import Path

import requests

SBDB_QUERY_URL = "https://ssd-api.jpl.nasa.gov/sbdb_query.api"
HORIZONS_URL = "https://ssd.jpl.nasa.gov/api/horizons.api"
SOLN_TZ = "-0800"  # JPL SBDB soln_date is Pacific time
MAG_UNCERT_FILENAME = "apmag_and_uncertainties.json"
# Default Horizons SPK / uncertainty window for refresh downloads.
BSP_YEARS_BEHIND = 1
BSP_YEARS_AHEAD = 3

SATELLITES_BSP = {
    "PLUTO": "https://naif.jpl.nasa.gov/pub/naif/generic_kernels/spk/satellites/plu060.bsp",
    "1930 BM": "https://naif.jpl.nasa.gov/pub/naif/generic_kernels/spk/satellites/plu060.bsp",
}


def norm_key(s: str) -> str:
    return re.sub(r"[\s_\-/]+", "", str(s)).upper()


def alias_to_designation(alias: str) -> str:
    """Best-effort alias -> human designation for Horizons DES=.

    Examples:
      2026EC128 -> 2026 EC128
      1002T2    -> 1002 T-2
      2010BJ35  -> 2010 BJ35
      C2025A6   -> C/2025 A6
      P2016BA14 -> P/2016 BA14
    """
    if not alias:
        return alias
    # Packed comet/asteroid-comet form without slash: C2025A6, P2016BA14
    m = re.match(r"^([CPDAX])(\d{4})([A-Za-z].*)$", alias, re.IGNORECASE)
    if m:
        return f"{m.group(1).upper()}/{m.group(2)} {m.group(3)}"
    m = re.match(r"^(\d{4})T(\d+)$", alias, re.IGNORECASE)
    if m:
        return f"{m.group(1)} T-{m.group(2)}"
    m = re.match(r"^(\d{4})([A-Za-z].*)$", alias)
    if m:
        return f"{m.group(1)} {m.group(2)}"
    return alias


def expand_horizons_identifier(identifier: str) -> str:
    """Normalize packed designations already stored as provisional_designation."""
    if not identifier:
        return identifier
    # Already slash-form comet (C/2025 A6)
    if re.match(r"^[CPDAX]/\d{4}\s", identifier, re.IGNORECASE):
        return identifier
    return alias_to_designation(identifier)


def shift_years(d: date, years: int) -> date:
    """Shift a calendar date by whole years; clamp Feb 29 on non-leap targets."""
    try:
        return d.replace(year=d.year + years)
    except ValueError:
        return d.replace(year=d.year + years, day=28)


def bsp_period_from_today(
    years_behind: int = BSP_YEARS_BEHIND,
    years_ahead: int = BSP_YEARS_AHEAD,
    today: date | None = None,
) -> tuple[str, str]:
    """Return (start_period, end_period) as YYYY-MM-DD for Horizons downloads."""
    base = today or date.today()
    start = shift_years(base, -years_behind)
    end = shift_years(base, years_ahead)
    return start.isoformat(), end.isoformat()


def horizons_command_candidates(identifier: str, spkid: str | None = None) -> list[str]:
    """Ordered Horizons COMMAND values (with quotes) for SPK/observer queries.

    Order: DES=<original>, DES=<expanded>, <name>;, then DES=<spkid>.
    The daemon copy in asteroid/jpl.py stops before DES=<spkid>.
    """
    expanded = expand_horizons_identifier(identifier)
    raw = str(identifier).strip()
    spk = str(spkid).strip() if spkid not in (None, "") else None
    ordered: list[str] = []
    for token in (
        f"'DES={raw}'",
        f"'DES={expanded}'" if expanded != raw else None,
        f"'{expanded};'",
        f"'{raw};'" if raw != expanded else None,
        f"'DES={spk}'" if spk else None,
    ):
        if token and token not in ordered:
            ordered.append(token)
    return ordered


def _horizons_spk_ok(payload: dict) -> bool:
    return "spk" in payload


def _horizons_obs_has_ephem(text: str) -> bool:
    return "$$SOE" in text and "$$EOE" in text


def _horizons_result_ambiguous_or_miss(text: str) -> bool:
    markers = (
        "No matches found.",
        "Multiple major-bodies",
        "Matching small-bodies:",
        "To SELECT, enter record #",
        "Ambiguous",
    )
    return any(m in text for m in markers)


def parse_soln_date(raw: str) -> datetime | None:
    if not raw:
        return None
    try:
        return datetime.strptime(f"{raw} {SOLN_TZ}", "%Y-%m-%d %H:%M:%S %z")
    except ValueError:
        try:
            dt = datetime.fromisoformat(raw)
            if dt.tzinfo is None:
                dt = dt.replace(tzinfo=timezone.utc)
            return dt
        except ValueError:
            return None


def parse_dw_start(raw: str) -> datetime:
    dt = datetime.fromisoformat(raw)
    if dt.tzinfo is None:
        dt = dt.replace(tzinfo=timezone.utc)
    return dt


def _index_name_keys(full_name: str, pdes: str) -> list[str]:
    """Keys for local join: pdes, alias-like forms, and parenthetical provisories."""
    keys = [pdes, norm_key(pdes)]
    if full_name:
        keys.append(full_name)
        keys.append(norm_key(full_name))
        # e.g. "52163 (1004 T-2)" -> "1004 T-2"
        for m in re.finditer(r"\(([^)]+)\)", full_name):
            inner = m.group(1).strip()
            keys.append(inner)
            keys.append(norm_key(inner))
        # leading number token
        lead = full_name.strip().split()[0] if full_name.strip() else ""
        if lead:
            keys.append(lead)
            keys.append(norm_key(lead))
    # unique preserve order
    seen = set()
    out = []
    for k in keys:
        if k and k not in seen:
            seen.add(k)
            out.append(k)
    return out


def fetch_sbdb_soln_index(
    cache_path: Path | None = None, refresh: bool = False
) -> dict:
    """One bulk call: all small bodies -> indexes by spkid and name keys.

    Returns dict with keys:
      by_spkid: {str(spkid): datetime}
      by_name:  {norm/raw name key: datetime}
      rows: int
    """
    if cache_path and cache_path.exists() and not refresh:
        print(f"Loading SBDB cache: {cache_path}")
        cached = json.loads(cache_path.read_text())
        by_spkid = {
            k: parse_soln_date(v)
            for k, v in cached["by_spkid"].items()
            if parse_soln_date(v) is not None
        }
        by_name = {
            k: parse_soln_date(v)
            for k, v in cached["by_name"].items()
            if parse_soln_date(v) is not None
        }
        print(
            f"Cache rows: {cached.get('rows')}  "
            f"spkid={len(by_spkid)} name_keys={len(by_name)}"
        )
        return {"by_spkid": by_spkid, "by_name": by_name, "rows": cached.get("rows", 0)}

    print("Fetching full SBDB soln_date dump (one request)...")
    t0 = time.time()
    r = requests.get(
        SBDB_QUERY_URL,
        params={"fields": "pdes,spkid,soln_date,full_name"},
        timeout=600,
    )
    r.raise_for_status()
    body = r.json()
    fields = body["fields"]
    data = body["data"]
    i_pdes = fields.index("pdes")
    i_spkid = fields.index("spkid")
    i_soln = fields.index("soln_date")
    i_full = fields.index("full_name")

    by_spkid: dict[str, datetime] = {}
    by_name: dict[str, datetime] = {}
    cache_spkid: dict[str, str] = {}
    cache_name: dict[str, str] = {}

    for row in data:
        soln_raw = row[i_soln]
        soln = parse_soln_date(soln_raw)
        if soln is None:
            continue
        spkid = str(row[i_spkid])
        pdes = str(row[i_pdes])
        full_name = str(row[i_full] or "")
        by_spkid[spkid] = soln
        cache_spkid[spkid] = soln_raw
        for key in _index_name_keys(full_name, pdes):
            by_name[key] = soln
            cache_name[key] = soln_raw

    elapsed = time.time() - t0
    print(
        f"SBDB dump: {len(data)} rows in {elapsed:.1f}s  "
        f"indexed spkid={len(by_spkid)} name_keys={len(by_name)}"
    )

    if cache_path is not None:
        cache_path.parent.mkdir(parents=True, exist_ok=True)
        cache_path.write_text(
            json.dumps(
                {
                    "fetched_at": datetime.now(timezone.utc).isoformat(),
                    "rows": len(data),
                    "by_spkid": cache_spkid,
                    "by_name": cache_name,
                }
            )
        )
        print(f"Wrote SBDB cache: {cache_path}")

    return {"by_spkid": by_spkid, "by_name": by_name, "rows": len(data)}


def lookup_soln(index: dict, alias: str, meta: dict, alias_map: dict):
    """Return (designation_for_download, soln_date) or (None, None)."""
    by_spkid = index["by_spkid"]
    by_name = index["by_name"]

    designation = (
        alias_map.get(alias)
        or meta.get("provisional_designation")
        or alias_to_designation(alias)
    )

    # Prefer spkid (stable, already in bsp_jpl_info.json)
    spkid = meta.get("spkid")
    if spkid is not None and str(spkid) in by_spkid:
        return designation, by_spkid[str(spkid)]

    for cand in (
        alias_map.get(alias),
        meta.get("provisional_designation"),
        alias_to_designation(alias),
        alias,
        norm_key(alias),
        norm_key(alias_to_designation(alias)),
    ):
        if not cand:
            continue
        if cand in by_name:
            return designation, by_name[cand]
        nk = norm_key(cand)
        if nk in by_name:
            return designation, by_name[nk]

    return designation, None


def get_bsp_from_jpl(
    identifier: str,
    initial_date: str,
    final_date: str,
    directory: Path,
    filename: str,
    spkid: str | None = None,
) -> Path:
    """Download SPK via Horizons; try designation, name, and spkid COMMAND forms."""
    date1 = datetime.strptime(initial_date, "%Y-%m-%d")
    date2 = datetime.strptime(final_date, "%Y-%m-%d")
    if (date2 - date1).days <= 32:
        raise ValueError("final_date must be more than 32 days later than initial_date")

    directory.mkdir(parents=True, exist_ok=True)
    spk_file = directory / filename
    tmp_file = directory / f".{filename}.partial"

    base_params = {
        "format": "json",
        "EPHEM_TYPE": "SPK",
        "OBJ_DATA": "YES",
        "START_TIME": date1.strftime("%Y-%b-%d"),
        "STOP_TIME": date2.strftime("%Y-%b-%d"),
    }

    last_error = None
    data = None
    for command in horizons_command_candidates(identifier, spkid):
        params = dict(base_params)
        params["COMMAND"] = command
        r = requests.get(HORIZONS_URL, params=params, timeout=300)
        if r.status_code != 200:
            last_error = (
                f"Code {r.status_code} - {http.HTTPStatus(r.status_code).phrase}"
            )
            continue
        if "json" not in r.headers.get("Content-Type", ""):
            last_error = f"Unexpected Content-Type for COMMAND={command}"
            continue
        payload = r.json()
        if "error" in payload and "SPK creation is not available" in payload["error"]:
            sat_key = expand_horizons_identifier(identifier).upper()
            if sat_key in SATELLITES_BSP or identifier.upper() in SATELLITES_BSP:
                url = SATELLITES_BSP.get(sat_key) or SATELLITES_BSP[identifier.upper()]
                sat = requests.get(url, timeout=300)
                sat.raise_for_status()
                tmp_file.write_bytes(sat.content)
                tmp_file.replace(spk_file)
                return spk_file
            last_error = payload["error"]
            continue
        if _horizons_spk_ok(payload):
            data = payload
            break
        result_text = payload.get("result") or payload.get("error") or r.text
        last_error = f"COMMAND={command} -> {result_text[:300]}"
        if not _horizons_result_ambiguous_or_miss(result_text) and "spk" not in payload:
            # Keep trying other COMMAND forms anyway.
            continue

    if data is None or "spk" not in data:
        raise Exception(f"SPK file not generated: {last_error}")

    tmp_file.write_bytes(base64.b64decode(data["spk"]))
    try:
        tmp_file.replace(spk_file)
    except PermissionError as e:
        tmp_file.unlink(missing_ok=True)
        raise PermissionError(
            f"Cannot write {spk_file} (owned by another user?). {e}"
        ) from e
    return spk_file


def _parse_uncertainty_ephem(text: str) -> dict:
    lines = text.splitlines()
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
                "APmag": (float(columns[1]) if columns[1] != "n.a." else float("nan")),
                "RA_3sigma": (
                    float(columns[3]) if columns[3] != "n.a." else float("nan")
                ),
                "DEC_3sigma": (
                    float(columns[4]) if columns[4] != "n.a." else float("nan")
                ),
            }
        )
    return {
        "jd": [item["JDUT"] for item in data],
        "apmag": [item["APmag"] for item in data],
        "ra_3sigma": [item["RA_3sigma"] for item in data],
        "dec_3sigma": [item["DEC_3sigma"] for item in data],
    }


def get_asteroid_uncertainty_from_jpl(
    identifier: str,
    initial_date: str,
    final_date: str,
    directory: Path,
    filename: str,
    step: int = 12,
    spkid: str | None = None,
) -> Path | None:
    """Download APmag + RA/DEC 3sigma; try designation/name/spkid COMMAND forms."""
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

    object_apmag_uncert_data: dict = {}
    last_status = None
    for command in horizons_command_candidates(identifier, spkid):
        params = dict(base_params)
        params["COMMAND"] = command
        response = requests.get(HORIZONS_URL, params=params, timeout=300)
        last_status = response.status_code
        if response.status_code != 200:
            continue
        if not _horizons_obs_has_ephem(response.text):
            continue
        try:
            parsed = _parse_uncertainty_ephem(response.text)
        except Exception:
            continue
        if parsed.get("jd"):
            object_apmag_uncert_data = parsed
            break

    if last_status not in (None, 200) and not object_apmag_uncert_data:
        raise Exception(
            f"Error retrieving asteroid uncertainties from JPL "
            f"{last_status} - {http.HTTPStatus(last_status).phrase}"
        )

    output_file = directory / filename
    if object_apmag_uncert_data.get("jd"):
        output_file.write_text(json.dumps(object_apmag_uncert_data))
        return output_file
    return None


def find_spkid_from_bsp(bsp_path: Path) -> str | None:
    """Extract SPK ID from BSP via spiceypy (same as asteroid.jpl.findSPKID)."""
    try:
        import spiceypy as spice
    except ImportError:
        return None

    spice.furnsh([str(bsp_path)])
    try:
        kind = "spk"
        fillen = 256
        typlen = 33
        srclen = 256
        keys = ["Target SPK ID   :", "ASTEROID_SPK_ID ="]
        n = len(keys[0])
        _name, _kind, _source, loc = spice.kdata(0, kind, fillen, typlen, srclen)
        flag = False
        spk = ""
        while not flag:
            try:
                _m, header, flag = spice.dafec(loc, 1)
                row = header[0]
                if row[:n] in keys:
                    spk = row[n:].strip()
                    break
            except Exception:
                break
        return str(spk) if spk else None
    finally:
        spice.kclear()


def commit_staged_files(pairs: list[tuple[Path, Path]]) -> None:
    """Move staged files onto destinations. Restore originals if a later replace fails.

    Commit uncertainty before the BSP so a failed BSP replace cannot leave a
    new BSP next to an old uncertainty file.
    """
    saved: list[tuple[Path, Path | None]] = []
    try:
        for src, dest in pairs:
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


def download_jpl_pipeline_inputs(
    identifier: str,
    start_period: str,
    end_period: str,
    directory: Path,
    bsp_filename: str,
    fallback_spkid=None,
) -> dict:
    """Full JPL input refresh, same artifacts as Asteroid.download_jpl_bsp.

    Writes, only when BSP and uncertainty both succeed:
      - {alias}.bsp
      - apmag_and_uncertainties.json
      - bsp_jpl_info.json (with spkid)

    A failure leaves the previous BSP, uncertainty file, and info JSON in place.
    """
    directory.mkdir(parents=True, exist_ok=True)
    designation = expand_horizons_identifier(identifier)
    hint_spkid = str(fallback_spkid) if fallback_spkid not in (None, "") else None
    bsp_final = directory / bsp_filename
    uncert_final = directory / MAG_UNCERT_FILENAME
    info_final = directory / "bsp_jpl_info.json"
    bsp_tmp = directory / f".{bsp_filename}.new"
    uncert_tmp = directory / f".{MAG_UNCERT_FILENAME}.new"
    info_tmp = directory / ".bsp_jpl_info.json.new"
    staged = (bsp_tmp, uncert_tmp, info_tmp)
    committed = False

    try:
        t0 = datetime.now(timezone.utc)
        get_bsp_from_jpl(
            identifier,
            start_period,
            end_period,
            directory,
            bsp_tmp.name,
            spkid=hint_spkid,
        )
        mag_path = get_asteroid_uncertainty_from_jpl(
            identifier,
            start_period,
            end_period,
            directory,
            uncert_tmp.name,
            step=12,
            spkid=hint_spkid,
        )
        if (
            mag_path is None
            or not uncert_tmp.is_file()
            or uncert_tmp.stat().st_size == 0
        ):
            raise RuntimeError(
                f"uncertainty download failed for {identifier}; previous files kept"
            )
        t1 = datetime.now(timezone.utc)

        spkid = find_spkid_from_bsp(bsp_tmp)
        if spkid is None:
            spkid = hint_spkid

        data = {
            "source": "JPL",
            "spkid": spkid,
            "filename": bsp_filename,
            "size": bsp_tmp.stat().st_size,
            "start_period": start_period,
            "end_period": end_period,
            "dw_start": t0.isoformat(),
            "dw_finish": t1.isoformat(),
            "dw_time": (t1 - t0).total_seconds(),
            "mag_and_uncert_file": MAG_UNCERT_FILENAME,
            "provisional_designation": designation,
        }
        info_tmp.write_text(json.dumps(data, indent=2))
        commit_staged_files(
            [
                (uncert_tmp, uncert_final),
                (bsp_tmp, bsp_final),
                (info_tmp, info_final),
            ]
        )
        committed = True
        return data
    finally:
        if not committed:
            for staged_path in staged:
                if staged_path.exists():
                    staged_path.unlink()


def iter_bsp_dirs(inputs: Path):
    for d in sorted(p for p in inputs.iterdir() if p.is_dir()):
        bsp = d / f"{d.name}.bsp"
        info = d / "bsp_jpl_info.json"
        if bsp.exists() and info.exists():
            yield d, bsp, info


def row_portal_name(row: dict) -> str | None:
    """Best name for PredictionJob filter_type=name (must match tno_asteroid.name)."""
    for key in ("name", "provisional_designation"):
        val = row.get(key)
        if val:
            return str(val).strip()
    alias = row.get("alias")
    if alias:
        return alias_to_designation(alias)
    return None


def emit_submit_commands(
    updated_path: Path,
    start: str,
    end: str,
    chunk_size: int,
    commands_out: Path | None,
    manage_prefix: str = "docker compose exec -T backend python manage.py shell",
    limit: int = 0,
) -> int:
    """Write/print copy-pasteable host commands from a classify JSON list.

    Does not call Django. Generated .sh runs from compose/local via docker compose exec.
    """
    rows = json.loads(updated_path.read_text())
    if not isinstance(rows, list):
        raise ValueError(f"{updated_path} must contain a JSON list")

    names: list[str] = []
    skipped = 0
    for row in rows:
        name = row_portal_name(row)
        if not name:
            skipped += 1
            continue
        names.append(name)

    # unique preserve order
    seen = set()
    uniq = []
    for n in names:
        if n not in seen:
            seen.add(n)
            uniq.append(n)
    names = uniq

    if limit > 0:
        names = names[:limit]

    try:
        start_dt = datetime.strptime(start, "%Y-%m-%d")
        end_dt = datetime.strptime(end, "%Y-%m-%d")
    except ValueError as e:
        raise SystemExit(f"Invalid --start/--end (use YYYY-MM-DD): {e}") from e

    if end_dt < start_dt:
        raise SystemExit("--end must be >= --start")

    chunks = [names[i : i + chunk_size] for i in range(0, len(names), chunk_size)] or [
        []
    ]

    lines: list[str] = []
    lines.append("#!/usr/bin/env bash")
    lines.append(
        "# TEMPORARY manual support — generated by refresh_bsp_by_soln_date.py"
    )
    lines.append(f"# Source JSON: {updated_path}")
    lines.append(f"# Interval: {start} -> {end}")
    lines.append(
        f"# Names: {len(names)}  chunks: {len(chunks) if names else 0}  "
        f"chunk_size={chunk_size}"
    )
    if skipped:
        lines.append(f"# Skipped rows without name/designation: {skipped}")
    lines.append("# Run from compose/local (backend service must be up):")
    lines.append("#   bash /path/to/this.sh")
    lines.append(
        "# Each block uses: docker compose exec -T backend python manage.py shell"
    )
    lines.append("# Names must match tno_asteroid.name (from provisional_designation).")
    lines.append("set -euo pipefail")
    lines.append("")

    if not names:
        lines.append("echo 'No names to submit.' >&2")
        lines.append("exit 1")
    else:
        for idx, chunk in enumerate(chunks, 1):
            filter_value = ",".join(chunk)
            lines.append(
                f"echo '=== chunk {idx}/{len(chunks)} ({len(chunk)} asteroids) ==='"
            )
            lines.append(f"{manage_prefix} <<'PY'")
            lines.append("from datetime import datetime, timezone")
            lines.append("from tno.predict_job import submit_predict_job")
            lines.append("")
            lines.append(
                f"start = datetime({start_dt.year}, {start_dt.month}, {start_dt.day}, "
                f"tzinfo=timezone.utc)"
            )
            lines.append(
                f"end = datetime({end_dt.year}, {end_dt.month}, {end_dt.day}, "
                f"23, 59, 59, tzinfo=timezone.utc)"
            )
            lines.append(f"names = {json.dumps(filter_value)}")
            lines.append("job = submit_predict_job(")
            lines.append('    filter_type="name",')
            lines.append("    filter_value=names,")
            lines.append("    predict_start_date=start,")
            lines.append("    predict_end_date=end,")
            lines.append(f"    count_asteroids={len(chunk)},")
            lines.append(")")
            lines.append("print(job.id)")
            lines.append("PY")
            lines.append("")

    text = "\n".join(lines) + "\n"
    print(text)
    if commands_out is not None:
        commands_out.parent.mkdir(parents=True, exist_ok=True)
        commands_out.write_text(text)
        commands_out.chmod(commands_out.stat().st_mode | 0o111)
        print(f"Wrote: {commands_out}", file=sys.stderr)
    return 0


def download_from_updated_json(
    inputs: Path,
    updated_path: Path,
    out_dir: Path,
    limit: int = 0,
    sleep_s: float = 0.5,
    dry_run: bool = False,
) -> int:
    """Download pipeline inputs for rows already listed in updated.json.

    Skips SBDB fetch and soln_date comparison entirely.
    """
    rows = json.loads(updated_path.read_text())
    if not isinstance(rows, list):
        raise ValueError(f"{updated_path} must contain a JSON list")

    if limit > 0:
        rows = rows[:limit]

    out_dir.mkdir(parents=True, exist_ok=True)
    done, failed = [], []

    start_period, end_period = bsp_period_from_today()
    print(f"Mode: DOWNLOAD-FROM-UPDATED ({updated_path})")
    print(f"Rows to download: {len(rows)}  dry_run={dry_run}")
    print(
        f"BSP period: {start_period} .. {end_period}  (today-{BSP_YEARS_BEHIND}/+{BSP_YEARS_AHEAD}y)"
    )

    for i, row in enumerate(rows, 1):
        alias = row.get("alias")
        designation = row.get("provisional_designation") or alias_to_designation(
            alias or ""
        )
        folder = inputs / alias if alias else None

        try:
            if not alias:
                raise RuntimeError("missing alias in updated.json row")
            if not folder or not folder.is_dir():
                raise RuntimeError(f"input folder not found: {folder}")

            info_path = folder / "bsp_jpl_info.json"
            meta = {}
            if info_path.exists():
                meta = json.loads(info_path.read_text())

            if dry_run:
                row = dict(row)
                row["redownloaded"] = False
                row["dry_run"] = True
                row["start_period"] = start_period
                row["end_period"] = end_period
                done.append(row)
                print(f"[{i}/{len(rows)}] DRY-RUN {designation}")
                continue

            info = download_jpl_pipeline_inputs(
                designation,
                start_period,
                end_period,
                folder,
                f"{alias}.bsp",
                fallback_spkid=row.get("spkid") or meta.get("spkid"),
            )
            row = dict(row)
            row["redownloaded"] = True
            row["spkid"] = info.get("spkid")
            row["mag_and_uncert_file"] = info.get("mag_and_uncert_file")
            row["dw_start_new"] = info.get("dw_start")
            row["start_period"] = start_period
            row["end_period"] = end_period
            done.append(row)
            print(
                f"[{i}/{len(rows)}] DOWNLOADED {designation}  "
                f"spkid={row.get('spkid')} uncert={row.get('mag_and_uncert_file')}"
            )
            time.sleep(sleep_s)

        except Exception as e:
            failed.append(
                {
                    "alias": alias,
                    "designation": designation,
                    "reason": str(e),
                }
            )
            print(f"[{i}/{len(rows)}] FAIL  {alias}: {e}")

    (out_dir / "downloaded.json").write_text(json.dumps(done, indent=2))
    (out_dir / "download_failed.json").write_text(json.dumps(failed, indent=2))
    print("---")
    print(f"downloaded: {len(done)}  -> {out_dir / 'downloaded.json'}")
    print(f"failed:     {len(failed)}  -> {out_dir / 'download_failed.json'}")
    return 0 if not failed else 1


def main() -> int:
    ap = argparse.ArgumentParser(
        description="Classify/refresh BSPs using one bulk SBDB query + local filter"
    )
    ap.add_argument(
        "--inputs",
        type=Path,
        default=None,
        help="BSP inputs root (alias folders); required except for --emit-submit",
    )
    ap.add_argument(
        "--out-dir",
        type=Path,
        default=None,
        help="Where to write JSON lists; required except for --emit-submit",
    )
    ap.add_argument(
        "--download",
        action="store_true",
        help="During classify, force redownload when updated",
    )
    ap.add_argument(
        "--from-updated",
        type=Path,
        default=None,
        help="Download only rows from an existing updated.json (skip SBDB rematch)",
    )
    ap.add_argument(
        "--emit-submit",
        action="store_true",
        help="Emit copy-pasteable backend submit commands from a classify JSON list",
    )
    ap.add_argument(
        "--updated",
        type=Path,
        default=None,
        help="With --emit-submit: path to updated.json or unchanged.json",
    )
    ap.add_argument(
        "--start",
        type=str,
        default=None,
        help="With --emit-submit: prediction start date YYYY-MM-DD",
    )
    ap.add_argument(
        "--end",
        type=str,
        default=None,
        help="With --emit-submit: prediction end date YYYY-MM-DD",
    )
    ap.add_argument(
        "--chunk-size",
        type=int,
        default=2000,
        help="With --emit-submit: asteroids per PredictionJob (default 2000)",
    )
    ap.add_argument(
        "--commands-out",
        type=Path,
        default=None,
        help="With --emit-submit: write .sh/.txt (also prints to stdout)",
    )
    ap.add_argument(
        "--manage-prefix",
        type=str,
        default="docker compose exec -T backend python manage.py shell",
        help=(
            "With --emit-submit: command prefix "
            "(default: docker compose exec -T backend python manage.py shell)"
        ),
    )
    ap.add_argument(
        "--dry-run",
        action="store_true",
        help="Never download (classify only, or list --from-updated without fetching)",
    )
    ap.add_argument(
        "--limit", type=int, default=0, help="Process at most N folders/rows (0=all)"
    )
    ap.add_argument(
        "--sleep",
        type=float,
        default=0.5,
        help="Seconds between Horizons downloads",
    )
    ap.add_argument(
        "--sbdb-cache",
        type=Path,
        default=None,
        help="Cache path for bulk SBDB dump (default: OUT_DIR/sbdb_soln_cache.json)",
    )
    ap.add_argument(
        "--refresh-sbdb",
        action="store_true",
        help="Ignore cache and re-fetch SBDB dump",
    )
    ap.add_argument(
        "--map",
        type=Path,
        default=None,
        help="Optional CSV/TSV or JSON map alias->principal_designation",
    )
    args = ap.parse_args()

    if args.emit_submit:
        if not args.updated or not args.start or not args.end:
            raise SystemExit(
                "--emit-submit requires --updated, --start YYYY-MM-DD, and --end YYYY-MM-DD"
            )
        if not args.updated.exists():
            raise SystemExit(f"--updated not found: {args.updated}")
        return emit_submit_commands(
            updated_path=args.updated,
            start=args.start,
            end=args.end,
            chunk_size=args.chunk_size,
            commands_out=args.commands_out,
            manage_prefix=args.manage_prefix,
            limit=args.limit,
        )

    if args.inputs is None or args.out_dir is None:
        raise SystemExit(
            "--inputs and --out-dir are required for classify/download modes"
        )

    args.out_dir.mkdir(parents=True, exist_ok=True)

    if args.from_updated is not None:
        if not args.from_updated.exists():
            raise SystemExit(f"--from-updated not found: {args.from_updated}")
        return download_from_updated_json(
            inputs=args.inputs,
            updated_path=args.from_updated,
            out_dir=args.out_dir,
            limit=args.limit,
            sleep_s=args.sleep,
            dry_run=args.dry_run,
        )

    do_download = args.download and not args.dry_run
    cache_path = args.sbdb_cache or (args.out_dir / "sbdb_soln_cache.json")

    alias_map = {}
    if args.map and args.map.exists():
        text = args.map.read_text()
        if args.map.suffix.lower() == ".json":
            alias_map = json.loads(text)
        else:
            for line in text.splitlines():
                line = line.strip()
                if not line or line.startswith("#"):
                    continue
                parts = re.split(r"[\t,;]", line, maxsplit=1)
                if len(parts) == 2:
                    alias_map[parts[0].strip()] = parts[1].strip()

    index = fetch_sbdb_soln_index(cache_path=cache_path, refresh=args.refresh_sbdb)

    updated, unchanged, no_soln_date, failed = [], [], [], []

    folders = list(iter_bsp_dirs(args.inputs))
    if args.limit > 0:
        folders = folders[: args.limit]

    dl_start, dl_end = bsp_period_from_today()
    print(f"Found {len(folders)} BSP folders under {args.inputs}")
    print(f"Mode: {'DOWNLOAD' if do_download else 'CLASSIFY-ONLY'}")
    print("Rule: missing soln_date -> do not update (skip redownload)")
    if do_download:
        print(
            f"BSP period: {dl_start} .. {dl_end}  "
            f"(today-{BSP_YEARS_BEHIND}/+{BSP_YEARS_AHEAD}y)"
        )

    for i, (folder, bsp_path, info_path) in enumerate(folders, 1):
        alias = folder.name
        try:
            meta = json.loads(info_path.read_text())
            dw_start = parse_dw_start(meta["dw_start"])
            # Classify JSON keeps prior periods; downloads use today-1/+3y.
            meta_start = meta.get("start_period")
            meta_end = meta.get("end_period")

            designation, soln = lookup_soln(index, alias, meta, alias_map)
            if soln is None:
                # JPL/SBDB has no soln_date (Horizons shows Soln.date: -).
                # Policy: do not treat as updated; never redownload.
                no_soln_date.append(
                    {
                        "alias": alias,
                        "provisional_designation": designation,
                        "spkid": meta.get("spkid"),
                        "dw_start": dw_start.isoformat(),
                        "soln_date": None,
                        "start_period": meta_start,
                        "end_period": meta_end,
                        "action": "skip_no_update",
                    }
                )
                print(f"[{i}/{len(folders)}] NO_SOLN {designation}  (skip update)")
                continue

            is_updated = soln >= dw_start
            row = {
                "alias": alias,
                "provisional_designation": designation,
                "spkid": meta.get("spkid"),
                "dw_start": dw_start.isoformat(),
                "soln_date": soln.isoformat(),
                "start_period": meta_start,
                "end_period": meta_end,
            }

            if is_updated:
                if do_download:
                    info = download_jpl_pipeline_inputs(
                        designation,
                        dl_start,
                        dl_end,
                        folder,
                        f"{alias}.bsp",
                        fallback_spkid=meta.get("spkid"),
                    )
                    row["redownloaded"] = True
                    row["spkid"] = info.get("spkid")
                    row["mag_and_uncert_file"] = info.get("mag_and_uncert_file")
                    row["start_period"] = dl_start
                    row["end_period"] = dl_end
                    time.sleep(args.sleep)
                else:
                    row["redownloaded"] = False
                updated.append(row)
                print(
                    f"[{i}/{len(folders)}] UPDATED {designation}  "
                    f"soln={soln.date()} dw={dw_start.date()}"
                    + (
                        f"  spkid={row.get('spkid')} uncert={row.get('mag_and_uncert_file')}"
                        if do_download
                        else ""
                    )
                )
            else:
                unchanged.append(row)
                print(
                    f"[{i}/{len(folders)}] OK      {designation}  "
                    f"soln={soln.date()} dw={dw_start.date()}"
                )

        except Exception as e:
            failed.append(
                {
                    "alias": alias,
                    "designation": alias_to_designation(alias),
                    "reason": str(e),
                }
            )
            print(f"[{i}/{len(folders)}] FAIL  {alias}: {e}")

    (args.out_dir / "updated.json").write_text(json.dumps(updated, indent=2))
    (args.out_dir / "unchanged.json").write_text(json.dumps(unchanged, indent=2))
    (args.out_dir / "no_soln_date.json").write_text(json.dumps(no_soln_date, indent=2))
    (args.out_dir / "failed.json").write_text(json.dumps(failed, indent=2))

    print("---")
    print(f"updated:       {len(updated)}  -> {args.out_dir / 'updated.json'}")
    print(f"unchanged:     {len(unchanged)}  -> {args.out_dir / 'unchanged.json'}")
    print(
        f"no_soln_date:  {len(no_soln_date)}  -> {args.out_dir / 'no_soln_date.json'}  "
        "(skip update)"
    )
    print(f"failed:        {len(failed)}  -> {args.out_dir / 'failed.json'}")
    return 0 if not failed else 1


if __name__ == "__main__":
    raise SystemExit(main())
