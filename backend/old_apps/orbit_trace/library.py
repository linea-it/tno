#!/usr/bin/env python3
import os

from parsl import python_app


def get_logger(path, filename="identifier.log"):
    import logging
    import os

    logfile = os.path.join(path, filename)
    formatter = logging.Formatter("%(asctime)s [%(levelname)s] %(message)s")
    file_handler = logging.FileHandler(logfile)
    file_handler.setFormatter(formatter)
    log = logging.getLogger("identifier")
    log.setLevel(logging.DEBUG)
    log.addHandler(file_handler)

    return log


def read_inputs(path, filename="job.json"):
    import os
    import json

    with open(os.path.join(path, filename)) as json_file:
        data = json.load(json_file)

    return data


# # def load_heartbeat():
# #     import json
# #     with open('heartbeat.json') as json_file:
# #         data = json.load(json_file)
# #         return data


def write_job_file(path, data):
    import json
    import os

    with open(os.path.join(path, "job.json"), "w") as json_file:
        json.dump(data, json_file)


# @python_app(executors=["htcondor_1"])
@python_app()
def retrieve_asteroids(type, values):

    from dao import AsteroidDao

    asteroids = None
    if type == "name":
        asteroids = AsteroidDao().get_asteroids_by_names(names=values.split(";"))
    else:
        asteroids = AsteroidDao().get_asteroids_by_dynclass(dynclass=values)

    for asteroid in asteroids:
        asteroid.update({"status": "running", "ccds": []})

    return asteroids


def date_to_jd(date_obs, exptime, leap_second):
    """Aplica uma correção a data de observação e converte para data juliana

    Correção para os CCDs do DES:
        date = date_obs + 0.5 * (exptime + 1.05)

    Args:
        date_obs (datetime): Data de observação do CCD "date_obs"
        exptime (float): Tempo de exposição do CCD "exptime"
        lead_second (str): Path para o arquivo leap second a ser utilizado por exemplo: '/archive/lead_second/naif0012.tls'

    Returns:
        str: Data de observação corrigida e convertida para julian date.
    """
    import spiceypy as spice

    # Calcula a correção
    correction = (exptime + 1.05) / 2

    # Carrega o lead second na lib spicepy
    spice.furnsh(leap_second)

    # Converte a date time para JD
    date_et = spice.utc2et(str(date_obs).split("+")[0] + " UTC")
    date_jdutc = spice.et2utc(date_et, "J", 14)

    # Remove a string JD retornada pela lib
    midtime = date_jdutc.replace("JD ", "")

    # Soma a correção
    jd = float(midtime) + correction / 86400

    spice.kclear()

    return jd


def get_bsp_from_jpl(identifier, initial_date, final_date, email, directory):
    """Download bsp files from JPL database

        Bsp files, which have information to generate
        the ephemeris of the objects, will be downloaded
        The files will be named as (without spaces): [identifier].bsp

        Important:
            it is able to download bsp files of neither planets nor satellites

    Args:
        identifier (str): Identifier of the object.
            It can be the name, number or SPK ID.
            It can also be a list of objects.
            Examples:
                '2137295'
                '1999 RB216'
                '137295'
                'Chariklo'
        initial_date (str): Date the bsp file is to begin, within span [1900-2100].
            Examples:
                '2003-02-01'
                '2003-3-5'
        final_date (str): Date the bsp file is to end, within span [1900-2100].
            Must be more than 32 days later than [initial_date].
            Examples:
                '2006-01-12'
                '2006-1-12'
        email (str): User's e-mail contact address.
            Example: username@user.domain.name
        directory (str): Directory path to save the bsp files.

    Returns:
        Path: file path for .bsp file.
    """
    import pathlib
    import shutil
    from datetime import datetime as dt

    import requests
    import spiceypy as spice

    date1 = dt.strptime(initial_date, "%Y-%m-%d")
    date2 = dt.strptime(final_date, "%Y-%m-%d")
    diff = date2 - date1

    if diff.days <= 32:
        raise ValueError(
            "The [final_date] must be more than 32 days later than [initial_date]"
        )

    urlJPL = "https://ssd.jpl.nasa.gov/x/smb_spk.cgi?OPTION=Make+SPK"

    path = pathlib.Path(directory)
    if not path.exists():
        raise ValueError("The directory {} does not exist!".format(path))

    filename = identifier.replace(" ", "") + ".bsp"

    parameters = {
        "OBJECT": identifier,
        "START": date1.strftime("%Y-%b-%d"),
        "STOP": date2.strftime("%Y-%b-%d"),
        "EMAIL": email,
        "TYPE": "-B",
    }

    r = requests.get(urlJPL, params=parameters, stream=True)
    bspFormat = r.headers["Content-Type"]
    if r.status_code == requests.codes.ok and bspFormat == "application/download":
        file_path = path.joinpath(filename)
        with open(file_path, "wb") as f:
            r.raw.decode_content = True
            shutil.copyfileobj(r.raw, f)

        return file_path
    else:
        # TODO: Add a Debug
        raise Exception("It was not able to download the bsp file for object.")


def findSPKID(bsp):
    """Search the spk id of a small Solar System object from bsp file

    Args:
        bsp (str): File path for bsp jpl file.

    Returns:
        str: Spk id of Object
    """
    import spiceypy as spice

    bsp = [bsp]
    spice.furnsh(bsp)

    i = 0
    kind = "spk"
    fillen = 256
    typlen = 33
    srclen = 256
    keys = ["Target SPK ID   :", "ASTEROID_SPK_ID ="]
    n = len(keys[0])

    name, kind, source, loc = spice.kdata(i, kind, fillen, typlen, srclen)
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
    return spk


def geo_topo_vector(longitude, latitude, elevation, jd):
    """
    Transformation from [longitude, latitude, elevation] to [x,y,z]
    """
    from astropy.coordinates import GCRS, EarthLocation
    from astropy.time import Time
    import numpy as np

    loc = EarthLocation(longitude, latitude, elevation)

    time = Time(jd, scale="utc", format="jd")
    itrs = loc.get_itrs(obstime=time)
    gcrs = itrs.transform_to(GCRS(obstime=time))

    r = gcrs.cartesian

    # convert from m to km
    x = r.x.value / 1000.0
    y = r.y.value / 1000.0
    z = r.z.value / 1000.0

    return np.array([x, y, z])


def compute_theoretical_positions(
    spkid, ccds, bsp_jpl, bsp_planetary, leap_second, location
):

    import spiceypy as spice
    import numpy as np
    from library import geo_topo_vector

    # TODO: Provavelmente esta etapa é que causa a lentidão desta operação
    # Por que carrega o arquivo de ephemeris planetarias que é pesado
    # Load the asteroid and planetary ephemeris and the leap second (in order)
    spice.furnsh(bsp_planetary)
    spice.furnsh(leap_second)
    spice.furnsh(bsp_jpl)

    results = []

    for ccd in ccds:
        date_jd = ccd["date_jd"]

        # Convert dates from JD to et format. "JD" is added due to spice requirement
        date_et = spice.utc2et(str(date_jd) + " JD UTC")

        # Compute geocentric positions (x,y,z) in km for each date with light time correction
        r_geo, lt_ast = spice.spkpos(spkid, date_et, "J2000", "LT", "399")

        lon, lat, ele = location
        l_ra, l_dec = [], []

        # Convert from geocentric to topocentric coordinates
        r_topo = r_geo - geo_topo_vector(lon, lat, ele, float(date_jd))

        # Convert rectangular coordinates (x,y,z) to range, right ascension, and declination.
        d, rarad, decrad = spice.recrad(r_topo)

        # Transform RA and Decl. from radians to degrees.
        ra = np.degrees(rarad)
        dec = np.degrees(decrad)

        ccd.update(
            {
                "date_et": date_et,
                "geocentric_positions": list(r_geo),
                "topocentric_positions": list(r_topo),
                "theoretical_coordinates": [ra, dec],
            }
        )

        results.append(ccd)

    spice.kclear()

    return results


# @python_app(executors=["htcondor_1"])
@python_app()
def retrieve_ccds_by_asteroid(asteroid, leap_second):
    from dao import AsteroidDao
    from library import date_to_jd

    ccds = AsteroidDao().ccds_by_asteroid(asteroid_name=asteroid["name"])

    for ccd in ccds:
        ccd.update(
            {
                "date_obs": str(ccd["date_obs"]),
                "date_jd": date_to_jd(ccd["date_obs"], ccd["exptime"], leap_second),
            }
        )

    asteroid["ccds"] = ccds

    return asteroid


# @python_app(executors=["htcondor_1"])
@python_app()
def retrieve_bsp_by_asteroid(name, initial_date, final_date, job_path):

    import os
    import pathlib
    import traceback
    from library import get_bsp_from_jpl
    from config import JPL_EMAIL

    bsp = dict(
        {
            "status": None,
            "filename": None,
            "path": None,
            "file_size": None,
        }
    )

    try:
        # Criar o diretório para o asteroid.
        asteroid_path = pathlib.Path.joinpath(
            pathlib.Path(job_path), name.replace(" ", "_")
        )
        pathlib.Path(asteroid_path).mkdir(parents=True, exist_ok=True)

        if not asteroid_path.exists():

            # Download BSP from JPL
            bsp_path = get_bsp_from_jpl(
                name, initial_date, final_date, JPL_EMAIL, asteroid_path.absolute()
            )

        else:
            # Já existe diretório verifica se existe o arquivo
            a_path = asteroid_path.joinpath("%s.bsp" % name.replace(" ", "_"))

            if not a_path.exists():
                # Download BSP from JPL
                bsp_path = get_bsp_from_jpl(
                    name, initial_date, final_date, JPL_EMAIL, asteroid_path.absolute()
                )
            else:
                # Arquivo já existe faz nada
                bsp_path = a_path

        bsp.update(
            {
                "status": "success",
                "filename": os.path.basename(bsp_path),
                "path": str(bsp_path),
                "file_size": os.path.getsize(bsp_path),
            }
        )

    except Exception as e:
        trace = traceback.format_exc()

        msg = "Failed on retrive asteroids BSP from JPL. %s" % e

        bsp["status"] = "failure"
        bsp["error"] = msg
        bsp["traceback"] = trace

    finally:
        return bsp


# @python_app(executors=["htcondor"])
@python_app()
def theoretical_positions(asteroid, bsp_planetary, leap_second, observatory_location):

    from library import compute_theoretical_positions
    import traceback

    try:
        # Recuperar o SPK Id do objeto a partir do seu BSP
        asteroid["spkid"] = findSPKID(asteroid["bsp_jpl"]["path"])

        ccds = compute_theoretical_positions(
            asteroid["spkid"],
            asteroid["ccds"],
            asteroid["bsp_jpl"]["path"],
            bsp_planetary,
            leap_second,
            observatory_location,
        )

        asteroid["ccds"] = ccds

    except Exception as e:
        trace = traceback.format_exc()

        msg = "Failed on retrive asteroids BSP from JPL. %s" % e

        asteroid["status"] = "failure"
        asteroid["error"] = msg
        asteroid["traceback"] = trace

    finally:
        return asteroid


# @python_app(executors=["htcondor"])
@python_app()
def observed_positions(idx, name, asteroid_id, ccd, asteroid_path, radius=2):

    import os
    import numpy as np
    from astropy.io import fits
    from library import get_logger

    import numpy as np
    from astropy import units as u
    from astropy.coordinates import SkyCoord

    obs_coordinates = None

    log = get_logger(asteroid_path, "%s_obs_%s.log" % (name.replace(" ", "_"), idx))

    log.info("Calculating observed positions")
    log.debug("Asteroid: %s" % name)
    log.debug("IDX: %s" % idx)
    log.debug("CCD: %s" % ccd["path"])

    try:
        # Coordenadas teroricas
        ra_jpl, dec_jpl = ccd["theoretical_coordinates"]

        file_path = os.path.join(ccd["path"], ccd["filename"])

        # Le o catalogo Fits
        hdul = fits.open(file_path)
        rows = hdul[2].data

        a_ra_des = rows["ALPHA_J2000"]
        a_dec_des = rows["DELTA_J2000"]
        a_magpsf = rows["MAG_PSF"]
        a_magerrpsf = rows["MAGERR_PSF"]

        catJPL = SkyCoord(ra=[ra_jpl] * u.deg, dec=[dec_jpl] * u.deg, frame="icrs")
        catD00 = SkyCoord(ra=a_ra_des * u.deg, dec=a_dec_des * u.deg, frame="icrs")
        id1, d2d1, d3d = catD00.match_to_catalog_sky(catJPL)

        # search the index and value of element with minimal distance
        IDX_D00 = np.argmin(d2d1.arcsec)
        dmin = d2d1[IDX_D00].arcsec

        ra, dec, match_idx = None, None, None
        if dmin < radius:
            ra = a_ra_des[IDX_D00]
            dec = a_dec_des[IDX_D00]
            match_idx = IDX_D00

        if ra is not None and dec is not None:
            # Calcular "observed minus calculated"
            observed_omc = [
                float((ra - ra_jpl) * 3600 * np.cos(np.radians(dec_jpl))),
                float((dec - dec_jpl) * 3600),
            ]
            ccd.update(
                {
                    "observed_coordinates": [float(ra), float(dec)],
                    "observed_omc": observed_omc,
                    "magpsf": float(a_magpsf[match_idx]),
                    "magerrpsf": float(a_magerrpsf[match_idx]),
                }
            )

            # Cria um objeto com os dados da posição observada,
            # Esta etapa está aqui para aproveitar o paralelismo e adiantar a consolidação.
            obs_coordinates = dict(
                {
                    "name": name,
                    "asteroid_id": asteroid_id,
                    "ccd_id": ccd["id"],
                    "date_obs": ccd["date_obs"],
                    "date_jd": ccd["date_jd"],
                    "ra": ccd["observed_coordinates"][0],
                    "dec": ccd["observed_coordinates"][1],
                    "offset_ra": ccd["observed_omc"][0],
                    "offset_dec": ccd["observed_omc"][1],
                    "mag_psf": ccd["magpsf"],
                    "mag_psf_err": ccd["magerrpsf"],
                }
            )

            log.info("Observed Coordinates: %s" % ccd["observed_coordinates"])

        else:
            ccd.update(
                {"observed_coordinates": None, "info": "Could not find a position."}
            )

            log.info("Could not find a position.")

    except Exception as e:
        ccd.update(
            {
                "observed_coordinates": None,
                "error": "Failed in match position stage with exception: %s" % str(e),
            }
        )
        log.error("Failed in match position stage with exception: %s" % str(e))

    finally:
        log.info("Calculating observed positions Finish")
        return (name, ccd, obs_coordinates)


# @python_app(executors=["htcondor_1"])
@python_app()
def ingest_observations(observations):

    import pandas as pd
    from io import StringIO
    from dao import AsteroidDao, ObservationDao

    # Apaga as observations já registradas para este asteroid antes de inserir.
    name = observations[0]["name"]
    ObservationDao().delete_by_asteroid_name(name)

    df_obs = pd.DataFrame(
        observations,
        columns=[
            "name",
            "date_obs",
            "date_jd",
            "ra",
            "dec",
            "offset_ra",
            "offset_dec",
            "mag_psf",
            "mag_psf_err",
            "asteroid_id",
            "ccd_id",
        ],
    )

    # TODO: Tratar os dados se necessário
    data = StringIO()
    df_obs.to_csv(
        data,
        sep="|",
        header=True,
        index=False,
    )
    data.seek(0)

    tablename = "des_observation"

    # Sql Copy com todas as colunas que vão ser importadas e o formato do csv.
    sql = (
        "COPY %s (name, date_obs, date_jd, ra, dec, offset_ra, offset_dec, mag_psf, mag_psf_err, asteroid_id, ccd_id) FROM STDIN with (FORMAT CSV, DELIMITER '|', HEADER);"
        % tablename
    )

    rowcount = AsteroidDao().import_with_copy_expert(sql, data)

    return rowcount


# @python_app(executors=["htcondor"])
@python_app()
def write_asteroid_data(asteroid):
    import json
    import gzip
    import os

    filepath = os.path.join(
        asteroid["path"], "%s.json.gz" % asteroid["name"].replace(" ", "_")
    )

    with gzip.open(filepath, "wt", encoding="UTF-8") as zipfile:
        json.dump(asteroid, zipfile)

    return asteroid


# @python_app(executors=["htcondor"])
@python_app()
def update_job(job):
    from dao import AstrometryJobDao

    AstrometryJobDao().update_job(job)
