# occviz.py
# Author: Rodrigo Boufleur July 2023
# Updated at: October 2023 (Rodrigo Boufleur)
# Last update: August 2024 (Rodrigo Boufleur): breaking changes

# The _xy2latlon function is based on the function xy2latlon from the SORA v0.3.1 lib

import json
from datetime import datetime, timezone
from typing import Optional, Union

import astropy.constants as const
import astropy.units as u
import numpy as np
from astropy.coordinates import (
    GCRS,
    ITRS,
    Angle,
    EarthLocation,
    SkyCoord,
    SkyOffsetFrame,
    get_sun,
)
from astropy.time import Time
from scipy.interpolate import CubicSpline


def _calculate_r2(x, y):
    """
    Calculate r2 based on the given x and y values.

    Parameters
    ----------
    x : numpy.ndarray
        Projected position in x.
    y : numpy.ndarray
        Projected position in y.

    Returns
    -------
    numpy.ndarray
        Calculated r2 values.
    """
    r2 = const.R_earth.to_value(u.m) ** 2 - (x**2 + y**2)
    return r2


def _get_valid_indices(r2):
    """
    Get valid indices where r2 is greater than or equal to 0.0.

    Parameters
    ----------
    r2 : numpy.ndarray
        Array of r2 values.

    Returns
    -------
    numpy.ndarray
        Valid indices where r2 >= 0.0.
    """
    return np.where(r2 >= 0.0)[0]


def _transform_coordinates(r, x, y, time, loncen, latcen, true_idx, r2):
    """
    Transform coordinates to get longitude and latitude.

    Parameters
    ----------
    r : numpy.ndarray
        Array of r values.
    x : numpy.ndarray
        Projected position in x.
    y : numpy.ndarray
        Projected position in y.
    time : astropy.time.Time
        Time of referred projection.
    loncen : int, float
        Center longitude of projection, in degrees.
    latcen : int, float
        Center latitude of projection, in degrees.
    true_idx : numpy.ndarray
        Valid indices where r2 >= 0.0.

    Returns
    -------
    tuple
        Longitude and latitude values.
    """
    if (not time.isscalar) and (len(time) == len(r2)):
        time, loncen, latcen = time[true_idx], loncen[true_idx], latcen[true_idx]
        site_cen = EarthLocation(loncen * u.deg, latcen * u.deg)
        itrs_cen = site_cen.get_itrs(obstime=time)
        gcrs_cen = itrs_cen.transform_to(GCRS(obstime=time))
        center_frame = SkyOffsetFrame(origin=gcrs_cen)

        for n in range(5):
            new_pos = SkyCoord(
                r * u.m,
                x * u.m,
                y * u.m,
                representation_type="cartesian",
                frame=center_frame,
            )
            n_coord = new_pos.transform_to(GCRS(obstime=time))
            n_itrs = n_coord.transform_to(ITRS(obstime=time))
            n_site = n_itrs.earth_location
            n_site = EarthLocation(n_site.lon, n_site.lat, 0)
            itrs_site = n_site.get_itrs(obstime=time)
            gcrs_site = itrs_site.transform_to(GCRS(obstime=time))
            target1 = gcrs_site.transform_to(center_frame)
            r = target1.cartesian.x.to(u.m).value

        return n_site.lon.deg, n_site.lat.deg
    else:
        return None, None


def _xy2latlon(x, y, loncen, latcen, time):
    """
    Calculate the longitude and latitude given projected positions x and y.

    Parameters
    ----------
    x : int, float
        Projected position in x, in the GCRS, in meters.
    y : int, float
        Projected position in y, in the GCRS, in meters.
    loncen : int, float
        Center longitude of projection, in degrees.
    latcen : int, float
        Center latitude of projection, in degrees.
    time : astropy.time.Time
        Time of referred projection.

    Returns
    -------
    tuple
        Longitude and latitude values.
    """
    x = np.array(x)
    y = np.array(y)
    r2 = _calculate_r2(x, y)

    true_idx = _get_valid_indices(r2)
    r, x, y = np.sqrt(r2[true_idx]), x[true_idx], y[true_idx]
    lon, lat = np.full(len(r2), 1e31), np.full(len(r2), 1e31)

    if len(r) > 0:
        lon[true_idx], lat[true_idx] = _transform_coordinates(
            r, x, y, time, loncen, latcen, true_idx, r2
        )
    return lon, lat


def _calculate_arc_coordinates(delta, ca, pa, dtimes, vel, pa_plus, radius):
    """
    Calculate the x and y coordinates of an arc based on the given parameters.

    Parameters
    ----------
    delta : Quantity
        The angular separation between two points on the sky.
    ca : Quantity
        The chord length between the two points.
    pa : Quantity
        The position angle of the chord.
    dtimes : array-like
        The time intervals.
    vel : Quantity
        The velocity of the object.
    pa_plus : Quantity
        The position angle plus 90 degrees.
    radius : Quantity
        The radius of the object.

    Returns
    -------
    tuple
        The x and y coordinates of the arc in meters.
    """
    arc = (delta.to(u.km) * ca.to(u.rad)).value * u.km
    arc_x = arc * np.sin(pa) + (dtimes * vel) * np.cos(pa_plus)
    arc_y = arc * np.cos(pa) - (dtimes * vel) * np.sin(pa_plus)
    arc_x = arc_x + (radius * u.km) * np.sin(pa_plus)
    arc_y = arc_y + (radius * u.km) * np.cos(pa_plus)

    return arc_x.to(u.m).value, arc_y.to(u.m).value


def _handle_longitude_discontinuities(lon):
    """
    Adjust longitude values to remove abrupt discontinuities.

    Parameters
    ----------
    lon : numpy.ndarray
        Array of longitude values.

    Returns
    -------
    numpy.ndarray
        Adjusted longitude values.
    """
    lon_adjusted = lon.copy()
    for i in range(1, len(lon_adjusted)):
        delta = lon_adjusted[i] - lon_adjusted[i - 1]
        if delta > 180:
            lon_adjusted[i:] -= 360
        elif delta < -180:
            lon_adjusted[i:] += 360
    return lon_adjusted


def _interpolate_coordinates(lon, lat, times):
    """
    Interpolate longitude and latitude values.

    Parameters
    ----------
    lon : numpy.ndarray
        Longitude values.
    lat : numpy.ndarray
        Latitude values.
    times : numpy.ndarray
        Time values.

    Returns
    -------
    tuple
        Interpolated longitude and latitude values.
    """
    cs_lat = CubicSpline(times, lat)
    cs_lon = CubicSpline(times, lon)
    t_interp = np.linspace(times.min(), times.max(), 1275)
    lat_interp = cs_lat(t_interp)
    lon_interp = cs_lon(t_interp)
    lon_interp[lon_interp > 180] -= 360
    lon_interp[lon_interp < -180] += 360

    return lon_interp, lat_interp


def _path_latlon(
    instants, dtimes, centers, delta, ca, vel, pa, pa_plus, radius=0, interpolate=True
):
    """
    Calculate latitudes and longitudes for the occultation path.

    Parameters
    ----------
    instants : list
        List of time instances for the path.
    dtimes : list
        List of time intervals.
    centers : SkyCoord
        SkyCoord object representing the center coordinates of the projection.
    delta : Quantity
        Angular separation between two points on the sky.
    ca : Quantity
        Chord length between the two points.
    vel : Quantity
        Velocity of the object.
    pa : Quantity
        Position angle of the chord.
    pa_plus : Quantity
        Position angle plus 90 degrees.
    radius : Quantity, optional
        Radius of the object (default is 0).
    interpolate : bool, optional
        Flag indicating whether to interpolate the coordinates (default is True).

    Returns
    -------
    tuple
        Longitude and latitude values for the path.
    """
    arc_x, arc_y = _calculate_arc_coordinates(
        delta, ca, pa, dtimes, vel, pa_plus, radius
    )

    lon, lat = _xy2latlon(arc_x, arc_y, centers.lon.value, centers.lat.value, instants)

    valid_coordinates = lon < 1e31
    lon, lat, times = (
        lon[valid_coordinates],
        lat[valid_coordinates],
        dtimes[valid_coordinates] - dtimes[0],
    )
    if interpolate and (len(lon) > 2) and (len(lat) > 2):
        lonbkp = lon.copy()
        try:
            lon = _handle_longitude_discontinuities(lon)
            return _interpolate_coordinates(lon, lat, times)
        except:
            return [lonbkp, lat]
    else:
        return [lon, lat]


def _setup_initial_variables(
    date_time,
    star_coordinates,
    delta_distance,
    velocity,
    position_angle,
    closest_approach,
    offset,
):
    """
    Set up initial variables for the occultation path calculation.

    Parameters
    ----------
    date_time : str
        The date and time of the observation in the format 'YYYY-MM-DDTHH:MM:SS'.
    star_coordinates : tuple
        The coordinates of the star in the format (RA, Dec) where RA is in hours and Dec is in degrees.
    delta_distance : float
        The distance of the object from the observer in astronomical units (AU).
    velocity : float
        The velocity of the object relative to the observer in kilometers per second (km/s).
    position_angle : float
        The position angle of the object relative to the observer in degrees.
    closest_approach : float
        The closest approach of the object to the observer in arcseconds.
    offset : list
        The offset of the observer from the center of the object in milliarcseconds (mas).

    Returns
    -------
    tuple
        Initial variables for the occultation path calculation.
    """
    instant = Time(date_time)
    star = SkyCoord(star_coordinates, frame="icrs", unit=(u.hourangle, u.degree))
    delta = delta_distance * u.AU
    vel = velocity * (u.km / u.s)
    pa = Angle(position_angle * u.deg)
    pa.wrap_at("180d", inplace=True)
    off_ra, off_dec = (offset[0] * u.mas, offset[1] * u.mas)
    delta_ca = off_ra * np.sin(pa) + off_dec * np.cos(pa)
    delta_instant = (
        -(off_ra * np.cos(pa) - off_dec * np.sin(pa)).to(u.rad)
        * delta.to(u.km)
        / abs(vel)
    ).value * u.s
    ca = closest_approach * u.arcsec + delta_ca
    instant = instant + delta_instant

    return instant, star, delta, vel, pa, ca


def _calculate_position_angle(pa):
    """
    Calculate the position angle.

    Parameters
    ----------
    pa : Angle
        Initial position angle.

    Returns
    -------
    Angle
        Adjusted position angle.
    """
    if pa > 90 * u.deg:
        return pa - Angle(180 * u.deg)
    elif pa < Angle(-90 * u.deg):
        return pa + Angle(180 * u.deg)
    else:
        return Angle(pa)


def _generate_instants_array(vel):
    """
    Generate the array of instants.

    Parameters
    ----------
    vel : Quantity
        Object velocity.

    Returns
    -------
    numpy.ndarray
        Array of instants.
    """
    dtimes = np.linspace(0, int(6371 / abs(vel.value)), 100)
    dtimes = np.concatenate([-dtimes[1:][::-1], dtimes])
    dtimes = dtimes * u.s
    return dtimes


def _create_star_positions_array(star, instants):
    """
    Create an array of star positions for the GCRS frame.

    Parameters
    ----------
    star : SkyCoord
        Star coordinates.
    instants : numpy.ndarray
        Array of instants.

    Returns
    -------
    EarthLocation
        Star positions in the ITRS frame.
    """
    star_ras, star_decs = np.repeat(star.ra, len(instants)), np.repeat(
        star.dec, len(instants)
    )
    centers_gcrs = GCRS(
        ra=star_ras, dec=star_decs, distance=1 * u.R_earth, obstime=instants
    )
    centers_itrs = centers_gcrs.transform_to(ITRS(obstime=instants))
    return centers_itrs.earth_location


def _latlon_circle(latitude_c, longitude_c, radius, angle):
    """
    Calculate new latitude and longitude coordinates given a center point, radius, and angle.

    Parameters
    ----------
    latitude_c : float
        Latitude of the center point in degrees.
    longitude_c : float
        Longitude of the center point in degrees.
    radius : float
        Radius of the circle in kilometers.
    angle : float
        Angle in radians.

    Returns
    -------
    tuple
        New latitude and longitude coordinates in degrees.
    """
    # Calculate the angular variations
    delta_phi = radius / 6371.0  # Assuming the mean Earth radius of 6371 km
    delta_lambda = delta_phi / np.cos(np.radians(latitude_c))

    # Calculate the new coordinates
    new_latitude = np.degrees(
        np.arcsin(
            np.sin(np.radians(latitude_c)) * np.cos(delta_phi)
            + np.cos(np.radians(latitude_c)) * np.sin(delta_phi) * np.cos(angle)
        )
    )
    new_longitude = longitude_c + np.degrees(delta_lambda * np.sin(angle))

    return new_latitude, new_longitude


def _check_nighttime(location, instant):
    """
    Check if the occultation happens at nighttime.

    Parameters
    ----------
    location : EarthLocation
        The geographic location of the observer.
    instant : Time
        The time at which the occultation event occurs.

    Returns
    -------
    bool
        True if the occultation event occurs during nighttime, False otherwise.
    """
    try:
        sun = get_sun(instant)
        sun_lat = sun.dec
        sun_lon = sun.ra - instant.sidereal_time("mean", "greenwich")
        sun_theta = np.arccos(
            np.sin(location.lat) * np.sin(sun_lat)
            + np.cos(location.lat)
            * np.cos(sun_lat)
            * np.cos(abs(location.lon - sun_lon))
        )
        return any(
            sun_theta.to_value("deg") > 89.47
        )  # 90 deg from sun dist - 0.53 deg from sun apparent size
    except:
        return True


def _path_arc(location, path_location):
    """
    Calculate the linear distance between two locations on the Earth's surface.

    Parameters
    ----------
    location : EarthLocation
        Observer's location on Earth's surface.
    path_location : EarthLocation
        Location of a point on the Earth's surface.

    Returns
    -------
    Quantity
        Linear distance between the observer's location and the point on the Earth's surface, in kilometers.
    """
    path_theta = np.arccos(
        np.sin(location.lat) * np.sin(path_location.lat)
        + np.cos(location.lat)
        * np.cos(path_location.lat)
        * np.cos(abs(location.lon - path_location.lon))
    )
    return path_theta.value * const.R_earth.to_value(u.km) * u.km


def _calculate_path_visibility(location, path, radius, latitudinal=False):
    """
    Calculate if the central path is within range.

    Parameters
    ----------
    location : EarthLocation
        The observer's location on Earth's surface.
    path : list
        Longitude and latitude of the path.
    radius : Quantity
        Radius of visibility around the observer's location.
    latitudinal : bool, optional
        If True, calculate the distance between the observer's longitude and the path's longitude.
        If any of the distances are greater than the radius, return True.
        If False, check if there is an additional path (e.g., ring or body limits).
    additional_path : list, optional
        Longitude and latitude of an additional path.
    ext_radius : int, optional
        Radius of the additional path.

    Returns
    -------
    bool
        True if the path is visible, False otherwise.
    """
    path_location = EarthLocation.from_geodetic(
        lat=path[1] * u.deg, lon=path[0] * u.deg, height=0 * u.m
    )

    if latitudinal:
        path_distances = (
            abs(path_location.lon - location.lon).to_value(u.rad)
            * const.R_earth.to_value("km")
            * u.km
        )
        return len(path_distances) > 0 and any(path_distances > radius)
    else:
        path_arc = _path_arc(location, path_location)
        return len(path_arc) > 0 and (path_arc.min() <= radius)


def _polynomial_fit(x, y, degree):
    """
    Perform a polynomial fit on a set of data points.

    Parameters
    ----------
    x : list
        X-coordinates of the data points.
    y : list
        Y-coordinates of the data points.
    degree : int
        Degree of the polynomial fit.

    Returns
    -------
    numpy.ndarray
        Coefficients of the polynomial fit.
    """
    return np.polyfit(x, y, degree)


def _path_latlon_coeff(
    instants,
    central_instant,
    dtimes,
    centers,
    delta,
    ca,
    vel,
    pa,
    pa_plus,
    radius=0,
    degree=19,
):
    """
    Calculate latitude and longitude coefficients for a given path based on a polynomial fit.

    Parameters
    ----------
    instants : list
        List of time instances for the path.
    central_instant : Time
        Instant of the closest approach.
    dtimes : list
        List of time intervals.
    centers : SkyCoord
        SkyCoord object representing the center coordinates.
    delta : Quantity
        Angular separation between two points on the sky.
    ca : Quantity
        Chord length between the two points.
    vel : Quantity
        Velocity of the object.
    pa : Quantity
        Position angle of the chord.
    pa_plus : Quantity
        Position angle plus 90 degrees.
    radius : Quantity, optional
        Radius of the object (default is 0).
    degree : int, optional
        Degree of the polynomial fit (default is 19).

    Returns
    -------
    tuple
        Tuple containing the longitude and latitude coefficients, as well as the maximum and minimum longitude values.
    """
    arc_x, arc_y = _calculate_arc_coordinates(
        delta, ca, pa, dtimes, vel, pa_plus, radius
    )

    lon, lat = _xy2latlon(arc_x, arc_y, centers.lon.value, centers.lat.value, instants)

    valid_coordinates = lon < 1e31
    lon, lat, times = (
        lon[valid_coordinates],
        lat[valid_coordinates],
        dtimes[valid_coordinates],
    )
    if (len(lon) > degree + 1) and (len(lat) > degree + 1):
        try:
            location = EarthLocation.from_geodetic(
                lat=lat * u.deg, lon=lon * u.deg, height=0 * u.m
            )
            nighttime = _check_nighttime(location, central_instant)
            lon = _handle_longitude_discontinuities(lon)
            lon_coeff = _polynomial_fit(times, lon, degree)
            lat_coeff = _polynomial_fit(times, lat, degree)
            return (
                lon_coeff.tolist(),
                lat_coeff.tolist(),
                lon.max(),
                lon.min(),
                lat.max(),
                lat.min(),
                nighttime,
            )
        except:
            return [], [], None, None, None, None, False
    else:
        return [], [], None, None, None, None, False


def _build_path_from_coeff(
    lon_coeff, lat_coeff, t0, t1, n_elements, min_lat, max_lat, min_lon, max_lon
):
    """
    Calculate the longitude and latitude values for each element in the given time range using the provided coefficients.

    Parameters
    ----------
    lon_coeff : list
        Coefficients for longitude calculation.
    lat_coeff : list
        Coefficients for latitude calculation.
    t0 : Time
        Start time.
    t1 : Time
        End time.
    n_elements : int
        Number of elements to calculate within the time range.
    min_lat : float
        Minimum latitude for the path.
    max_lat : float
        Maximum latitude for the path.
    min_lon : float
        Minimum longitude for the path.
    max_lon : float
        Maximum longitude for the path.

    Returns
    -------
    tuple
        Arrays of longitude and latitude values.
    """
    if isinstance(lon_coeff, list) == False or isinstance(lat_coeff, list) == False:
        return None

    try:
        t0 = Time(
            datetime.fromisoformat(t0).replace(tzinfo=None),
            format="datetime",
            scale="utc",
        )
        t1 = Time(
            datetime.fromisoformat(t1).replace(tzinfo=None),
            format="datetime",
            scale="utc",
        )
        # times = np.linspace(0, (t1 - t0).value * 86400, n_elements)
        deltaT = (t1 - t0).value * 86400
        times = np.linspace(-deltaT, deltaT, n_elements)
        latitude = np.polyval(lat_coeff, times)
        longitude = np.polyval(lon_coeff, times)

        # remove overflows
        idx = (
            (longitude >= min_lon)
            & (longitude <= max_lon)
            & (latitude >= min_lat)
            & (latitude <= max_lat)
        )
        latitude, longitude = latitude[idx], longitude[idx]
        return longitude, latitude
    except Exception as e:
        print(e)
        return None


def occultation_path(
    date_time,
    star_coordinates,
    closest_approach,
    position_angle,
    velocity,
    delta_distance,
    offset=[0, 0],
    object_diameter=None,
    object_diameter_error=None,
    closest_approach_error=None,
    interpolate=True,
):
    """
    Returns the occultation paths, and upper and lower limits when object and/or ring radius is provided.

    Parameters
    ----------
    date_time : str
        Date and time of the observation in the format 'YYYY-MM-DDTHH:MM:SS'.
    star_coordinates : tuple
        Coordinates of the star in the format (RA, Dec) where RA is in hours and Dec is in degrees.
    closest_approach : float
        Closest approach of the object to the observer in arcseconds.
    position_angle : float
        Position angle of the object relative to the observer in degrees.
    velocity : float
        Velocity of the object relative to the observer in kilometers per second.
    delta_distance : float
        Distance of the object from the observer in astronomical units (AU).
    offset : list, optional
        Offset of the observer from the center of the object in milliarcseconds (mas).
    object_diameter : float, optional
        Radius of the object in kilometers. Default is None.
    object_diameter_error : float, optional
        Error in the object's diameter. Default is None.
    closest_approach_error : float, optional
        Error in the closest approach. Default is None.
    interpolate : bool, optional
        Boolean flag indicating whether to interpolate the coordinates. Default is True.

    Returns
    -------
    dict
        Occultation path coordinates and upper/lower limits for the path.
    """
    instant, star, delta, vel, pa, ca = _setup_initial_variables(
        date_time,
        star_coordinates,
        delta_distance,
        velocity,
        position_angle,
        closest_approach,
        offset,
    )
    pa_plus = _calculate_position_angle(pa)
    dtimes = _generate_instants_array(vel)
    centers = _create_star_positions_array(star, instant + dtimes)
    instants = dtimes + instant

    object_radius = float(object_diameter / 2) if object_diameter is not None else 0
    object_radius_error = (
        float(object_diameter_error / 2) if object_diameter_error is not None else 0
    )
    closest_approach_error = (
        float(closest_approach_error) if closest_approach_error is not None else 0
    )
    error_dist_from_center = (
        object_radius + object_radius_error + closest_approach_error
    )

    output = {
        # "central_instant_latitude": [],
        # "central_instant_longitude": [],
        "central_path_latitude": [],
        "central_path_longitude": [],
        "body_upper_limit_latitude": [],
        "body_upper_limit_longitude": [],
        "body_lower_limit_latitude": [],
        "body_lower_limit_longitude": [],
        "uncertainty_upper_limit_latitude": [],
        "uncertainty_upper_limit_longitude": [],
        "uncertainty_lower_limit_latitude": [],
        "uncertainty_lower_limit_longitude": [],
    }

    # # the central position
    # central_pos = _create_star_positions_array(star, instant)
    # instant_path = _path_latlon(
    #     np.array(instant),
    #     dtimes = np.zeros(1),
    #     central_pos,
    #     delta,
    #     ca,
    #     vel,
    #     pa,
    #     pa_plus,
    #     radius=0,
    #     interpolate=False,
    # )
    # output["central_instant_latitude"] = instant_path[1]
    # output["central_instant_longitude"] = instant_path[0]

    # the central path
    central_path = _path_latlon(
        instants,
        dtimes,
        centers,
        delta,
        ca,
        vel,
        pa,
        pa_plus,
        radius=0,
        interpolate=interpolate,
    )
    output["central_path_longitude"] = central_path[0]
    output["central_path_latitude"] = central_path[1]

    # the upper and lower limits for the object radius
    if object_radius > 0:
        body_upper_limit = _path_latlon(
            instants,
            dtimes,
            centers,
            delta,
            ca,
            vel,
            pa,
            pa_plus,
            radius=object_radius,
            interpolate=interpolate,
        )
        output["body_upper_limit_latitude"]: body_upper_limit[1]
        output["body_upper_limit_longitude"]: body_upper_limit[0]

        body_lower_limit = _path_latlon(
            instants,
            dtimes,
            centers,
            delta,
            ca,
            vel,
            pa,
            pa_plus,
            radius=-object_radius,
            interpolate=interpolate,
        )
        output["body_lower_limit_latitude"]: body_lower_limit[1]
        output["body_lower_limit_longitude"]: body_lower_limit[0]

    # the upper and lower limits for the object radius
    if error_dist_from_center > 0:
        error_upper_limit = _path_latlon(
            instants,
            dtimes,
            centers,
            delta,
            ca,
            vel,
            pa,
            pa_plus,
            radius=error_dist_from_center,
            interpolate=interpolate,
        )
        output["uncertainty_upper_limit_latitude"] = error_upper_limit[1]
        output["uncertainty_upper_limit_longitude"] = error_upper_limit[0]

        error_lower_limit = _path_latlon(
            instants,
            dtimes,
            centers,
            delta,
            ca,
            vel,
            pa,
            pa_plus,
            radius=-error_dist_from_center,
            interpolate=interpolate,
        )
        output["uncertainty_lower_limit_latitude"] = error_lower_limit[1]
        output["uncertainty_lower_limit_longitude"] = error_lower_limit[0]

    return output


def occultation_path_coeff(
    date_time: Union[datetime, str],
    ra_star_candidate: str,
    dec_star_candidate: str,
    closest_approach: float,
    position_angle: float,
    velocity: float,
    delta_distance: float,
    offset_ra: float,
    offset_dec: float,
    closest_approach_error: Optional[float] = None,
    object_diameter: Optional[float] = None,
    object_diameter_error: Optional[float] = None,
    degree: float = 19,
):
    """
    Calculate the coefficients for the occultation path based on the provided parameters.

    Parameters
    ----------
    date_time : Union[datetime, str]
        Date and time of the observation in the format 'YYYY-MM-DDTHH:MM:SS'.
    ra_star_candidate : str
        Right ascension of the star candidate in the format 'HH:MM:SS'.
    dec_star_candidate : str
        Declination of the star candidate in the format 'DD:MM:SS'.
    closest_approach : float
        Closest approach of the object to the observer in arcseconds.
    position_angle : float
        Position angle of the object relative to the observer in degrees.
    velocity : float
        Velocity of the object relative to the observer in kilometers per second (km/s).
    delta_distance : float
        Distance of the object from the observer in astronomical units (AU).
    offset_ra : float
        Offset of the observer from the center of the object in right ascension in milliarcseconds (mas).
    offset_dec : float
        Offset of the observer from the center of the object in declination in milliarcseconds (mas).
    closest_approach_error : Optional[float], optional
        Error in the closest approach. Default is None.
    object_diameter : Optional[float], optional
        Diameter of the object in kilometers. Default is None.
    object_diameter_error : Optional[float], optional
        Error in the object's diameter. Default is None.
    degree : float, optional
        Degree of the polynomial fit. Default is 19.

    Returns
    -------
    dict
        Dictionary containing the calculated coefficients and other relevant information.
    """
    if isinstance(date_time, str):
        date_time = datetime.fromisoformat(date_time)
    date_time = date_time.isoformat().replace("+00:00", "Z")

    star_coordinates = f"{ra_star_candidate} {dec_star_candidate}"
    offset = (offset_ra, offset_dec)

    object_radius = float(object_diameter / 2) if object_diameter is not None else 0
    object_radius_error = (
        float(object_diameter_error / 2) if object_diameter_error is not None else 0
    )
    closest_approach_error = (
        float(closest_approach_error) if closest_approach_error is not None else 0
    )
    total_radius = object_radius + object_radius_error + closest_approach_error

    instant, star, delta, vel, pa, ca = _setup_initial_variables(
        date_time,
        star_coordinates,
        delta_distance,
        velocity,
        position_angle,
        closest_approach,
        offset,
    )

    pa_plus = _calculate_position_angle(pa)
    dtimes = _generate_instants_array(vel)
    centers = _create_star_positions_array(star, instant + dtimes)
    instants = dtimes + instant
    (
        upper_limit,
        lower_limit,
    ) = (
        None,
        None,
    )

    lons, lats, nightside = [], [], []

    output = {
        "t0": None,
        "t1": None,
        "coeff_latitude": [],
        "coeff_longitude": [],
        "body_upper_coeff_latitude": [],
        "body_upper_coeff_longitude": [],
        "body_lower_coeff_latitude": [],
        "body_lower_coeff_longitude": [],
        "min_longitude": None,
        "max_longitude": None,
        "min_latitude": None,
        "max_latitude": None,
        "nightside": False,
    }

    output.update(
        {
            "t0": instants[0].datetime.astimezone(tz=timezone.utc).isoformat(),
            "t1": instants[-1].datetime.astimezone(tz=timezone.utc).isoformat(),
        }
    )

    # coefficients for the main path
    result = _path_latlon_coeff(
        instants,
        instant,
        dtimes,
        centers,
        delta,
        ca,
        vel,
        pa,
        pa_plus,
        radius=0,
        degree=degree,
    )

    output.update({"coeff_latitude": result[1], "coeff_longitude": result[0]})
    lons.append([result[2], result[3]])
    lats.append([result[4], result[5]])
    nightside.append([result[6]])

    # coefficients for the upper and lower limits
    if total_radius > 0:
        upper_limit = _path_latlon_coeff(
            instants,
            instant,
            dtimes,
            centers,
            delta,
            ca,
            vel,
            pa,
            pa_plus,
            radius=total_radius,
            degree=degree,
        )
        output.update(
            {
                "body_upper_coeff_latitude": upper_limit[1],
                "body_upper_coeff_longitude": upper_limit[0],
            }
        )
        lower_limit = _path_latlon_coeff(
            instants,
            instant,
            dtimes,
            centers,
            delta,
            ca,
            vel,
            pa,
            pa_plus,
            radius=-total_radius,
            degree=degree,
        )
        output.update(
            {
                "body_lower_coeff_latitude": lower_limit[1],
                "body_lower_coeff_longitude": lower_limit[0],
            }
        )
        lons.append([upper_limit[2], upper_limit[3], lower_limit[2], lower_limit[3]])
        lats.append([upper_limit[4], upper_limit[5], lower_limit[4], lower_limit[5]])
        nightside.append([upper_limit[6], lower_limit[6]])

    longitudes = np.array(
        [
            item
            for sublist in lons
            if sublist is not None
            for item in sublist
            if item is not None
        ]
    )
    index = np.where(longitudes > 180)
    longitudes[index] -= 360

    latitudes = np.array(
        [
            item
            for sublist in lats
            if sublist is not None
            for item in sublist
            if item is not None
        ]
    )

    try:
        output.update(
            {
                "min_longitude": longitudes.min(),
                "max_longitude": longitudes.max(),
                "min_latitude": latitudes.min(),
                "max_latitude": latitudes.max(),
            }
        )
    except:
        output.update(
            {
                "min_longitude": None,
                "max_longitude": None,
                "min_latitude": None,
                "max_latitude": None,
            }
        )

    nightsides = np.array(
        [
            item
            for sublist in nightside
            if sublist is not None
            for item in sublist
            if item is not None
        ]
    )

    output.update({"nightside": any(nightsides)})

    return output


def _find_closest_index(array1, array2):
    # Calculate the absolute differences between each element of array1 and all elements of array2
    diff_matrix = np.abs(array1[:, np.newaxis] - array2)

    # Find the minimum difference for each element in array1
    min_diff = np.min(diff_matrix, axis=1)

    # Find the index of the element in array1 with the smallest minimum difference
    closest_index = np.argmin(min_diff)

    return closest_index


def visibility_from_coeff(
    latitude: float,
    longitude: float,
    radius: float,
    date_time: Union[datetime, str],
    inputdict: Union[dict, str],
    n_elements: int = 1500,
    latitudinal: bool = False,
):
    """
    Compute the visibility of an occultation event given its latitude, longitude, and radius around a specific location.

    Parameters
    ----------
    latitude : float
        Latitude of the observer's location in degrees.
    longitude : float
        Longitude of the observer's location in degrees.
    radius : float
        Radius around the observer's location in kilometers.
    date_time : str
        Date and time of the occultation event in the format 'YYYY-MM-DD HH:MM:SS'.
    inputdict : dict
        Dictionary containing the coefficients and time range for the central path, body limits, and ring limits.
    n_elements : int, optional
        Number of elements to calculate within the time range. Defaults to 500.
    latitudinal : bool, optional
        Flag indicating whether to calculate the distance between the observer's longitude and the path's longitude. Defaults to False.

    Returns
    -------
    bool
        True if the occultation event is visible, False otherwise.
    """
    if not inputdict:
        return False

    if isinstance(date_time, str):
        date_time = datetime.fromisoformat(date_time)
    date_time = date_time.isoformat().replace("+00:00", "Z")

    if isinstance(inputdict, str):
        inputdict = json.loads(inputdict)

    latitudes, longitudes = _latlon_circle(
        latitude, longitude, radius, np.arange(0, 360, 0.1)
    )

    location_c = EarthLocation.from_geodetic(
        lat=latitudes * u.deg, lon=longitudes * u.deg, height=0 * u.m
    )

    location = EarthLocation.from_geodetic(
        lat=latitude * u.deg, lon=longitude * u.deg, height=0 * u.m
    )

    radius = radius * u.km

    body_upper_visibility = False
    body_lower_visibility = False
    path_visibility = False

    # if upperlimit coeff is provided check the path and if overlap return true
    if (
        inputdict["body_upper_coeff_longitude"]
        and inputdict["body_upper_coeff_latitude"]
    ):
        object_upper_limit = _build_path_from_coeff(
            inputdict["body_upper_coeff_longitude"],
            inputdict["body_upper_coeff_latitude"],
            inputdict["t0"],
            inputdict["t1"],
            n_elements,
            inputdict["min_latitude"],
            inputdict["max_latitude"],
            inputdict["min_longitude"],
            inputdict["max_longitude"],
        )

        object_upper_limit = np.array(object_upper_limit)
        if np.any(object_upper_limit[0] < -180):
            object_upper_limit[0] += 360
            idx = np.where(object_upper_limit[0] > 180)
            object_upper_limit[0][idx] -= 360

        if np.any(object_upper_limit[0] > 180):
            object_upper_limit[0] -= 360
            idx = np.where(object_upper_limit[0] < -180)
            object_upper_limit[0][idx] += 360

        object_upper_limit = tuple(object_upper_limit)

        body_upper_visibility = _calculate_path_visibility(
            location, object_upper_limit, radius, latitudinal=latitudinal
        )
        if body_upper_visibility:
            return True

    # if lowerlimit coeff is provided check the path and if overlap return true
    if (
        inputdict["body_lower_coeff_longitude"]
        and inputdict["body_lower_coeff_latitude"]
    ):
        object_lower_limit = _build_path_from_coeff(
            inputdict["body_lower_coeff_longitude"],
            inputdict["body_lower_coeff_latitude"],
            inputdict["t0"],
            inputdict["t1"],
            n_elements,
            inputdict["min_latitude"],
            inputdict["max_latitude"],
            inputdict["min_longitude"],
            inputdict["max_longitude"],
        )

        object_lower_limit = np.array(object_lower_limit)
        if np.any(object_lower_limit[0] < -180):
            object_lower_limit[0] += 360
            idx = np.where(object_lower_limit[0] > 180)
            object_lower_limit[0][idx] -= 360

        if np.any(object_lower_limit[0] > 180):
            object_lower_limit[0] -= 360
            idx = np.where(object_lower_limit[0] < -180)
            object_lower_limit[0][idx] += 360

        object_lower_limit = tuple(object_lower_limit)

        body_lower_visibility = _calculate_path_visibility(
            location, object_lower_limit, radius, latitudinal=latitudinal
        )
        if body_lower_visibility:
            return True

    # check the vibility in between error or body size lines:
    if (
        inputdict["body_upper_coeff_longitude"]
        and inputdict["body_upper_coeff_latitude"]
        and inputdict["body_lower_coeff_longitude"]
        and inputdict["body_lower_coeff_latitude"]
    ):

        lat_max = max(latitudes)
        idx = np.argmin(abs(object_upper_limit[0] - longitude))
        upper_lat = object_upper_limit[1][idx]
        uplim = upper_lat > lat_max

        lat_min = min(latitudes)
        idx = np.argmin(abs(object_lower_limit[0] - longitude))
        lower_lat = object_lower_limit[1][idx]
        lowlim = lower_lat < lat_min

        if uplim and lowlim:
            return True

    # if has only path:

    path = _build_path_from_coeff(
        inputdict["coeff_longitude"],
        inputdict["coeff_latitude"],
        inputdict["t0"],
        inputdict["t1"],
        n_elements,
        inputdict["min_latitude"],
        inputdict["max_latitude"],
        inputdict["min_longitude"],
        inputdict["max_longitude"],
    )

    path_visibility = _calculate_path_visibility(
        location, path, radius, latitudinal=latitudinal
    )
    if path_visibility:
        return True

    return False
