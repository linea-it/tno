# import logging
# import shutil
# import sys
# import traceback
# from pathlib import Path

# import colorlog
# from asteroid import Asteroid

# # log = logging.getLogger("teste")
# # log.setLevel(logging.DEBUG)
# # consoleFormatter = logging.Formatter("[%(levelname)s] %(message)s")
# # consoleHandler = logging.StreamHandler(sys.stdout)
# # log.addHandler(consoleHandler)


# log = colorlog.getLogger("teste")
# consoleFormatter = colorlog.ColoredFormatter("%(log_color)s%(message)s")
# consoleHandler = colorlog.StreamHandler(sys.stdout)
# consoleHandler.setFormatter(consoleFormatter)
# log.addHandler(consoleHandler)
# log.setLevel(logging.DEBUG)

# log.info("------- Asteroid Class -------")

# base_path = Path("/tmp/teste")
# # if base_path.exists():
# #     shutil.rmtree(base_path)

# base_path.mkdir(parents=True, exist_ok=True)

# log.debug(f"BASE PATH: [{base_path}] Exists: [{base_path.exists()}]")

# # def download_with_progress_bar(url, filepath):
# #     import functools
# #     import pathlib
# #     import shutil
# #     import requests
# #     import tqdm

# #     r = requests.get(url, stream=True, allow_redirects=True)
# #     if r.status_code != 200:
# #         r.raise_for_status()  # Will only raise for 4xx codes, so...
# #         raise RuntimeError(f"Request to {url} returned status code {r.status_code}")
# #     file_size = int(r.headers.get('Content-Length', 0))

# #     path = pathlib.Path(filepath).expanduser().resolve()
# #     path.parent.mkdir(parents=True, exist_ok=True)

# #     desc = "(Unknown total file size)" if file_size == 0 else ""
# #     r.raw.read = functools.partial(r.raw.read, decode_content=True)  # Decompress if needed
# #     with tqdm.tqdm.wrapattr(r.raw, "read", total=file_size, desc=desc) as r_raw:
# #         with path.open("wb") as f:
# #             shutil.copyfileobj(r_raw, f)

# #     return path


# # download(url="https://hpiers.obspm.fr/iers/bul/bulc/Leap_Second.dat", filename="/tmp/teste/Leap_second.dat")

# try:
#     a = Asteroid(
#         name="Chiron",
#         base_path=base_path,
#         log=log,
#         # new_run=False
#     )

#     # a.check_des_observations(0)
#     have_bsp_jpl = a.check_bsp_jpl(
#         start_period="2024-01-01",
#         end_period=str("2024-01-31"),
#         days_to_expire=0,
#     )
#     have_orb_ele = a.check_orbital_elements(days_to_expire=0)

#     a.have_obs = a.check_observations(days_to_expire=0)
#     # raise Exception("shdshds")
# except Exception as e:
#     log.error(traceback.format_exc())
#     log.error(e)

import base64
import hashlib
from datetime import datetime, timedelta

import pandas


def normalize_to_nearest_hour(dt):
    # Ensure input is a datetime object
    if not isinstance(dt, datetime):
        raise TypeError("Input must be a datetime object")

    # Extract the minute component
    minute = dt.minute

    # If minutes >= 30, round up to the next hour
    if minute >= 30:
        dt = dt + timedelta(hours=1)

    # Normalize to the nearest hour by setting minutes and seconds to zero
    normalized_dt = dt.replace(minute=0, second=0, microsecond=0)

    return normalized_dt


def generate_hash(name: str, source_id: int, date_time: datetime):

    print(f"{name} {source_id} {date_time.strftime('%Y-%m-%d %H:%M:%S')}")
    nearest_hour = normalize_to_nearest_hour(date_time)
    # print(f"{name} {source_id} {nearest_hour.strftime('%Y-%m-%d %H:%M:%S')}")

    identifier = f"{name} {source_id} {nearest_hour.strftime('%Y-%m-%d %H:%M:%S')}"
    print(identifier)
    md5 = hashlib.md5(identifier.encode("utf-8")).digest()
    hash = base64.urlsafe_b64encode(md5).decode("utf-8").rstrip("=")
    print(hash)
    print("-----------------------------------")
    return hash


df = pandas.read_csv(
    "/app/outputs/predict_occultations/teste_hash.csv",
    delimiter=";",
    parse_dates=["timezone"],
    nrows=10,
)
# print(df.head(5))
print(list(df.columns))

# df['hash_id'] = df.apply(lambda x: generate_hash(x['name'], x['gaia_source_id'], x['timezone']), axis=1)

# print(df.head(5))

# have_duplicates = df['hash_id'].duplicated().any()
# print(f"Have Duplicates: {have_duplicates}")
# # duplicates = df[df['hash'].duplicated()]
# # print(duplicates)

# # a = "2006 BK86 2625063807789579264 2024-09-21 02:13"
# # a = "2006 BK86 2648316314053350784 2024-08-24 03:06"
# # print(a)
# # md5 = hashlib.md5(a.encode('utf-8')).digest()
# # hash = base64.urlsafe_b64encode(md5).decode('utf-8').rstrip("=")
# # print(hash)
