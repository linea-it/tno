from parsl import python_app


@python_app
def increment(x):
    return x + 1


def match_positions_jpl_des(raJPL, decJPL, raDES, decDES, radius=2):
    import numpy as np
    from astropy import units as u
    from astropy.coordinates import SkyCoord

    catJPL = SkyCoord(ra=[raJPL]*u.deg, dec=[decJPL]*u.deg, frame='icrs')
    catD00 = SkyCoord(ra=raDES*u.deg, dec=decDES*u.deg, frame='icrs')
    id1, d2d1, d3d = catD00.match_to_catalog_sky(catJPL)

    # search the index and value of element with minimal distance
    IDX_D00 = np.argmin(d2d1.arcsec)
    dmin = d2d1[IDX_D00].arcsec

    ra, dec, match_idx = None, None, None
    if dmin < radius:
        ra = raDES[IDX_D00]
        dec = decDES[IDX_D00]
        match_idx = IDX_D00

    return ra, dec, match_idx


@python_app
def proccess_ccd(name, ccd, current_path):
    import os
    import numpy as np
    from astropy.io import fits
    from des.astrometry_parsl_apps import match_positions_jpl_des
    from datetime import datetime, timezone

    t0 = datetime.now(timezone.utc)

    tp = dict({
        'stage': 'match_positions',
        'start': t0.isoformat(),
        'end': None,
        'exec_time': None,
        'ccd_id': ccd['id']
    })

    obs_coordinates = None

    try:
        # Coordenadas teroricas
        ra_jpl, dec_jpl = ccd['theoretical_coordinates']

        filepath = os.path.join(ccd['path'], ccd['filename'])

        # Le o catalogo Fits
        hdul = fits.open(filepath)
        rows = hdul[2].data

        a_ra_des = rows['ALPHA_J2000']
        a_dec_des = rows['DELTA_J2000']
        a_magpsf = rows['MAG_PSF']
        a_magerrpsf = rows['MAGERR_PSF']

        ra, dec, match_idx = match_positions_jpl_des(
            ra_jpl, dec_jpl, a_ra_des, a_dec_des, radius=2)

        if ra is not None and dec is not None:
            # Calcular "observed minus calculated"
            observed_omc = [float((ra-ra_jpl)*3600*np.cos(np.radians(dec_jpl))),
                            float((dec-dec_jpl)*3600)]
            ccd.update({
                'observed_coordinates': [float(ra), float(dec)],
                'observed_omc': observed_omc,
                'magpsf': float(a_magpsf[match_idx]),
                'magerrpsf': float(a_magerrpsf[match_idx])
            })

            # Cria um objeto com os dados da posição observada,
            # Esta etapa está aqui para aproveitar o paralelismo e adiantar a consolidação.
            obs_coordinates = dict({
                'name': name,
                'ccd_id': ccd['id'],
                'date_obs': ccd['date_obs'],
                'date_jd': ccd['date_jd'],
                'ra': ccd['observed_coordinates'][0],
                'dec': ccd['observed_coordinates'][1],
                'offset_ra': ccd['observed_omc'][0],
                'offset_dec': ccd['observed_omc'][1],
                'mag_psf': ccd['magpsf'],
                'mag_psf_err': ccd['magerrpsf'],
            })

        else:
            ccd.update({
                'observed_coordinates': None,
                'info': 'Could not find a position.'
            })

    except Exception as e:
        ccd.update({
            'observed_coordinates': None,
            'error': 'Failed in match position stage with exception: %s' % str(e)
        })

    finally:
        t1 = datetime.now(timezone.utc)
        tdelta = t1 - t0

        tp['end'] = t1.isoformat()
        tp['exec_time'] = tdelta.total_seconds()

        return (name, ccd, obs_coordinates, tp)


def geoTopoVector(longitude, latitude, elevation, jd):
    '''
    Transformation from [longitude, latitude, elevation] to [x,y,z]
    '''
    from astropy.coordinates import GCRS, EarthLocation
    from astropy.time import Time
    import numpy as np

    loc = EarthLocation(longitude, latitude, elevation)

    time = Time(jd, scale='utc', format='jd')
    itrs = loc.get_itrs(obstime=time)
    gcrs = itrs.transform_to(GCRS(obstime=time))

    r = gcrs.cartesian

    # convert from m to km
    x = r.x.value/1000.0
    y = r.y.value/1000.0
    z = r.z.value/1000.0

    return np.array([x, y, z])


def compute_theoretical_positions(spk, ccd, bsp, dexxx, leap_second, location):
    import spiceypy as spice
    import numpy as np
    from des.astrometry_parsl_apps import geoTopoVector
    # TODO: Provavelmente esta etapa é que causa a lentidão desta operação
    # Por que carrega o arquivo de ephemeris planetarias que é pesado
    # Load the asteroid and planetary ephemeris and the leap second (in order)
    spice.furnsh(dexxx)
    spice.furnsh(leap_second)
    spice.furnsh(bsp)

    date_jd = ccd['date_jd']

    # Convert dates from JD to et format. "JD" is added due to spice requirement
    date_et = spice.utc2et(str(date_jd) + " JD UTC")

    # Compute geocentric positions (x,y,z) in km for each date with light time correction
    r_geo, lt_ast = spice.spkpos(spk, date_et, 'J2000', 'LT', '399')

    lon, lat, ele = location
    l_ra, l_dec = [], []

    # Convert from geocentric to topocentric coordinates
    r_topo = r_geo - geoTopoVector(lon, lat, ele, float(date_jd))

    # Convert rectangular coordinates (x,y,z) to range, right ascension, and declination.
    d, rarad, decrad = spice.recrad(r_topo)

    # Transform RA and Decl. from radians to degrees.
    ra = np.degrees(rarad)
    dec = np.degrees(decrad)

    ccd.update({
        'date_et': date_et,
        'geocentric_positions': list(r_geo),
        'topocentric_positions': list(r_topo),
        'theoretical_coordinates': [ra, dec]
    })

    spice.kclear()

    return ccd


@python_app
def theoretical_positions(asteroid, ccd):

    from des.astrometry_parsl_apps import compute_theoretical_positions

    ccd = compute_theoretical_positions(
        asteroid['spkid'],
        ccd,
        asteroid['bsp_jpl']['file_path'],
        asteroid['bsp_planetary']['relative_path'],
        asteroid['leap_second']['relative_path'],
        asteroid['observatory_location']
    )

    return asteroid, ccd
