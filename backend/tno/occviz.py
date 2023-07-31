# occviz.py
# Author: Rodrigo Boufleur July 2023
# The _xy2latlon function is a reproduction from the function xy2latlon from the SORA v0.31 lib

import numpy as np
import astropy.units as u
import astropy.constants as const
from astropy.time import Time
from astropy.coordinates import SkyCoord, Angle, GCRS, ITRS, get_sun, EarthLocation, SkyOffsetFrame
from scipy.interpolate import CubicSpline
from django.conf import settings



def _xy2latlon(x, y, loncen, latcen, time):
    """Calculates the longitude and latitude given projected positions x and y.
       This private function is a refactored and improved version based on the code by SORA lib.

    Parameters
    ----------
    x : `int`, `float`
        Projected position in x, in the GCRS, in meters.

    y : `int`, `float`
        Projected position in y, in the GCRS, in meters.

    loncen : `int`, `float`
        Center longitude of projection, in degrees.

    latcen : `int`, `float`
        Center latitude of projection, in degrees.

    time : `astropy.time.Time`
        Time of referred projection.

    Returns
    -------
    lon, lat : `list`
        Longitude and Latitude whose projection at loncen, lat results
        in x, y. (deg).
    """
    x = np.array(x, ndmin=1)
    y = np.array(y, ndmin=1)
    r2 = const.R_earth.to_value(u.m)**2 - (x**2 + y**2)
    
    true_idx = np.where(r2 >= 0.0)[0]

    r, x, y = np.sqrt(r2[true_idx]), x[true_idx], y[true_idx]

    lon, lat = np.full(len(r2), 1e+31), np.full(len(r2), 1e+31)
    
    if len(r) > 0:
        if ( not time.isscalar ) and ( len(time) == len(r2) ):
            time, loncen, latcen = time[true_idx], loncen[true_idx], latcen[true_idx]

            site_cen = EarthLocation(loncen*u.deg, latcen*u.deg) 
            itrs_cen = site_cen.get_itrs(obstime=time)
            gcrs_cen = itrs_cen.transform_to(GCRS(obstime=time))
            center_frame = SkyOffsetFrame(origin=gcrs_cen)

            for n in range(5):
                new_pos = SkyCoord(r*u.m, x*u.m, y*u.m, representation_type='cartesian', frame=center_frame)
                n_coord = new_pos.transform_to(GCRS(obstime=time))
                n_itrs = n_coord.transform_to(ITRS(obstime=time))
                n_site = n_itrs.earth_location
                n_site = EarthLocation(n_site.lon, n_site.lat, 0)
                itrs_site = n_site.get_itrs(obstime=time)
                gcrs_site = itrs_site.transform_to(GCRS(obstime=time))
                target1 = gcrs_site.transform_to(center_frame)
                r = target1.cartesian.x.to(u.m).value

            lon[true_idx] = n_site.lon.deg
            lat[true_idx] = n_site.lat.deg

    return lon, lat


def _path_latlon(instants, dtimes, centers, delta, ca, vel, pa, pa_plus, radius=0, interpolate=True):
    '''Private function that provides the latitudes and longitudes for the path.
       Use negative radius value for lower limit, positive radius value to
       produce upper limit, and keep it to zero to produce the main occulation path.
       Used by occultation_path()
    '''
    arc = ( delta.to(u.km) * ca.to(u.rad) ).value * u.km
    
    arc_x = arc * np.sin(pa) + (dtimes * vel)*np.cos(pa_plus)
    arc_y = arc * np.cos(pa) - (dtimes * vel)*np.sin(pa_plus)
    arc_x = arc_x + (radius * u.km) * np.sin(pa_plus)
    arc_y = arc_y + (radius * u.km) * np.cos(pa_plus)

    arc_x = arc_x.to(u.m).value
    arc_y = arc_y.to(u.m).value
    lon, lat = _xy2latlon(arc_x, arc_y, centers.lon.value, centers.lat.value, instants)

    valid_coordinates = (lon < 1e+31)
    lon, lat, times = lon[valid_coordinates], lat[valid_coordinates], dtimes[valid_coordinates] - dtimes[0]
    
            
    if interpolate and (len(lon) > 2) and (len(lat) > 2) :
        try:
            lonbkp = lon.copy()
            differences = np.diff(lon)
            threshold = 300
            factor_index = np.where(abs(differences) > threshold)
            if np.size(factor_index) > 0:
                factor = 1
                if differences[factor_index][0] > 0:
                    if np.size(factor_index) > 1:
                        indexa = np.arange(0, factor_index[0][0]+1, 1)
                        indexb = np.arange(factor_index[0][1]+1, len(lon), 1)
                        index = np.concatenate([indexa, indexb])
                    else:
                        index = np.arange(0, factor_index[0]+1, 1)
                else:
                    if np.size(factor_index) > 1:
                        indexa = np.arange(0, factor_index[0][0]+1, 1)
                        indexb = np.arange(factor_index[0][1]+1, len(lon), 1)
                        index = np.concatenate([indexa, indexb])
                    else:
                        index = np.arange(factor_index[0]+1, len(lon), 1)
            else:
                factor = 0
                index = (0)
            lon[index] += 360*factor

            cs_lat = CubicSpline(times, lat)
            cs_lon = CubicSpline(times, lon)
            t_interp = np.linspace(times.min(), times.max(), 1275)
            lat_interp = cs_lat(t_interp)
            lon_interp = cs_lon(t_interp)
            lon_interp[lon_interp > 180] -= 360
            lon_interp[lon_interp < -180] += 360
            lon[index] -= factor*360

            return [lon_interp, lat_interp]
        except:
            return [lonbkp, lat]
    else:
        return [lon, lat]


def occultation_path(datetime, star_coordinates, closest_approach, 
                     position_angle, velocity, delta_distance, 
                     offset = [0,0], object_radius=None, ring_radius=None, interpolate=True):
    '''
    Returns the occultation paths, and upper and lower limits when object and/or ring radius is provided.
    This code borrows heavily from SORA.
    
    Parameters
    ----------
    datetime : `str`
        Date and time (UTC) of the closest approach iso format ("%Y-%m-%d %H:%M:%S").
    
    star_coordinates : `str`
        Coordinates of the star ("hh mm ss.sss dd mm ss.sss" or "hh.hhhhhhhh dd.dddddddd").
    
    closest_approach : `int`, `float`
        Closest approach (ca) distance, in arcsec.
    
    position_angle : `int`, `float`
        Position angle (pa) at closes approach, in degrees.
        
    velocity : `int`, `float`
        Velocity of the event, in Km/s.
        
    delta_distance : `int`, `float`
        Object's distance at closest approach, in AU.
        
    offset : `list`
        Pair of "delta_RA*cosDEC" and "delta_DEC". Applies an offset to the ephemeris, calculating new closest approach.
    
    object_radius : `int`, `float`
        Radius of the occulting body, in Km. None by default.
    
    ring_radius : `int`, `float`
        Radius of the outermost ring of the occulting body, in Km. None by default.
        
    Returns
    -------
    ordered list : `list`
        [Occultation path, Radius limits (upper and lower) paths, Ring limits (upper and lower) paths]
    '''
    
    # set up variables
    # instant of the closest approach
    instant = Time(datetime)
    # star coordinates
    star = SkyCoord(star_coordinates, frame='icrs', unit=(u.hourangle, u.degree))
    #delta
    delta = delta_distance * u.AU
    # object velocity
    vel = velocity * (u.km / u.s)
    # position angle
    pa = Angle(position_angle * u.deg)
    pa.wrap_at('180d', inplace=True) # force angle between 0 and 180d
    # closest apporach
    off_ra, off_dec = (offset[0] * u.mas, offset[1] * u.mas)
    delta_ca = off_ra*np.sin(pa) + off_dec*np.cos(pa)
    delta_instant = ( -(off_ra*np.cos(pa) - off_dec*np.sin(pa)).to(u.rad) * delta.to(u.km)/abs(vel) ).value*u.s
    # add the offsets to ca and to the time
    ca = closest_approach * u.arcsec + delta_ca
    instant = instant + delta_instant
   
    if pa > 90 * u.deg:
        pa_plus = pa - Angle(180 * u.deg)
    elif pa < Angle(-90 * u.deg):
        pa_plus = pa + Angle(180 * u.deg)
    else:
        pa_plus = Angle(pa)

    # generate the array of instants
    dtimes = np.linspace(0, int(6371 / abs(vel.value)), 32)
    dtimes = np.concatenate([-dtimes[1:][::-1], dtimes])
    dtimes = dtimes * u.s
    instants = dtimes + instant
    
    # create an array of star positions for the GCRS frame
    
    star_ras, star_decs = np.repeat(star.ra, len(instants)), np.repeat(star.dec, len(instants))
    centers_gcrs = GCRS(ra=star_ras, dec=star_decs, distance=1 * u.R_earth, obstime=instants)

    # tranform to internationa terrestrial reference system
    centers_itrs = centers_gcrs.transform_to(ITRS(obstime=instants))
    centers = centers_itrs.earth_location
    
    upper_limit, lower_limit, ring_upper_limit, ring_lower_limit = None, None, None, None

    path = _path_latlon(instants, dtimes, centers, delta, ca, vel, pa, pa_plus, radius=0, interpolate=interpolate)
    
    # occultation limits when the object's radius is given
    if object_radius is not None:
        upper_limit = _path_latlon(instants, dtimes, centers, delta, ca, vel, pa, pa_plus, radius=object_radius)
        lower_limit = _path_latlon(instants, dtimes, centers, delta, ca, vel, pa, pa_plus, radius=-object_radius)
    
    # occultation limits when a radius for a ring is given
    if ring_radius is not None:
        ring_upper_limit = _path_latlon(instants, dtimes, centers, delta, ca, vel, pa, pa_plus, radius=ring_radius)
        ring_lower_limit = _path_latlon(instants, dtimes, centers, delta, ca, vel, pa, pa_plus, radius=-ring_radius)
    
    return [path, [upper_limit, lower_limit], [ring_upper_limit, ring_lower_limit]]


def visibility(latitude, longitude, radius, datetime, star_coordinates, closest_approach, position_angle, 
               velocity, delta_distance, offset=[0,0], object_radius=None, ring_radius=None, ignore_nighttime=False, 
               latitudinal=False, interpolate=True):

    '''Computes the visibility of an occulation given its latitude, longitude and radius around location.
    
    Parameters
    ----------
    latitude: `float`
        The latitude in degrees of the desired location on earth.
    
    longitude: `float`
        The longitude in degress of the desired location on earth.
    
    radius: `float`
        The radius of the circle centered in the desired location in km.
    
    datetime : `str`
        Date and time (UTC) of the closest approach iso format ("%Y-%m-%d %H:%M:%S").
    
    position_angle : `int`, `float`
        Position angle (pa) at closes approach, in degrees.     
    
    star_coordinates : `str`
        Coordinates of the star ("hh mm ss.sss dd mm ss.sss" or "hh.hhhhhhhh dd.dddddddd").
    
    closest_approach : `int`, `float`
        Closest approach (ca) distance, in arcsec.
    
    position_angle : `int`, `float`
        Position angle (pa) at closes approach, in degrees.
        
    velocity : `int`, `float`
        Velocity of the event, in Km/s.
        
    delta_distance : `int`, `float`
        Object's distance at closest approach, in AU.
        
    offset : `list`
        Pair of "delta_RA*cosDEC" and "delta_DEC". Applies an offset to the ephemeris, calculating new closest approach.
    
    object_radius : `int`, `float`
        Radius of the occulting body, in Km. None by default.
    
    ring_radius : `int`, `float`
        Radius of the outermost ring of the occulting body, in Km. None by default.
    
    ignore_nigttime: `bool`
        Ignore occultations happening during daylight time. False, by default.
    
    latitudinal: `bool`
        Include all occultations happening in a certain longitudinal range.
        Useful when the body radius is unknown. False, by default;
    
    iterpolate: `bool`
        Use cubic spline interpolation to augment the object's path resolution.
        
    
    Returns
    -------
    list: `str`
        [Visibility status (bool), occultation information (str)]
    '''
    info = 'Ignoring nighttime; occultation may be happening during daylight. ' if ignore_nighttime else ''

    # define logic arguments
    nighttime = True
    visibility = False
    
    # define the location
    location = EarthLocation.from_geodetic(lat=latitude*u.deg, lon=longitude*u.deg, height=0*u.m)
    radius = radius * u.km
    # check if occultation happens at nighttime
    if not ignore_nighttime:
        instant = Time(datetime)
        sun = get_sun(instant)
        sun_lat = sun.dec
        sun_lon = sun.ra - instant.sidereal_time('mean', 'greenwich')

        sun_theta = np.arccos(np.sin(location.lat)*np.sin(sun_lat) + np.cos(location.lat)*np.cos(sun_lat)*np.cos(abs(location.lon-sun_lon)))
        arc = sun_theta.value * const.R_earth.to_value('km') * u.km
        sunarc = np.pi * const.R_earth.to_value('km') * u.km       
        if ((sunarc+radius) < arc):
            nighttime = False
    
    # get the occultation paths
    path, object_limits, ring_limits = occultation_path(datetime, star_coordinates, closest_approach, 
                                                        position_angle, velocity, delta_distance, 
                                                        offset=offset, object_radius=object_radius, 
                                                        ring_radius=ring_radius, interpolate=interpolate)
    # if there are rings, check if the shaddow limits are within range
    if (ring_limits[0] != None) and (ring_limits[1] != None):
        upper, lower = ring_limits
        upper_location = EarthLocation.from_geodetic(lat=upper[1]*u.deg, lon=upper[0]*u.deg, height=0*u.m)
        lower_location = EarthLocation.from_geodetic(lat=lower[1]*u.deg, lon=lower[0]*u.deg, height=0*u.m)

        upper_theta = np.arccos(np.sin(location.lat)*np.sin(upper_location.lat) + np.cos(location.lat)*np.cos(upper_location.lat)*np.cos(abs(location.lon-upper_location.lon)))
        lower_theta = np.arccos(np.sin(location.lat)*np.sin(lower_location.lat) + np.cos(location.lat)*np.cos(lower_location.lat)*np.cos(abs(location.lon-lower_location.lon)))

        upper_arc = upper_theta.value * const.R_earth.to_value(u.km) * u.km
        lower_arc = lower_theta.value * const.R_earth.to_value(u.km) * u.km
        
        if (upper_arc.min() <= radius) or (lower_arc.min() <= radius):
            visibility = True
            info += "Body's ring(s) shadow pass within selected area. "
        else:
            visibility = False
    # if there is information on the radius of the object, check if the shaddow limits are within range
    elif (object_limits[0] != None) and (object_limits[1] != None):
        upper, lower = object_limits
        upper_location = EarthLocation.from_geodetic(lat=upper[1]*u.deg, lon=upper[0]*u.deg, height=0*u.m)
        lower_location = EarthLocation.from_geodetic(lat=lower[1]*u.deg, lon=lower[0]*u.deg, height=0*u.m)

        upper_theta = np.arccos(np.sin(location.lat)*np.sin(upper_location.lat) + np.cos(location.lat)*np.cos(upper_location.lat)*np.cos(abs(location.lon-upper_location.lon)))
        lower_theta = np.arccos(np.sin(location.lat)*np.sin(lower_location.lat) + np.cos(location.lat)*np.cos(lower_location.lat)*np.cos(abs(location.lon-lower_location.lon)))

        upper_arc = upper_theta.value * const.R_earth.to_value(u.km) * u.km
        lower_arc = lower_theta.value * const.R_earth.to_value(u.km) * u.km
        
        if (upper_arc.min() <= radius) or (lower_arc.min() <= radius):
            visibility = True
            info += 'Main body shadow passes within selected area. '
        else:
            visibility = False
        
    # if none of the above exist check if the central path is whithin range    
    # if latitudinal is true, it means that it will get paths thas crosses all latitudes within the longitude range (can be useful for scenarios for unknown object size)
    else:
        path_location = EarthLocation.from_geodetic(lat=path[1]*u.deg, lon=path[0]*u.deg, height=0*u.m)
                
        if latitudinal:
            path_distances = abs(path_location.lon - location.lon).to_value(u.rad) * const.R_earth.to_value('km') * u.km        
            if len(path_distances) > 0 and any(path_distances <= radius):
                visibility = True  
                info += 'All latitudes are being considered due to unknown object radius.'
            else:
                visibility = False
                
        else:
            path_theta = np.arccos(np.sin(location.lat)*np.sin(path_location.lat) + np.cos(location.lat)*np.cos(path_location.lat)*np.cos(abs(location.lon-path_location.lon)))
            path_arc = path_theta.value * const.R_earth.to_value(u.km) * u.km
            if len(path_arc) > 0 and (path_arc.min() <= radius):
                visibility = True
            else:
                visibility = False
            
        
    return np.logical_and(nighttime, visibility), info
