 
def write_json(filepath, data):
    import json
    import os

    with open(os.path.join(filepath), "w") as json_file:
        json.dump(data, json_file)


def ra2HMS(radeg, ndecimals=0):
    radeg = float(radeg) / 15
    raH = int(radeg)
    raM = int((radeg - raH) * 60)
    raS = 60 * ((radeg - raH) * 60 - raM)
    style = "{:02d} {:02d} {:0" + str(ndecimals + 3) + "." + str(ndecimals) + "f}"
    RA = style.format(raH, raM, raS)
    return RA


def dec2DMS(decdeg, ndecimals=0):
    decdeg = float(decdeg)
    ds = "+"
    if decdeg < 0:
        ds, decdeg = "-", abs(decdeg)
    deg = int(decdeg)
    decM = abs(int((decdeg - deg) * 60))
    decS = 60 * (abs((decdeg - deg) * 60) - decM)
    style = "{}{:02d} {:02d} {:0" + str(ndecimals + 3) + "." + str(ndecimals) + "f}"
    DEC = style.format(ds, deg, decM, decS)
    return DEC


def ra_hms_to_deg(ra):
    rs = 1

    H, M, S = [float(i) for i in ra.split()]
    if str(H)[0] == "-":
        rs, H = -1, abs(H)
    deg = (H * 15) + (M / 4) + (S / 240)
    ra_deg = deg * rs

    return ra_deg


def dec_hms_to_deg(dec):
    ds = 1

    D, M, S = [float(i) for i in dec.split()]
    if str(D)[0] == "-":
        ds, D = -1, abs(D)
    deg = D + (M / 60) + (S / 3600)
    dec_deg = deg * ds

    return dec_deg


def count_lines(filepath):
    with open(filepath, "r") as fp:
        num_lines = sum(1 for line in fp if line.rstrip())
        return num_lines

def ingest_occultations(asteroid_id, name, number, filepath, start_period, end_period):

    import pandas as pd
    from io import StringIO
    from dao import OccultationDao
    from library import ra_hms_to_deg, dec_hms_to_deg

    dao = OccultationDao()

    # Apaga as occultations já registradas para este asteroid antes de inserir.
    dao.delete_by_asteroid_id(asteroid_id, start_period, end_period)

    # Le o arquivo occultation table e cria um dataframe
    # occultation_date;ra_star_candidate;dec_star_candidate;ra_object;dec_object;ca;pa;vel;delta;g;j;h;k;long;loc_t;off_ra;off_de;pm;ct;f;e_ra;e_de;pmra;pmde
    df = pd.read_csv(
        filepath,
        delimiter=";",
        header=None,
        skiprows=1,
        names=[
            "occultation_date",
            "ra_star_candidate",
            "dec_star_candidate",
            "ra_object",
            "dec_object",
            "ca",
            "pa",
            "vel",
            "delta",
            "g",
            "j",
            "h",
            "k",
            "long",
            "loc_t",
            "off_ra",
            "off_de",
            "pm",
            "ct",
            "f",
            "e_ra",
            "e_de",
            "pmra",
            "pmde",
        ],
    )

    # Adiciona as colunas de coordenadas de target e star convertidas para degrees.
    df["ra_target_deg"] = df["ra_object"].apply(ra_hms_to_deg)
    df["dec_target_deg"] = df["dec_object"].apply(dec_hms_to_deg)
    df["ra_star_deg"] = df["ra_star_candidate"].apply(ra_hms_to_deg)
    df["dec_star_deg"] = df["dec_star_candidate"].apply(dec_hms_to_deg)

    # Adicionar colunas para asteroid id, name e number
    df["name"] = name
    df["number"] = number
    df["asteroid_id"] = asteroid_id

    # Remover valores como -- ou -
    df["ct"] = df["ct"].str.replace("--", "")
    df["f"] = df["f"].str.replace("-", "")

    # Altera o nome das colunas
    df = df.rename(
        columns={
            "occultation_date": "date_time",
            "ra_object": "ra_target",
            "dec_object": "dec_target",
            "ca": "closest_approach",
            "pa": "position_angle",
            "vel": "velocity",
            "off_de": "off_dec",
            "pm": "proper_motion",
            "f": "multiplicity_flag",
            "e_de": "e_dec",
            "pmde": "pmdec",
        }
    )

    # Altera a ordem das colunas para coincidir com a da tabela
    df = df.reindex(
        columns=[
            "name",
            "number",
            "date_time",
            "ra_star_candidate",
            "dec_star_candidate",
            "ra_target",
            "dec_target",
            "closest_approach",
            "position_angle",
            "velocity",
            "delta",
            "g",
            "j",
            "h",
            "k",
            "long",
            "loc_t",
            "off_ra",
            "off_dec",
            "proper_motion",
            "ct",
            "multiplicity_flag",
            "e_ra",
            "e_dec",
            "pmra",
            "pmdec",
            "ra_star_deg",
            "dec_star_deg",
            "ra_target_deg",
            "dec_target_deg",
            "asteroid_id",
        ]
    )

    data = StringIO()
    df.to_csv(
        data, sep="|", header=True, index=False,
    )
    data.seek(0)

    rowcount = dao.import_occultations(data)

    del df
    del data

    return rowcount


def has_expired(date, days=60):
    from datetime import datetime

    now = datetime.now()
    dif = now - date
    if dif.days < days:
        return False
    else:
        return True


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


def get_configs():
    import configparser
    import os
    # Carrega as variaveis de configuração do arquivo config.ini
    execution_path = os.environ['EXECUTION_PATH']
    config_filepath = os.path.join(execution_path, 'config.ini')
    config = configparser.ConfigParser()
    config.read(config_filepath)

    return config