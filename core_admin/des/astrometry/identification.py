import numpy as np
import spiceypy as spice
from astropy import units as u
from astropy.coordinates import GCRS, EarthLocation, SkyCoord
from astropy.time import Time


def geoTopoVector(longitude, latitude, elevation, jd):
    """Transformation from [longitude, latitude, elevation] to [x,y,z]

    Args:
        longitude ([type]): [description]
        latitude ([type]): [description]
        elevation ([type]): [description]
        jd ([type]): [description]

    Returns:
        [type]: [description]
    """
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


def ra2HMS(radeg='', ndecimals=0):
    """[summary]

    Args:
        radeg (str, optional): [description]. Defaults to ''.
        ndecimals (int, optional): [description]. Defaults to 0.

    Returns:
        [type]: [description]
    """
    raH = int(radeg)
    raM = int((radeg - raH)*60)
    raS = 60*((radeg - raH)*60 - raM)
    style = '{:02d} {:02d} {:0' + \
        str(ndecimals+3) + '.' + str(ndecimals) + 'f}'
    RA = style.format(raH, raM, raS)
    return RA


def dec2DMS(decdeg='', ndecimals=0):
    """[summary]

    Args:
        decdeg (str, optional): [description]. Defaults to ''.
        ndecimals (int, optional): [description]. Defaults to 0.

    Returns:
        [type]: [description]
    """
    ds = '+'
    if decdeg < 0:
        ds, decdeg = '-', abs(decdeg)
    deg = int(decdeg)
    decM = abs(int((decdeg - deg)*60))
    decS = 60*(abs((decdeg - deg)*60) - decM)
    style = '{}{:02d} {:02d} {:0' + \
        str(ndecimals+3) + '.' + str(ndecimals) + 'f}'
    DEC = style.format(ds, deg, decM, decS)
    return DEC


def computePosition(name, spkid, dates_jd, bsp, bsp_planetary, leap_second, location):
    """[summary]

    Args:
        name ([type]): [description]
        dates_jd ([type]): [description]
        bsp ([type]): [description]
        bsp_planetary ([type]): [description]
        leap_second ([type]): [description]
        location ([type]): [description]

    Returns:
        [type]: [description]
    """
    # Load the asteroid and planetary ephemeris and the leap second (in order)
    spice.furnsh(bsp_planetary)
    spice.furnsh(leap_second)
    spice.furnsh(bsp)

    # Convert dates from JD to et format. "JD" is added due to spice requirement
    dateET = [spice.utc2et(jd + " JD UTC") for jd in dates_jd]

    # Compute geocentric positions (x,y,z) in km for each date with light time correction
    rAst, ltAst = spice.spkpos(spkid, dateET, 'J2000', 'LT', '399')

    lon, lat, ele = location

    listRA, listDec = [], []

    for dateJD, r_geo in zip(dates_jd, rAst):
        # Convert from geocentric to topocentric coordinates
        r_topo = r_geo - geoTopoVector(lon, lat, ele, float(dateJD))

        # Convert rectangular coordinates (x,y,z) to range, right ascension, and declination.
        d, rarad, decrad = spice.recrad(r_topo)

        # Transform RA and Decl. from radians to degrees.
        listRA.append(np.degrees(rarad))
        listDec.append(np.degrees(decrad))

    spice.kclear()
    return listRA, listDec


def matchPositionsJPLDES(ra_jpl, dec_jpl, ra_des, dec_des, radius=2):
    """[summary]

    Args:
        ra_jpl ([type]): [description]
        dec_jpl ([type]): [description]
        ra_des ([type]): [description]
        dec_des ([type]): [description]
        radius (int, optional): [description]. Defaults to 2.

    Returns:
        [type]: [description]
    """
    catJPL = SkyCoord(ra=[ra_jpl]*u.deg, dec=[dec_jpl]*u.deg, frame='icrs')
    catD00 = SkyCoord(ra=ra_des*u.deg, dec=dec_des*u.deg, frame='icrs')
    id1, d2d1, d3d = catD00.match_to_catalog_sky(catJPL)

    # search the index and value of element with minimal distance
    IDX_D00 = np.argmin(d2d1.arcsec)
    dmin = d2d1[IDX_D00].arcsec

    ra, dec = None, None
    if dmin < radius:
        ra = ra_des[IDX_D00]
        dec = dec_des[IDX_D00]

    return ra, dec
