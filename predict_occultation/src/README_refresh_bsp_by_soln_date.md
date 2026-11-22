# refresh_bsp_by_soln_date.py

## Disclaimer

**Temporary file for manual support only.**

This script is **not** part of the production predict daemon (`daemon.sh` / workers).
It is a one-off maintenance helper to classify and refresh local JPL BSP inputs by hand.
Do not wire it into Celery, cron, or CI unless that is an explicit product decision later.
It may be removed or replaced when a proper operational workflow exists.

## What it does

1. **Classify** local BSP folders under `--inputs` against a bulk JPL SBDB dump (`soln_date`).
2. Split results into:
   - `updated.json` — `soln_date >= dw_start` (orbit solution newer than last BSP download)
   - `unchanged.json` — still valid
   - `no_soln_date.json` — JPL/SBDB has no `soln_date` → **do not update**
   - `failed.json` — unexpected errors
3. Optionally **redownload** the full JPL input set for updated objects (same artifacts as the pipeline):
   - `{alias}.bsp`
   - `apmag_and_uncertainties.json`
   - `bsp_jpl_info.json` (with `spkid`)

`--from-updated` writes `downloaded.json` and `download_failed.json` under `--out-dir`.

## Download period

Every Horizons download (`--from-updated` or classify `--download`) uses a fixed window relative to **today**:

| Bound | Offset | Constant |
|-------|--------|----------|
| `start_period` | today − 1 year | `BSP_YEARS_BEHIND` |
| `end_period` | today + 3 years | `BSP_YEARS_AHEAD` |

Example on 2026-11-21: `2025-11-21` .. `2029-11-21`.

The script prints `BSP period: ...` at the start of a download run.
It does **not** reuse the old `start_period` / `end_period` from `bsp_jpl_info.json` for new SPK/uncertainty fetches.

## Horizons COMMAND handling

The refresh script tries COMMAND forms in this order, for both SPK and uncertainty:

1. `DES=<original identifier>`
2. `DES=<expanded designation>` when it differs from the original
3. `<expanded name>;` (and the original name form when that differs)
4. `DES=<spkid>` when `spkid` is known (meta / `updated.json`)

Production `asteroid/jpl.py` uses steps 1–3 only. It does not send `DES=<spkid>`.

Packed aliases expand before step 2:

| Alias / stored id | Expanded |
|-------------------|----------|
| `C2025A6` | `C/2025 A6` |
| `P2016BA14` | `P/2016 BA14` |
| `2026EC128` | `2026 EC128` |
| `1002T2` | `1002 T-2` |
| named body (`Chiron`) | unchanged; step 1 often misses, step 3 (`Chiron;`) hits |

Ambiguous names (e.g. `ISON`) stay unresolved until step 4, using the `spkid` already stored for that alias.

## Atomic file update

BSP, `apmag_and_uncertainties.json`, and `bsp_jpl_info.json` are written to stage files. The real files are replaced only after **both** the SPK and the uncertainty download succeed. Uncertainty is replaced before the BSP. If a later replace fails, the previous files are restored.

A failed uncertainty does not leave a new `.bsp` next to an old `apmag_and_uncertainties.json`. The row goes to `download_failed.json` and the folder stays as it was.

## Requirements

- Python 3 with `requests`
- Optional: `spiceypy` (to extract `spkid` from the BSP; otherwise falls back to previous/meta `spkid`)
- Access to JPL SBDB Query + Horizons APIs
- Write permission on each folder under `--inputs` (folders owned by `root` from Docker fail with `Permission denied`)

Local BSP root (compose): `data/asteroids` → mounted as `/app/inputs` in the predict container.

## Usage

Run from the repo (or inside the predict container with the same paths).

### 1. Classify only (no BSP download)

```bash
python3 predict_occultation/src/refresh_bsp_by_soln_date.py \
  --inputs /home/rcboufleur/linea/tno/data/asteroids \
  --out-dir /tmp/bsp_refresh_out
```

First run fetches the full SBDB dump (~1–2 min) and writes
`/tmp/bsp_refresh_out/sbdb_soln_cache.json`. Later runs reuse that cache unless you pass `--refresh-sbdb`.

### 2. Force redownload from `updated.json`

Skips SBDB rematch. Downloads **every** row in the JSON (overwrites BSP + uncertainty under `--inputs`).

```bash
cd /home/rcboufleur/linea/tno/predict_occultation/src
python3 refresh_bsp_by_soln_date.py \
  --inputs /home/rcboufleur/linea/tno/data/asteroids \
  --out-dir /tmp/bsp_from_updated \
  --from-updated /tmp/bsp_refresh_bulk/updated.json
```

Dry-run (list only, no Horizons):

```bash
python3 refresh_bsp_by_soln_date.py \
  --inputs /home/rcboufleur/linea/tno/data/asteroids \
  --out-dir /tmp/bsp_from_updated \
  --from-updated /tmp/bsp_refresh_bulk/updated.json \
  --dry-run --limit 5
```

A successful line looks like:

```text
[n/N] DOWNLOADED <designation>  spkid=... uncert=apmag_and_uncertainties.json
```

`uncert=apmag_and_uncertainties.json` on every successful line. A missing uncertainty fails the row. It does not publish a new BSP.

### 3. Classify and download in one pass

```bash
python3 predict_occultation/src/refresh_bsp_by_soln_date.py \
  --inputs /home/rcboufleur/linea/tno/data/asteroids \
  --out-dir /tmp/bsp_refresh_out \
  --download
```

Same today−1 / +3y period as `--from-updated`.

**Warning:** `--download` / `--from-updated` overwrite real files under `--inputs`. Prefer testing with `--limit` or a copied inputs tree first.

### 4. Emit backend submit commands (copy/paste or `.sh`)

Does **not** call Django. Reads a classify JSON and prints `manage.py shell` blocks that call `submit_predict_job` with the asteroid names already filled in.

**Updated orbits — full interval:**

```bash
python3 predict_occultation/src/refresh_bsp_by_soln_date.py \
  --emit-submit \
  --updated /tmp/bsp_refresh_out/updated.json \
  --start 2026-11-21 \
  --end 2028-02-29 \
  --chunk-size 2000 \
  --commands-out /tmp/submit_updated.sh
```

**Unchanged orbits — other interval** (same flag name, point at `unchanged.json`):

```bash
python3 predict_occultation/src/refresh_bsp_by_soln_date.py \
  --emit-submit \
  --updated /tmp/bsp_refresh_out/unchanged.json \
  --start 2027-12-01 \
  --end 2028-05-31 \
  --chunk-size 2000 \
  --commands-out /tmp/submit_unchanged.sh
```

Run the generated `.sh` **from the host** in `compose/local` (backend up).
Each block already wraps `docker compose exec -T backend python manage.py shell`:

```bash
cd compose/local
bash /tmp/submit_updated.sh
```

Names come from `provisional_designation` (must match `tno_asteroid.name`).

## Useful flags

| Flag | Meaning |
|------|---------|
| `--from-updated PATH` | Force redownload every row in that classify JSON |
| `--download` | During classify, redownload when `updated` |
| `--limit N` | Process at most N folders/rows |
| `--refresh-sbdb` | Ignore cache; re-fetch SBDB dump |
| `--sbdb-cache PATH` | Custom cache path |
| `--sleep SEC` | Delay between Horizons downloads (default 0.5) |
| `--dry-run` | Never hit Horizons for BSP download |
| `--emit-submit` | Generate submit commands from a JSON list |
| `--updated PATH` | JSON list for `--emit-submit` |
| `--start` / `--end` | Prediction window for `--emit-submit` |
| `--chunk-size` | Names per job (default 2000) |
| `--commands-out PATH` | Write `.sh` (also prints to stdout) |

## Policy notes

- If SBDB/Horizons has no `soln_date` (`Soln.date: -`), the object goes to `no_soln_date.json` and is **not** redownloaded.
- Prefer classify once, then `--from-updated` / `--emit-submit`, so you do not rematch the full catalog before every download or submit batch.
- Root-owned folders under `data/asteroids` (typical after Docker writes) need `chown` before a host-side redownload can succeed.
- Production `asteroid/jpl.py` uses the same designation expansion and steps 1–3 above. It commits the BSP only together with a new uncertainty file. It does not query `DES=<spkid>`.
