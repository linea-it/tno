import json
import logging
import shutil
import sys
import traceback
from pathlib import Path

import colorlog
from asteroid import Asteroid

log = logging.getLogger("teste")
log.setLevel(logging.DEBUG)
consoleFormatter = logging.Formatter("[%(levelname)s] %(message)s")
consoleHandler = logging.StreamHandler(sys.stdout)
log.addHandler(consoleHandler)


log = colorlog.getLogger("teste")
consoleFormatter = colorlog.ColoredFormatter("%(log_color)s%(message)s")
consoleHandler = colorlog.StreamHandler(sys.stdout)
consoleHandler.setFormatter(consoleFormatter)
log.addHandler(consoleHandler)
log.setLevel(logging.DEBUG)

log.info("------- Asteroid Class -------")

base_path = Path("/app/outputs/predict_occultations/5/asteroids/2006BK86")

from predict_occultation.pipeline.occ_path_coeff import run_occultation_path_coeff

pred_table = base_path.joinpath("occultation_table.csv")
obj_dict = json.load(base_path.joinpath("2006BK86.json").open())
mag_and_uncert = base_path.joinpath("apmag_and_uncertainties.json")
run_occultation_path_coeff(pred_table, obj_dict, mag_and_uncert)

# try:
#     a = Asteroid(
#         name="2006 BK86",
#         base_path=base_path,
#         log=log,
#         # new_run=False
#     )

#     # a.check_des_observations(0)
#     # have_bsp_jpl = a.check_bsp_jpl(
#     #     start_period="2024-01-01",
#     #     end_period=str("2024-01-31"),
#     #     days_to_expire=0,
#     # )
#     # have_orb_ele = a.check_orbital_elements(days_to_expire=0)

#     # a.have_obs = a.check_observations(days_to_expire=0)
#     # raise Exception("shdshds")
#     start_date = "2024-08-21 00:00:00"
#     end_date = "2024-09-22 23:59:59"
#     jobid = 5
#     a.register_occultations(start_date, end_date, jobid)

# except Exception as e:
#     log.error(traceback.format_exc())
#     log.error(e)

# import base64
# import hashlib
# from datetime import datetime, timedelta

# import pandas


# def normalize_to_nearest_hour(dt):
#     # Ensure input is a datetime object
#     if not isinstance(dt, datetime):
#         raise TypeError("Input must be a datetime object")

#     # Extract the minute component
#     minute = dt.minute

#     # If minutes >= 30, round up to the next hour
#     if minute >= 30:
#         dt = dt + timedelta(hours=1)

#     # Normalize to the nearest hour by setting minutes and seconds to zero
#     normalized_dt = dt.replace(minute=0, second=0, microsecond=0)

#     return normalized_dt


# def generate_hash(name: str, source_id: int, date_time: datetime):

#     print(f"{name} {source_id} {date_time.strftime('%Y-%m-%d %H:%M:%S')}")
#     nearest_hour = normalize_to_nearest_hour(date_time)
#     # print(f"{name} {source_id} {nearest_hour.strftime('%Y-%m-%d %H:%M:%S')}")

#     identifier = f"{name} {source_id} {nearest_hour.strftime('%Y-%m-%d %H:%M:%S')}"
#     print(identifier)
#     md5 = hashlib.md5(identifier.encode("utf-8")).digest()
#     hash = base64.urlsafe_b64encode(md5).decode("utf-8").rstrip("=")
#     print(hash)
#     print("-----------------------------------")
#     return hash


# df = pandas.read_csv(
#     "/app/outputs/predict_occultations/teste_hash.csv",
#     delimiter=";",
#     parse_dates=["timezone"],
#     nrows=10,
# )
# # print(df.head(5))
# print(list(df.columns))

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
