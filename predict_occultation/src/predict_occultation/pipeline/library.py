#!/usr/bin/python2.7
# -*- coding: utf-8 -*-
import os
import re

import astropy.units as u
import numpy as np
import spiceypy as spice
from astropy.coordinates import AltAz, EarthLocation, SkyCoord, get_body, get_sun
from astropy.time import Time
from scipy.interpolate import interp1d


def check_leapsec(filename):
    """
    Verifica se o arquivo leapSec existe
    """
    app_path = os.environ.get("APP_PATH").rstrip("/")
    data_dir = os.environ.get("DIR_DATA").rstrip("/")

    # local_leap_sec = os.path.join(app_path, filename)
    in_leap_sec = os.path.join(data_dir, filename)

    dest = os.path.join(app_path, filename)

    # Verifica se o Arquivo existe no diretorio local
    if os.path.exists(dest):
        return filename

    else:
        # Verifica se o arquivo existe no diretório /Data
        if os.path.exists(in_leap_sec):
            # Cria um link simbolico no Diretório do app
            os.symlink(in_leap_sec, dest)
            return filename
        else:
            raise (Exception("Leap Sec %s file does not exist." % filename))


def check_bsp_planetary(filename):
    """
    Verifica se o arquivo BSP Planetary existe
    """
    app_path = os.environ.get("APP_PATH").rstrip("/")
    data_dir = os.environ.get("DIR_DATA").rstrip("/")

    in_bsp = os.path.join(data_dir, filename)

    dest = os.path.join(app_path, filename)

    # Verifica se o Arquivo existe no diretorio local
    if os.path.exists(dest):
        return filename
    else:
        # Verifica se o arquivo existe no diretório /Data
        if os.path.exists(in_bsp):
            # Cria um link simbolico no Diretório do app
            os.symlink(in_bsp, dest)
            return filename
        else:
            raise (Exception("BSP Planetary %s file does not exist." % filename))


def check_bsp_object(filename):
    """
    Verifica se o arquivo BSP Object existe e cria um link no diretório app
    """
    print(filename)
    app_path = os.environ.get("APP_PATH").rstrip("/")
    data_dir = os.environ.get("DIR_DATA").rstrip("/")

    in_bsp = os.path.join(data_dir, filename)

    dest = os.path.join(app_path, filename)

    print("IN BSP: ", in_bsp)
    print("DEST: ", dest)

    # Verifica se o Arquivo existe no diretorio data
    if os.path.exists(in_bsp):
        # Cria um link simbolico no Diretório do app
        os.symlink(in_bsp, dest)
        return filename
    else:
        raise (Exception("BSP Object %s file does not exist. %s" % (filename, in_bsp)))


def HMS2deg(ra="", dec=""):
    RA, DEC, rs, ds = "", "", 1, 1
    if dec:
        D, M, S = [float(i) for i in dec.split()]
        if str(D)[0] == "-":
            ds, D = -1, abs(D)
        deg = D + (M / 60) + (S / 3600)
        DEC = deg * ds

    if ra:
        H, M, S = [float(i) for i in ra.split()]
        if str(H)[0] == "-":
            rs, H = -1, abs(H)
        deg = (H * 15) + (M / 4) + (S / 240)
        RA = deg * rs

    if ra and dec:
        return [RA, DEC]
    else:
        return RA or DEC


def clear_for_rerun(input_files, output_files):
    """Remove os arquivos de input e output utilizados no processo.
    - para arquivos de input remove só os links simbolicos em /app
    - para arquivos de output remove os links em /app e os arquivos originais em /data

    Args:
        input_files (list): Lista com os nomes de arquivos a serem removidos
        output_files (list): Lista com os nomes de arquivos a serem removidos
    """

    app_path = os.environ.get("APP_PATH").rstrip("/")
    data_dir = os.environ.get("DIR_DATA").rstrip("/")

    # Remover o arquivo bsp_object apenas o link
    for filename in input_files:
        a = os.path.join(app_path, filename)
        if os.path.exists(a):
            os.unlink(a)

    # Para os demais arquivos que tem link no diretório app e o arquivo no diretório data
    for filename in output_files:
        a = os.path.join(app_path, filename)
        d = os.path.join(data_dir, filename)
        if os.path.exists(a):
            os.unlink(a)
        if os.path.exists(d):
            os.remove(d)


def read_asteroid_json(asteroid_name):
    import json
    import os

    path = os.environ.get("DIR_DATA").rstrip("/")
    alias = asteroid_name.replace(" ", "").replace("_", "")
    filename = "{}.json".format(alias)

    filepath = os.path.join(path, filename)

    if os.path.exists(filepath):
        with open(filepath) as json_file:
            data = json.load(json_file)
            return data
    else:
        return dict({})


def write_asteroid_json(asteroid_name, data, callback_path=None):
    import json
    import os

    path = os.environ.get("DIR_DATA").rstrip("/")
    alias = asteroid_name.replace(" ", "").replace("_", "")
    filename = "{}.json".format(alias)

    filepath = os.path.join(path, filename)

    with open(filepath, "w") as json_file:
        json.dump(data, json_file)

    if callback_path is not None:
        filepath = os.path.join(callback_path, filename)
        with open(filepath, "w") as json_file:
            json.dump(data, json_file)


def count_lines(filepath):
    with open(filepath, "r") as fp:
        num_lines = sum(1 for line in fp if line.rstrip())
        return num_lines


def create_nima_input(name, number, period_end):

    import os
    from datetime import datetime, timedelta

    path = os.environ.get("DIR_DATA").rstrip("/")
    nima_input_file = os.path.join(path, "nima_input.txt")

    # Path para arquivo template de input do NIMA
    app_path = os.environ.get("APP_PATH")
    template_file = os.path.join(app_path, "nima_input_template.txt")

    with open(template_file) as file:
        data = file.read()

        # Substitui no template as tags {} pelo valor das variaveis.
        # Parametro Asteroid Name
        name = name.replace("_", "").replace(" ", "")
        data = data.replace("{name}", name.ljust(66))

        data = data.replace("{dir_data}", path.ljust(66))

        # Parametro Asteroid Number
        if number is None or number == "-":
            number = name
        data = data.replace("{number}", number.ljust(66))

        # Parametro Plot start e Plot end
        # data = data.replace('{plot_start_date}', period_start.ljust(66))
        # year = int(period_end.split('-')[0]) - 1
        # data = data.replace('{plot_end_year}', str(year))
        data = data.replace("{plot_end}", str(period_end).ljust(66))

        # Parametro BSP start e BSP end
        # data = data.replace('{bsp_start_date}', period_start.ljust(66))
        # year = int(period_end.split('-')[0]) - 1
        # data = data.replace('{bsp_end_year}', str(year))
        data = data.replace("{bsp_end}", str(period_end).ljust(66))

        # Parametro Ephem start e Ephem end
        # data = data.replace('{ephem_start_date}', period_start.ljust(66))
        # year = int(period_end.split('-')[0]) - 1
        # data = data.replace('{ephem_end_year}', str(year))
        data = data.replace("{ephem_end}", str(period_end).ljust(66))

        with open(nima_input_file, "w") as new_file:
            new_file.write(data)

        return nima_input_file


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


def get_position_vector(target, observer, et, spice_object):
    """
    Retrieve the position vector of a target relative to an observer at a given ephemeris time.

    Args:
        target (str): The target object (e.g., a planet or asteroid).
        observer (str): The observer object (e.g., a spacecraft or planet).
        et (float): The ephemeris time for which the position is required.
        spice_object (module): The SPICE module used for calculations.

    Returns:
        numpy.array: A 3-element array representing the position vector.
    """
    state, ltime = spice_object.spkezr(target, et, "J2000", "NONE", observer)
    return state[:3]


def asteroid_visual_magnitude(
    asteroid_bsp, naif_tls, planetary_bsp, instant, h=None, g=None, spice_global=False
):
    """
    Calculate the visual magnitude of an asteroid at a specific instant.

    Args:
        asteroid_bsp (str): Path to the asteroid's BSP file.
        naif_tls (str): Path to the NAIF Toolkit Leap Seconds (TLS) file.
        planetary_bsp (str): Path to the planetary data BSP file.
        instant (str): The specific instant in ISO format for the calculation.
        h (float, optional): Absolute magnitude parameter (H). If None, a default value is used.
        g (float, optional): Slope parameter (G). If None, a default value is used.

    Returns:
        float or None: The visual magnitude at the given instant, or None if an error occurs.
    """

    # Retrieve information from bsp header

    bsp_header = get_bsp_header_values(asteroid_bsp)

    if h is None:
        try:
            h = bsp_header["bsp_absmag"]
        except:
            h = None

    if g is None:
        try:
            g = bsp_header["bsp_gcoeff"]
        except:
            g = None

    try:
        # # Load necessary SPICE kernels
        if not spice_global:
            spice.furnsh([asteroid_bsp, naif_tls, planetary_bsp])

        # Convert instant to ephemeris time
        et = spice.str2et(instant.strftime("%Y-%b-%d %H:%M"))

        # Define the target object (asteroid)
        target = bsp_header["bsp_spkid"]

        # Calculate heliocentric distance
        r_vec = get_position_vector(target, "SUN", et, spice)
        r_mod = np.sqrt(np.sum(np.array(r_vec**2)))
        r = r_mod / 149597870.7  # Convert to astronomical units (AU)

        # Calculate geocentric distance
        delta_vec = get_position_vector(target, "399", et, spice)
        delta_mod = np.sqrt(np.sum(np.array(delta_vec**2)))
        delta = delta_mod / 149597870.7  # Convert to astronomical units (AU)

        # Calculate solar phase angle
        prod_scalar = np.dot(r_vec, delta_vec)
        costheta = prod_scalar / (r_mod * delta_mod)
        phase_angle = np.arccos(costheta)

        # Calculate the apparent magnitude
        tfase = np.tan(0.5 * phase_angle)  # Half phase angle in radians
        phi1 = np.exp(-3.33 * (tfase**0.63))  # First phase angle coefficient
        phi2 = np.exp(-1.87 * (tfase**1.22))  # Second phase angle coefficient

        gcoeff = 0.15 if g is None else g  # Default or specified slope parameter

        # Calculate the apparent magnitude using the standard formula
        apmag = (
            h
            + 5 * np.log10(delta * r)
            - 2.5 * np.log10((1 - gcoeff) * phi1 + gcoeff * phi2)
        )

        # Unload SPICE kernels
        # spice.kclear()

        return apmag
    except Exception as e:
        # print(f"Error: {e}")
        return None


def get_bsp_header_values(asteroid_bsp):
    """
    Extracts header information from an asteroid's binary SPK file.

    Args:
        asteroid_bsp (str): The path to the asteroid binary SPK file.

    Returns:
        dict: A dictionary with key-value pairs of the extracted header values.

    Raises:
        FileNotFoundError: If the SPK file is not found at the specified path.
        ValueError: If the SPK file contents are in an unexpected format.

    Example:
        bsp_values = get_bsp_header_values('3031857.bsp')
    """
    try:
        with open(asteroid_bsp, "rb") as binary_file:
            # Read the binary data into a bytearray
            binary_data = bytearray(binary_file.read())

        # Convert the bytearray to a string using the appropriate encoding
        texto = binary_data.decode("latin")

        # Extract header information
        # texto = decoded_string.split('SPK file contents:')[1]
        bspdict = {}

        # Extract target body name
        target_body_match = re.search(r"\s*Target\s+body\s+:\s+\((.*?)\)", texto)
        if target_body_match:
            target_body_value = target_body_match.group(1).strip()
            bspdict["bsp_target_body"] = target_body_value
        else:
            bspdict["bsp_target_body"] = None

        # Extract SPK ID
        spkid_match = re.search(r"\s*Target\s+SPK\s+ID\s+:\s+(\d+)", texto)
        if spkid_match:
            spkid_value = spkid_match.group(1).strip()
            bspdict["bsp_spkid"] = str(spkid_value)
        else:
            bspdict["bsp_spkid"] = None

        # This part is commented because the dates in the header seem not to match with the time range
        # validity of the file. However, the code is kept for it may be useful in terms of pattern search
        # inside bsps.

        #         # Extract start time
        #         start_time_match = re.search(r'\s*Start\s+time\s*:\s*(A\.D\.\s+[^\s:]+.*?)\s*TDB', texto)
        #         if start_time_match:
        #             start_time_value = start_time_match.group(1).strip('A.D.').strip()
        #             bspdict['bsp_start_time'] = datetime.strptime(start_time_value, '%Y-%b-%d %H:%M:%S.%f')
        #         else:
        #             bspdict['bsp_start_time'] = None

        #         # Extract stop time
        #         stop_time_match = re.search(r'\s*Stop\s+time\s*:\s*(A\.D\.\s+[^\s:]+.*?)\s*TDB', texto)
        #         if stop_time_match:
        #             stop_time_value = stop_time_match.group(1).strip('A.D.').strip()
        #             bspdict['bsp_stop_time'] = datetime.strptime(stop_time_value, '%Y-%b-%d %H:%M:%S.%f')
        #         else:
        #             bspdict['bsp_stop_time'] = None

        # Extract absolute magnitude
        absmag_match = re.search(r"\s+H=\s+([\d.]+)", texto)
        if absmag_match:
            absmag_value = absmag_match.group(1).strip()
            bspdict["bsp_absmag"] = float(absmag_value)
        else:
            bspdict["bsp_absmag"] = None

        # Extract gravitational coefficient
        gcoeff_match = re.search(r"\s+G=\s+([\d.]+)", texto)
        if gcoeff_match:
            gcoeff_value = gcoeff_match.group(1).strip()
            bspdict["bsp_gcoeff"] = float(gcoeff_value)
        else:
            bspdict["bsp_gcoeff"] = None

        return bspdict

    except FileNotFoundError:
        raise FileNotFoundError(
            f"The specified SPK file '{asteroid_bsp}' does not exist."
        )
    except Exception as e:
        raise ValueError(f"Error parsing SPK file: {str(e)}")


def compute_magnitude_drop(asteroid_visual_magnitude, star_visual_magnitude):
    """
    Compute the magnitude drop of an asteroid relative to a star.

    Parameters:
    - asteroid_visual_magnitude (float): The visual magnitude of the asteroid.
    - star_visual_magnitude (float): The visual magnitude of the star.

    Returns:
    - float: The magnitude drop of the asteroid relative to the star.
    """
    if asteroid_visual_magnitude is None or star_visual_magnitude is None:
        return None

    delta_magnitude = asteroid_visual_magnitude - star_visual_magnitude
    drop_magnitude = 2.5 * np.log10(1 + 10 ** (delta_magnitude * 0.4))
    return drop_magnitude


def get_moon_and_sun_separation(ra, dec, instant):
    "Earth location is considered geocentric"
    instant = Time(instant, scale="utc")
    object_coord = SkyCoord(ra=ra * u.deg, dec=dec * u.deg, obstime=instant)

    # Set location as geocenter
    geocenter = EarthLocation(x=0 * u.m, y=0 * u.m, z=0 * u.m)

    # Get the coordinates of the Moon and the Sun at the current time
    moon_coord = get_body("moon", instant, location=geocenter)
    sun_coord = get_body("sun", instant, location=geocenter)

    # Convert the celestial coordinates of the object to AltAz frame
    object_altaz = object_coord.transform_to(AltAz(obstime=instant, location=geocenter))

    # Convert the geocentric coordinates of the Moon and the Sun to AltAz frame
    moon_altaz = moon_coord.transform_to(AltAz(obstime=instant, location=geocenter))
    sun_altaz = sun_coord.transform_to(AltAz(obstime=instant, location=geocenter))

    # Calculate the angular separation between the Moon and the object
    moon_angular_separation = object_altaz.separation(moon_altaz).degree
    sun_angular_separation = object_altaz.separation(sun_altaz).degree
    return moon_angular_separation, sun_angular_separation


def get_apparent_diameter(diameter, distance):
    """computes the apparent diameter in mas with diameter given in km and distance in au"""
    if diameter is not None:
        apparent_diameter = (
            2 * np.arctan(0.5 * diameter / (distance * 149_597_870.7)) * 206_264_806
        )
        return apparent_diameter
    else:
        return None


def get_event_duration(diameter, velocity):
    """Computes the event duration in seconds with diameter given in km and velocity in km/s"""
    if diameter is not None:
        return diameter / abs(velocity)
    else:
        return None


def create_interpolator(jd, values):
    """
    Create an interpolator function based on the given data points.

    Parameters:
        jd (array-like): Array of Julian dates.
        values (array-like): Array of corresponding values.

    Returns:
        interp1d or None: Interpolator function if there are enough valid data points, otherwise None.

    Notes:
        - The function checks for NaN values in both `jd` and `values` arrays.
        - If there are less than 2 valid data points, the function returns None.
        - The interpolator function is created using the nearest neighbor method and supports extrapolation.
    """
    valid_indices = ~np.isnan(jd) & ~np.isnan(values)
    if np.sum(valid_indices) < 2:
        return None  # Not enough data points to create an interpolator
    return interp1d(
        jd[valid_indices],
        values[valid_indices],
        kind="nearest",
        fill_value="extrapolate",
    )


def get_mag_ra_dec_uncertainties_interpolator(jd, apmag, ra_3sigma, dec_3sigma):
    """
    Returns interpolators for magnitudes, right ascension (RA), and declination (Dec) uncertainties.

    Parameters:
    jd (array-like): Array of Julian dates.
    apmag (array-like): Array of apparent magnitudes corresponding to the Julian dates.
    ra_3sigma (array-like): Array of RA uncertainties corresponding to the Julian dates.
    dec_3sigma (array-like): Array of Dec uncertainties corresponding to the Julian dates.

    Returns:
    tuple: A tuple containing the interpolators for magnitudes, RA, and Dec uncertainties.
           If an interpolator cannot be created due to insufficient data, None is returned in its place.
    """

    jd = np.array(jd)
    apmag = np.array(apmag)
    ra_3sigma = np.array(ra_3sigma)
    dec_3sigma = np.array(dec_3sigma)

    magcs = create_interpolator(jd, apmag)
    rcs = create_interpolator(jd, ra_3sigma)
    dcs = create_interpolator(jd, dec_3sigma)

    return magcs, rcs, dcs


def get_instant_uncertainty(
    position_angle,
    delta,
    velocity,
    e_ra_target,
    e_dec_target,
    e_ra_star=0,
    e_dec_star=0,
):
    """
    Calculate the time uncertainty in seconds based on the projected errors from the target and star.

    Parameters:
    position_angle (float): The position angle in degrees.
    delta (float): The distance in astronomical units (AU).
    velocity (float): The velocity in km/s.
    e_ra_target (float): Error in right ascension for the target in arcseconds.
    e_dec_target (float): Error in declination for the target in arcseconds.
    e_ra_star (float, optional): Error in right ascension for the star in arcseconds. Default is 0.
    e_dec_star (float, optional): Error in declination for the star in arcseconds. Default is 0.

    Returns:
    float: The time uncertainty in seconds.
    """

    # Conversion factor from astronomical units to kilometers
    AU_TO_KM = 149597870.7

    # Determine the quadrant based on the position angle
    quadrant = position_angle // 90

    def projected_error(e_ra, e_dec, quadrant, phi_rad):
        """
        Project the error components based on the quadrant and angle.

        Parameters:
        e_ra (float): Error in right ascension in km.
        e_dec (float): Error in declination in km.
        quadrant (int): Quadrant of the position angle.
        phi_rad (float): Angle in radians.

        Returns:
        tuple: Projected errors in the path direction.
        """
        if (quadrant % 2) == 0:
            return e_ra * np.cos(phi_rad), e_dec * np.sin(phi_rad)
        return e_ra * np.sin(phi_rad), e_dec * np.cos(phi_rad)

    def apparent_error_in_km(error_arcsec):
        """
        Convert apparent error from arcseconds to kilometers.

        Parameters:
        error_arcsec (float): Error in arcseconds.

        Returns:
        float: Error in kilometers.
        """
        return distance_km * 2 * np.tan(np.deg2rad(error_arcsec / 3600) / 2)

    phi = position_angle % 90
    phi_rad = np.deg2rad(phi)

    # Convert distance from AU to km
    distance_km = delta * AU_TO_KM

    # Calculate target and star apparent errors in km
    e_ra_target_km = apparent_error_in_km(e_ra_target)
    e_dec_target_km = apparent_error_in_km(e_dec_target)
    e_ra_star_km = apparent_error_in_km(e_ra_star)
    e_dec_star_km = apparent_error_in_km(e_dec_star)

    # Project errors onto the path direction
    e_ra_target_km_path_direction, e_dec_target_km_path_direction = projected_error(
        e_ra_target_km, e_dec_target_km, quadrant, phi_rad
    )
    e_ra_star_km_path_direction, e_dec_star_km_path_direction = projected_error(
        e_ra_star_km, e_dec_star_km, quadrant, phi_rad
    )

    # Calculate total error in km by quadrature sum
    total_error_km = np.sqrt(
        e_ra_target_km_path_direction**2
        + e_dec_target_km_path_direction**2
        + e_ra_star_km_path_direction**2
        + e_dec_star_km_path_direction**2
    )

    # Calculate time uncertainty in seconds
    time_uncertainty = total_error_km / abs(velocity)
    return time_uncertainty


def get_closest_approach_uncertainty(
    position_angle, e_ra_target, e_dec_target, e_ra_star=0, e_dec_star=0
):
    """
    Calculate the closest approach uncertainty in arcseconds based on the projected errors.

    Parameters:
    position_angle (float): The position angle in degrees.
    e_ra_target (float): Error in right ascension for the target in arcseconds.
    e_dec_target (float): Error in declination for the target in arcseconds.
    e_ra_star (float, optional): Error in right ascension for the star in arcseconds. Default is 0.
    e_dec_star (float, optional): Error in declination for the star in arcseconds. Default is 0.

    Returns:
    float: The total error in arcseconds.
    """

    # Determine the quadrant based on the position angle
    quadrant = position_angle // 90

    def projected_error(e_ra, e_dec, quadrant, phi_rad):
        """
        Project the error components based on the quadrant and angle.

        Parameters:
        e_ra (float): Error in right ascension in arcseconds.
        e_dec (float): Error in declination in arcseconds.
        quadrant (int): Quadrant of the position angle.
        phi_rad (float): Angle in radians.

        Returns:
        tuple: Projected errors in the perpendicular direction to the path.
        """
        if (quadrant % 2) == 0:
            return e_ra * np.sin(phi_rad), e_dec * np.cos(phi_rad)
        return e_ra * np.cos(phi_rad), e_dec * np.sin(phi_rad)

    phi = position_angle % 90
    phi_rad = np.deg2rad(phi)

    # Project errors onto the perpendicular to the path direction
    e_ra_target_perp_path_direction, e_dec_target_perp_path_direction = projected_error(
        e_ra_target, e_dec_target, quadrant, phi_rad
    )
    e_ra_star_perp_path_direction, e_dec_star_perp_path_direction = projected_error(
        e_ra_star, e_dec_star, quadrant, phi_rad
    )

    # Calculate total error in arcseconds by quadrature sum
    total_error_arcsec = np.sqrt(
        e_ra_target_perp_path_direction**2
        + e_dec_target_perp_path_direction**2
        + e_ra_star_perp_path_direction**2
        + e_dec_star_perp_path_direction**2
    )

    return total_error_arcsec


def get_moon_illuminated_fraction(time, ephemeris=None):
    """
    Calculate the fraction of the Moon's illumination.

    Parameters:
    - time (str, astropy.time.Time): The time at which to calculate the illumination.
    - ephemeris (str, optional): The name of the ephemeris to use. Defaults to None equals geocenter.

    Returns:
    - illumination_fraction (float): The fraction of the Moon's illumination.
    """
    time = Time(time, scale="utc") if not isinstance(time, Time) else time

    # Get the positions of the Sun and Moon
    sun = get_sun(time)
    moon = get_body("moon", time, ephemeris=ephemeris)

    # Compute the elongation (angular separation) between the Moon and the Sun
    elongation = sun.separation(moon)

    # Compute the phase angle (the angle between the Moon, Earth, and Sun)
    moon_phase_angle = np.arctan2(
        sun.distance * np.sin(elongation),
        moon.distance - sun.distance * np.cos(elongation),
    )

    # Compute the fraction of illumination
    illumination_fraction = (1 + np.cos(moon_phase_angle)) / 2.0

    return illumination_fraction
