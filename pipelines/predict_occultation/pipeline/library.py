#!/usr/bin/python2.7
# -*- coding: utf-8 -*-
import os
import numpy as np
import spiceypy as spice
from datetime import datetime, timedelta
import re


def check_leapsec(filename):
    """
        Verifica se o arquivo leapSec existe
    """
    app_path = os.environ.get("APP_PATH").rstrip('/')
    data_dir = os.environ.get("DIR_DATA").rstrip('/')

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
    app_path = os.environ.get("APP_PATH").rstrip('/')
    data_dir = os.environ.get("DIR_DATA").rstrip('/')

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
    app_path = os.environ.get("APP_PATH").rstrip('/')
    data_dir = os.environ.get("DIR_DATA").rstrip('/')

    in_bsp = os.path.join(data_dir, filename)

    dest = os.path.join(app_path, filename)

    print('IN BSP: ', in_bsp)
    print('DEST: ', dest)

    # Verifica se o Arquivo existe no diretorio data
    if os.path.exists(in_bsp):
        # Cria um link simbolico no Diretório do app
        os.symlink(in_bsp, dest)
        return filename
    else:
        raise (Exception("BSP Object %s file does not exist. %s" % (filename, in_bsp)))


def HMS2deg(ra='', dec=''):
    RA, DEC, rs, ds = '', '', 1, 1
    if dec:
        D, M, S = [float(i) for i in dec.split()]
        if str(D)[0] == '-':
            ds, D = -1, abs(D)
        deg = D + (M/60) + (S/3600)
        DEC = deg*ds

    if ra:
        H, M, S = [float(i) for i in ra.split()]
        if str(H)[0] == '-':
            rs, H = -1, abs(H)
        deg = (H*15) + (M/4) + (S/240)
        RA = deg*rs

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

    app_path = os.environ.get("APP_PATH").rstrip('/')
    data_dir = os.environ.get("DIR_DATA").rstrip('/')

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

    path = os.environ.get("DIR_DATA").rstrip('/')
    alias = asteroid_name.replace(' ', '').replace('_', '')
    filename = "{}.json".format(alias)

    filepath = os.path.join(path, filename)

    if os.path.exists(filepath):
        with open(filepath) as json_file:
            data = json.load(json_file)
            return data
    else:
        return dict({})


def write_asteroid_json(asteroid_name, data, callback_path=None):
    import os
    import json

    path = os.environ.get("DIR_DATA").rstrip('/')
    alias = asteroid_name.replace(' ', '').replace('_', '')
    filename = "{}.json".format(alias)

    filepath = os.path.join(path, filename)

    with open(filepath, 'w') as json_file:
        json.dump(data, json_file)

    if callback_path is not None:
        filepath = os.path.join(callback_path, filename)
        with open(filepath, 'w') as json_file:
            json.dump(data, json_file)


def count_lines(filepath):
    with open(filepath, 'r') as fp:
        num_lines = sum(1 for line in fp if line.rstrip())
        return num_lines


def create_nima_input(name, number, period_end):

    import os
    from datetime import datetime, timedelta

    path = os.environ.get("DIR_DATA").rstrip('/')
    nima_input_file = os.path.join(path, "nima_input.txt")

    # Path para arquivo template de input do NIMA
    app_path = os.environ.get("APP_PATH")
    template_file = os.path.join(app_path, "nima_input_template.txt")

    with open(template_file) as file:
        data = file.read()

        # Substitui no template as tags {} pelo valor das variaveis.
        # Parametro Asteroid Name
        name = name.replace('_', '').replace(' ', '')
        data = data.replace('{name}', name.ljust(66))

        data = data.replace('{dir_data}', path.ljust(66))

        # Parametro Asteroid Number
        if number is None or number == '-':
            number = name
        data = data.replace('{number}', number.ljust(66))

        # Parametro Plot start e Plot end
        # data = data.replace('{plot_start_date}', period_start.ljust(66))
        # year = int(period_end.split('-')[0]) - 1
        # data = data.replace('{plot_end_year}', str(year))
        data = data.replace('{plot_end}', str(period_end).ljust(66))

        # Parametro BSP start e BSP end
        # data = data.replace('{bsp_start_date}', period_start.ljust(66))
        # year = int(period_end.split('-')[0]) - 1
        # data = data.replace('{bsp_end_year}', str(year))
        data = data.replace('{bsp_end}', str(period_end).ljust(66))

        # Parametro Ephem start e Ephem end
        # data = data.replace('{ephem_start_date}', period_start.ljust(66))
        # year = int(period_end.split('-')[0]) - 1
        # data = data.replace('{ephem_end_year}', str(year))
        data = data.replace('{ephem_end}', str(period_end).ljust(66))

        with open(nima_input_file, 'w') as new_file:
            new_file.write(data)

        return nima_input_file

def ast_visual_mag_from_astdys(file_path):
    """
    Calculate the maximum visual magnitude from an AstDys .rwo file.

    This function reads data from an .rwo file provided by AstDys (Asteroids - Dynamic Site)
    and computes the maximum visual magnitude of an asteroid.

    Parameters:
        file_path (str): The path to the .rwo file. It is crucial that this file is in the
            .rwo format and comes from AstDys, as the function relies on the
            specific structure of these files.

    Returns:
        float or None: The maximum visual magnitude found in the file. If the maximum value cannot
            be calculated (including if the file does not exist or cannot be processed),
            the function returns None.
    """

    try:
        data = np.genfromtxt(file_path, dtype="U16,f8,U16", delimiter=[156,5,36], names=['_0', 'mag', '_1'], skip_header=7)
        max_mag = np.nanmax(data['mag'])
        return None if np.isnan(max_mag) else float(max_mag)
    except:
        return None
    
def compute_magnitude_drop(asteroid_visual_magnitude, star_visual_magnitude):
    """
    Compute the magnitude drop of an asteroid relative to a star.

    Parameters:
    - asteroid_visual_magnitude (float): The visual magnitude of the asteroid.
    - star_visual_magnitude (float): The visual magnitude of the star.

    Returns:
    - float: The magnitude drop of the asteroid relative to the star.
    """
    delta_magnitude = asteroid_visual_magnitude - star_visual_magnitude    
    drop_magnitude = 2.5 * np.log10( 1 + 10**(delta_magnitude*0.4))
    return drop_magnitude


def generate_date_range(start_date, end_date, num_points):
    """
    Generate a range of evenly spaced dates between two specified dates.

    Args:
        start_date (str): The start date in ISO format ('YYYY-MM-DD').
        end_date (str): The end date in ISO format ('YYYY-MM-DD').
        num_points (int): The number of evenly spaced dates to generate.

    Returns:
        list of str: A list of dates formatted as '%Y-%b-%d %H:%M'.
    """
    start_datetime = datetime.fromisoformat(start_date)
    end_datetime = datetime.fromisoformat(end_date)
    time_difference = (end_datetime - start_datetime).total_seconds()
    step_seconds = time_difference / (num_points - 1)
    date_range = [(start_datetime + timedelta(seconds=step_seconds * n)).strftime('%Y-%b-%d %H:%M') for n in range(num_points)]
    return date_range


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
    state, ltime = spice_object.spkezr(target, et, 'J2000', 'NONE', observer)
    return state[:3]


def asteroid_visual_magnitude(asteroid_bsp, naif_tls, planetary_bsp, instant, h=None, g=None):
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
            h = bsp_header['bsp_absmag']
        except:
            h = None
    
    if g is None:
        try:
            g = bsp_header['bsp_gcoeff']
        except:
            g = None    
    
    try:
        # Load necessary SPICE kernels
        spice.furnsh([asteroid_bsp, naif_tls, planetary_bsp])

        # Convert instant to ephemeris time
        et = spice.str2et(instant)
        
        # Define the target object (asteroid)
        target = bsp_header['bsp_spkid']

        # Calculate heliocentric distance
        r_vec = get_position_vector(target, 'SUN', et, spice)
        r_mod = np.sqrt(np.sum(np.array(r_vec**2)))
        r = r_mod/149597870.7  # Convert to astronomical units (AU)

        # Calculate geocentric distance
        delta_vec = get_position_vector(target, '399', et, spice)
        delta_mod = np.sqrt(np.sum(np.array(delta_vec**2)))
        delta = delta_mod/149597870.7 # Convert to astronomical units (AU)
        
        # Calculate solar phase angle
        prod_scalar = np.dot(r_vec, delta_vec)
        costheta = prod_scalar/(r_mod*delta_mod)
        phase_angle = np.arccos(costheta)

        # Calculate the apparent magnitude
        tfase = np.tan(0.5 * phase_angle)  # Half phase angle in radians
        phi1 = np.exp(-3.33 * (tfase**0.63))  # First phase angle coefficient
        phi2 = np.exp(-1.87 * (tfase**1.22))  # Second phase angle coefficient

        gcoeff = 0.15 if g is None else g  # Default or specified slope parameter

        # Calculate the apparent magnitude using the standard formula
        apmag = h + 5 * np.log10(delta * r) - 2.5 * np.log10((1 - gcoeff) * phi1 + gcoeff * phi2)

        # Unload SPICE kernels
        spice.kclear()

        return apmag
    except Exception as e:
        # print(f"Error: {e}")
        return None


def asteroid_max_visual_magnitude(asteroid_bsp, naif_tls, planetary_bsp, start_date, end_date, num_points=10, h=None, g=None):
    """
    Calculate the maximum visual magnitude of an asteroid over a given date range.

    Args:
        asteroid_bsp (str): Path to the asteroid's BSP file.
        naif_tls (str): Path to the NAIF Toolkit Leap Seconds (TLS) file.
        planetary_bsp (str): Path to the planetary data BSP file.
        start_date (str): The start date in ISO format.
        end_date (str): The end date in ISO format.
        num_points (int, optional): The number of points for magnitude calculation. Defaults to 10.
        h (float, optional): Absolute magnitude parameter (H). If None, a default value is used.
        g (float, optional): Slope parameter (G). If None, a default value is used.

    Returns:
        float or None: The maximum visual magnitude, or None if an error occurs.
    """
    try:
        date_range = generate_date_range(start_date, end_date, num_points)
        magnitudes = [asteroid_visual_magnitude(asteroid_bsp, naif_tls, planetary_bsp, date, h=h, g=g) for date in date_range]
        return np.max(magnitudes)
    except:
        return None
    
