from asteroid import Asteroid
from pathlib import Path
import logging
import sys
import traceback
import colorlog
import shutil

# log = logging.getLogger("teste")
# log.setLevel(logging.DEBUG)
# consoleFormatter = logging.Formatter("[%(levelname)s] %(message)s")
# consoleHandler = logging.StreamHandler(sys.stdout)
# log.addHandler(consoleHandler)


log = colorlog.getLogger("teste")
consoleFormatter = colorlog.ColoredFormatter("%(log_color)s%(message)s")
consoleHandler = colorlog.StreamHandler(sys.stdout)
consoleHandler.setFormatter(consoleFormatter)
log.addHandler(consoleHandler)
log.setLevel(logging.DEBUG)

log.info("------- Asteroid Class -------")

base_path = Path("/tmp/teste")
# if base_path.exists():
#     shutil.rmtree(base_path)

base_path.mkdir(parents=True, exist_ok=True)

log.debug(f"BASE PATH: [{base_path}] Exists: [{base_path.exists()}]")

# def download_with_progress_bar(url, filepath):
#     import functools
#     import pathlib
#     import shutil
#     import requests
#     import tqdm

#     r = requests.get(url, stream=True, allow_redirects=True)
#     if r.status_code != 200:
#         r.raise_for_status()  # Will only raise for 4xx codes, so...
#         raise RuntimeError(f"Request to {url} returned status code {r.status_code}")
#     file_size = int(r.headers.get('Content-Length', 0))

#     path = pathlib.Path(filepath).expanduser().resolve()
#     path.parent.mkdir(parents=True, exist_ok=True)

#     desc = "(Unknown total file size)" if file_size == 0 else ""
#     r.raw.read = functools.partial(r.raw.read, decode_content=True)  # Decompress if needed
#     with tqdm.tqdm.wrapattr(r.raw, "read", total=file_size, desc=desc) as r_raw:
#         with path.open("wb") as f:
#             shutil.copyfileobj(r_raw, f)

#     return path


# download(url="https://hpiers.obspm.fr/iers/bul/bulc/Leap_Second.dat", filename="/tmp/teste/Leap_second.dat")

try:
    a = Asteroid(
        name="Chiron",
        base_path=base_path,
        log=log,
        # new_run=False
    )

    # a.check_des_observations(0)
    have_bsp_jpl = a.check_bsp_jpl(
        start_period="2024-01-01",
        end_period=str("2024-01-31"),
        days_to_expire=0,
    )
    have_orb_ele = a.check_orbital_elements(days_to_expire=0)

    a.have_obs = a.check_observations(days_to_expire=0)
    # raise Exception("shdshds")
except Exception as e:
    log.error(traceback.format_exc())
    log.error(e)
