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
    execution_path = os.environ["EXECUTION_PATH"]
    config_filepath = os.path.join(execution_path, "config.ini")
    config = configparser.ConfigParser()
    config.read(config_filepath)

    return config
