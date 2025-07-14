import argparse
import datetime
import logging
import os
import shutil
import sys
import traceback
from pathlib import Path

import colorlog
from asteroid import Asteroid
from run_pred_occ import retrieve_asteroids

log = colorlog.getLogger("download_bsp_jpl")
consoleFormatter = colorlog.ColoredFormatter("%(log_color)s%(message)s")
consoleHandler = colorlog.StreamHandler(sys.stdout)
consoleHandler.setFormatter(consoleFormatter)
log.addHandler(consoleHandler)
log.setLevel(logging.DEBUG)


def main(start, end, filter_type, filter_value):
    log.info(" DOWNLOAD BSP JPL ".center(50, "-"))
    log.info(f"Start: {start}")
    log.info(f"End: {end}")
    log.info(f"Filter Type: {filter_type}")
    log.info(f"Filter Value: {filter_value}")
    log.info("-" * 50)

    base_path = Path("/app/outputs/predict_occultations/tmp_download_bsps")
    inputs_path = Path(os.getenv("INPUTS_PATH", "/app/inputs"))
    t0 = datetime.datetime.now()
    count = 0
    skiped = 0
    total_asteroids = 0
    try:
        asteroids = retrieve_asteroids(filter_type, filter_value)
        total_asteroids = len(asteroids)
        log.info(f"Total Asteroids: {total_asteroids}")

        for asteroid in asteroids:
            log.info(f"Asteroid: {asteroid['name']}")

            a = Asteroid(
                name=asteroid["name"],
                base_path=base_path,
                log=log,
                # new_run=False
                inputs_path=inputs_path,
            )

            # Verifica se o BSP JPL já foi baixado
            # e se o periodo de interesse está contido
            have_bsp_jpl = a.check_bsp_jpl(
                start_period=start,
                end_period=end,
            )

            if not have_bsp_jpl:
                a.download_jpl_bsp(
                    start_period=start,
                    end_period=end,
                )
                count += 1
            else:
                skiped += 1
            log.debug(f"Cleaning up: {a.path}")
            shutil.rmtree(a.path)

            log.info("-" * 50)

    except Exception as e:
        log.error(traceback.format_exc())
        log.error(e)
    finally:
        t1 = datetime.datetime.now()
        dt = t1 - t0
        log.info(f"Total Downloaded: {count} - Skiped: {skiped}")
        log.info(f"Total time: {dt}")


if __name__ == "__main__":
    parser = argparse.ArgumentParser(prog="Download BSPs from JPL")
    parser.add_argument(
        "-s", "--start", help="BSP Start Date YYYY-MM-DD", required=True
    )
    parser.add_argument("-e", "--end", help="BSP End Date YYYY-MM-DD", required=True)
    parser.add_argument(
        "-t",
        "--filter_type",
        help="Filter Type one of [name, dynclass, base_dynclass]",
        required=True,
    )
    parser.add_argument(
        "-v", "--filter_value", help="Filter Value for query asteroids", required=True
    )

    args = parser.parse_args()

    main(
        start=args.start,
        end=args.end,
        filter_type=args.filter_type,
        filter_value=args.filter_value,
    )


# python download_bsp_jpl.py --start 2025-01-01 --end 2030-12-31 --filter_type name --filter_value Eris



# docker compose exec download_bsp python download_bsp_jpl.py --start 2023-01-01 --end 2031-12-31 --filter_type name --filter_value Eris