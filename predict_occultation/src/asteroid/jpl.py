import base64
import http
import json
import pathlib
import re
import shutil
from datetime import datetime as dt

import requests
import spiceypy as spice

satellites_bsp = {
    "PLUTO": "https://naif.jpl.nasa.gov/pub/naif/generic_kernels/spk/satellites/plu060.bsp",
    "1930 BM": "https://naif.jpl.nasa.gov/pub/naif/generic_kernels/spk/satellites/plu060.bsp",
}


def get_asteroid_uncertainty_from_jpl(
    identifier, initial_date, final_date, directory, filename, name_type="", step=12
):
    url = "https://ssd.jpl.nasa.gov/api/horizons.api"
    params = {
        "format": "text",
        # "COMMAND": f"'DES={identifier}'",
        "COMMAND": f"'{name_type}{identifier}'",
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

    object_apmag_uncert_data = {}

    response = requests.get(url, params=params)
    if response.status_code != 200:
        raise Exception(
            f"Error retrieving asteroid uncertainties from JPL {response.status_code} - {http.HTTPStatus(response.status_code).phrase}"
        )

    try:
        text = response.text
        lines = text.splitlines()
        start_idx = lines.index("$$SOE") + 1
        end_idx = lines.index("$$EOE")
        data = []

        for line in lines[start_idx:end_idx]:
            columns = line.split()
            data.append(
                {
                    "JDUT": float(columns[0]),
                    "APmag": (
                        float(columns[1]) if columns[1] != "n.a." else float("nan")
                    ),
                    "RA_3sigma": (
                        float(columns[3]) if columns[3] != "n.a." else float("nan")
                    ),
                    "DEC_3sigma": (
                        float(columns[4]) if columns[4] != "n.a." else float("nan")
                    ),
                }
            )

        object_apmag_uncert_data = {
            "jd": [item["JDUT"] for item in data],
            "apmag": [item["APmag"] for item in data],
            "ra_3sigma": [item["RA_3sigma"] for item in data],
            "dec_3sigma": [item["DEC_3sigma"] for item in data],
        }

    # TODO: Não é possivel usar um raise exception pq quando a incerteza falha, falha ele simula falha de download de bsp pq esta sendo feito no mesmo try na classe asteroid
    except:
        pass
        # raise Exception(
        #     "Uncertainties unavailable. Error parsing asteroid uncertainties from JPL"
        # )

    path = pathlib.Path(directory)
    if not path.exists():
        raise ValueError("The directory {} does not exist!".format(path))

    output_file = path.joinpath(filename)

    if object_apmag_uncert_data:
        with open(output_file, "w") as f:
            json.dump(object_apmag_uncert_data, f)

    return output_file


### dont work!!!
## Para casos em que a api retorna multiples objetos
# def _parse_major_body_spkid(api_response: str, major_body_name: str) -> str | None:
#     """Extract the major body's ID from API response text."""
#     target = major_body_name.lower()
#     primary_marker = "(system barycenter)"

#     for line in api_response.splitlines():
#         # Skip irrelevant lines quickly
#         if not line.strip() or "ID#" in line or "-------" in line:
#             continue


#         line_lower = line.lower()
#         if target in line_lower and primary_marker in line_lower:
#             # Extract first token as ID if possible
#             parts = line.split()
#             if parts and parts[0].isdigit():
#                 return str(int(parts[0]))
#     return None
###

#### 2 tentativa
# def extract_system_barycenter_id(text):
#     if "Multiple major-bodies" not in text:
#         return None

#     # Regex para capturar o ID# antes de "(system barycenter)"
#     match = re.search(r"^\\s*(\\d+)\\s+.*\\(system barycenter\\)", text, re.MULTILINE)
#     print(match)
#     if match:
#         return match.group(1)
#     return None
####


def extract_system_barycenter_id(text):
    if "Multiple major-bodies" not in text:
        return None

    lines = text.splitlines()

    for line in lines:
        stripped = line.strip()
        if "(system barycenter)" in stripped:
            parts = stripped.split()
            if parts:
                return parts[0]  # O ID# é sempre o primeiro item da linha

    return None


def get_bsp_from_jpl(
    identifier, initial_date, final_date, directory, filename, name_type=""
):
    date1 = dt.strptime(initial_date, "%Y-%m-%d")
    date2 = dt.strptime(final_date, "%Y-%m-%d")
    diff = date2 - date1

    if diff.days <= 32:
        raise ValueError(
            "The [final_date] must be more than 32 days later than [initial_date]"
        )

    path = pathlib.Path(directory)
    if not path.exists():
        raise ValueError("The directory {} does not exist!".format(path))

    spk_file = path.joinpath(filename)

    ##
    # check if it is a major body such as Pluto...
    if identifier.upper() in satellites_bsp.keys():
        r = requests.get(satellites_bsp[identifier.upper()], stream=True)
        if r.status_code == 200:
            with open(spk_file, "wb") as f:
                f.write(r.content)
            return spk_file
        else:
            return r.status_code

    ##
    # https://ssd.jpl.nasa.gov/api/horizons.api?
    # format=text
    # &EPHEM_TYPE=SPK
    # &COMMAND=chiron
    # &START_TIME=2023-Jan-01
    # &STOP_TIME=2023-Mar-30

    # first we will assume the object is an asteroid or comet
    urlJPL = "https://ssd.jpl.nasa.gov/api/horizons.api"
    parameters = {
        "format": "json",
        "EPHEM_TYPE": "SPK",
        "OBJ_DATA": "YES",
        # "COMMAND": "'DES=" + identifier + "'",
        "COMMAND": f"'{name_type}{identifier}'",
        "START_TIME": date1.strftime("%Y-%b-%d"),
        "STOP_TIME": date2.strftime("%Y-%b-%d"),
    }

    r = requests.get(urlJPL, params=parameters, stream=True)
    if r.status_code != 200:
        raise Exception(
            f"Code {r.status_code} - {http.HTTPStatus(r.status_code).phrase}"
        )

    # now we will check if there was a match in the results returns status code 204
    data = json.loads(r.text)
    if "No matches found." in data["result"] or "error" in data.keys():
        return 204

    ## dont work !!!
    # if "Multiple major-bodies" in data["result"]:
    #     sb_identifier = _parse_major_body_spkid(data["result"], identifier)
    #     if sb_identifier:
    #         parameters["COMMAND"] = f"'DES={sb_identifier}'"
    #         r = requests.get(urlJPL, params=parameters, stream=True)
    #         data = json.loads(r.text)
    ##

    # funciona mas nao baixa o arquivo das incertezas
    # if "Multiple major-bodies" in data["result"]:
    #     # id_number = extract_system_barycenter_id(response_text)
    #     sb_identifier = extract_system_barycenter_id(data["result"])
    #     print("ID do system barycenter:", sb_identifier)

    #     if sb_identifier:
    #         parameters["COMMAND"] = f"'DES={sb_identifier}'"
    #         r = requests.get(urlJPL, params=parameters, stream=True)
    #         data = json.loads(r.text)

    if (
        r.status_code == requests.codes.ok
        and r.headers["Content-Type"] == "application/json"
    ):
        try:
            # If the SPK file was generated, decode it and write it to the output file:
            if "spk" in data:
                with open(spk_file, "wb") as f:
                    # Decode and write the binary SPK file content:
                    f.write(base64.b64decode(data["spk"]))
                    f.close()
                return spk_file
            else:
                # Otherwise, the SPK file was not generated so output an error:
                raise Exception(f"SPK file not generated: {r.text}")

        except ValueError as e:
            raise Exception(f"Unable to decode JSON. {e}")
        except OSError as e:
            raise Exception(f"Unable to create file '{spk_file}': {e}")
        except Exception as e:
            raise (e)

    elif r.status_code == 400:
        raise Exception("Bad Request code 400 - {r.text}")
    else:
        raise Exception(
            f"It was not able to download the bsp file for object. Error: {r.status_code}"
        )


def findSPKID(bsp):
    """Search the spk id of a small Solar System object from bsp file

    Args:
        bsp (str): File path for bsp jpl file.

    Returns:
        str: Spk id of Object or None
    """

    spice.furnsh([bsp])
    kind = "spk"

    fillen = 256
    typlen = 33
    srclen = 256
    keys = ["Target SPK ID   :", "ASTEROID_SPK_ID ="]
    n = len(keys[0])

    name, kind, source, loc = spice.kdata(0, kind, fillen, typlen, srclen)
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

    spice.kclear()

    if spk == "":
        return None

    return str(spk)
