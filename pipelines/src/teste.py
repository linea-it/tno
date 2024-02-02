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


log = colorlog.getLogger('teste')
consoleFormatter = colorlog.ColoredFormatter('%(log_color)s%(message)s')
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

try:
    a = Asteroid(
        name="Chiron",
        base_path=base_path, 
        log=log,
        # new_run=False
    )


    # a.check_des_observations(0)
    # have_bsp_jpl = a.check_bsp_jpl(
    #             start_period='2024-01-01',
    #             end_period=str('2024-01-31'),
    #             days_to_expire=0,
    #         )
    # have_orb_ele = a.check_orbital_elements(
    #     days_to_expire=0
    # )

    a.have_obs = a.check_observations(days_to_expire=0)
    # raise Exception("shdshds")
except Exception as e:
    log.error(traceback.format_exc())
    log.error(e)
