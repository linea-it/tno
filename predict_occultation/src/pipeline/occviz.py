# occviz.py
# Author: Rodrigo Boufleur July 2023
# Updated at: October 2023 (Rodrigo Boufleur)
# Last update: August 2024 (Rodrigo Boufleur): breaking changes, performance optimization

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
    AltAz,
    Angle,
    EarthLocation,
    SkyCoord,
    SkyOffsetFrame,
    get_sun,
)

# FIX: Added TimeDelta to the import
from astropy.time import Time, TimeDelta

# Using the original profiler import from your environment
from pipeline.profiler import Profiler
from scipy.interpolate import CubicSpline


def _calculate_r2(x, y):
    """
    Calculate r^2 based on the given x and y values.

    Parameters
    ----------
    x : numpy.ndarray
        Projected position in x.
    y : numpy.ndarray
        Projected position in y.

    Returns
    -------
    numpy.ndarray
        Calculated r^2 values.
    """
    r2 = const.R_earth.to_value(u.m) ** 2 - (x**2 + y**2)
    return r2


def _get_valid_indices(r2):
    """
    Get valid indices where r^2 is greater than or equal to 0.0.

    Parameters
    ----------
    r2 : numpy.ndarray
        Array of r^2 values.

    Returns
    -------
    numpy.ndarray
        Valid indices where r^2 >= 0.0.
    """
    return np.where(r2 >= 0.0)[0]


def _transform_coordinates(r, x, y, time, loncen, latcen, true_idx, r2):
    """
    Transform coordinates to get longitude and latitude using a vectorized approach.

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
        Valid indices where r^2 >= 0.0.
    r2: numpy.ndarray
        Original r^2 array to check length against time.


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

        # Iteratively refine the 'r' coordinate for all points at once
        for _ in range(5):
            new_pos = SkyCoord(
                r * u.m,
                x * u.m,
                y * u.m,
                representation_type="cartesian",
                frame=center_frame,
            )
            # These are now vectorized operations on the whole array
            n_coord = new_pos.transform_to(GCRS(obstime=time))
            n_itrs = n_coord.transform_to(ITRS(obstime=time))
            n_site = n_itrs.earth_location
            # Re-calculate on the surface (height=0) to refine position
            itrs_site = EarthLocation(n_site.lon, n_site.lat, height=0 * u.m).get_itrs(
                obstime=time
            )
            gcrs_site = itrs_site.transform_to(GCRS(obstime=time))
            target1 = gcrs_site.transform_to(center_frame)
            r = target1.cartesian.x.to(u.m).value  # Update 'r' for the next iteration

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
    lon, lat = np.full(len(r2), 1e31), np.full(len(r2), 1e31)

    if true_idx.size > 0:
        r_valid = np.sqrt(r2[true_idx])
        x_valid = x[true_idx]
        y_valid = y[true_idx]

        lon_valid, lat_valid = _transform_coordinates(
            r_valid, x_valid, y_valid, time, loncen, latcen, true_idx, r2
        )
        if lon_valid is not None:
            lon[true_idx] = lon_valid
            lat[true_idx] = lat_valid

    return lon, lat


def _calculate_arc_coordinates(delta, ca, pa, dtimes, vel, pa_plus, radius):
    """
    Calculate the x and y coordinates of an arc based on the given parameters.

    Parameters
    ----------
    delta : Quantity
        The geocentric distance to the object.
    ca : Quantity
        The closest approach distance in angular units.
    pa : Quantity
        The position angle of the occultation path.
    dtimes : array-like
        The time intervals relative to the closest approach.
    vel : Quantity
        The velocity of the object.
    pa_plus : Quantity
        The position angle perpendicular to the path.
    radius : Quantity
        The radius offset from the central path (e.g., for object limits).

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
    Adjust longitude values to remove abrupt discontinuities across the +/-180 deg line.

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
    Interpolate longitude and latitude values using a cubic spline.

    Parameters
    ----------
    lon : numpy.ndarray
        Longitude values.
    lat : numpy.ndarray
        Latitude values.
    times : numpy.ndarray
        Time values in seconds.

    Returns
    -------
    tuple
        Interpolated longitude and latitude arrays.
    """
    cs_lat = CubicSpline(times, lat)
    cs_lon = CubicSpline(times, lon)
    t_interp = np.linspace(times.min(), times.max(), 1275)
    lat_interp = cs_lat(t_interp)
    lon_interp = cs_lon(t_interp)

    # Wrap interpolated longitudes to the [-180, 180] range
    lon_interp = Angle(lon_interp * u.deg).wrap_at(180 * u.deg).deg

    return lon_interp, lat_interp


def _path_latlon(
    instants, dtimes, centers, delta, ca, vel, pa, pa_plus, radius=0, interpolate=True
):
    """
    Calculate latitudes and longitudes for the occultation path.

    Parameters
    ----------
    instants : astropy.time.Time
        Array of time instances for the path.
    dtimes : astropy.units.Quantity
        Array of time intervals.
    centers : astropy.coordinates.EarthLocation
        EarthLocation object representing the center coordinates of the projection.
    delta : Quantity
        Geocentric distance to the object.
    ca : Quantity
        Closest approach distance.
    vel : Quantity
        Velocity of the object.
    pa : Quantity
        Position angle of the path.
    pa_plus : Quantity
        Position angle perpendicular to the path.
    radius : float, optional
        Radius offset from the central path in km.
    interpolate : bool, optional
        Flag indicating whether to interpolate the coordinates.

    Returns
    -------
    tuple
        Longitude and latitude values for the path.
    """
    arc_x, arc_y = _calculate_arc_coordinates(
        delta, ca, pa, dtimes, vel, pa_plus, radius
    )

    lon, lat = _xy2latlon(arc_x, arc_y, centers.lon.deg, centers.lat.deg, instants)

    valid_coordinates = lon < 1e31
    lon_valid = lon[valid_coordinates]
    lat_valid = lat[valid_coordinates]
    times_valid = dtimes[valid_coordinates].to_value(u.s)

    if interpolate and (len(lon_valid) > 2):
        lon_backup = lon_valid.copy()
        try:
            # The first time point is our reference t=0
            times_relative = times_valid - times_valid[0]
            lon_continuous = _handle_longitude_discontinuities(lon_valid)
            return _interpolate_coordinates(lon_continuous, lat_valid, times_relative)
        except Exception:
            return lon_backup.tolist(), lat_valid.tolist()
    else:
        return lon_valid.tolist(), lat_valid.tolist()


def _setup_initial_variables(
    date_time: Union[datetime, str],
    star_coordinates,
    delta_distance,
    velocity,
    position_angle,
    closest_approach,
    offset,
):
    """
    Set up initial variables for the occultation path calculation.
    """
    # Using Time() with a datetime object is the most robust method.
    instant = Time(date_time, scale="utc")
    star = SkyCoord(star_coordinates, frame="icrs", unit=(u.hourangle, u.deg))
    delta = delta_distance * u.AU
    vel = velocity * (u.km / u.s)
    pa = Angle(position_angle * u.deg)
    pa.wrap_at("180d", inplace=True)
    off_ra, off_dec = (offset[0] * u.mas, offset[1] * u.mas)
    delta_ca = off_ra * np.sin(pa) + off_dec * np.cos(pa)

    # --- FIX: Use .value to make the angle dimensionless for the time calculation ---
    angular_offset_component = off_ra * np.cos(pa) - off_dec * np.sin(pa)
    delta_instant_quantity = (
        -angular_offset_component.to(
            u.rad
        ).value  # This now results in a pure time Quantity
        * delta.to(u.km)
        / abs(vel)
    )
    # -----------------------------------------------------------------------------

    ca = closest_approach * u.arcsec + delta_ca
    # Explicitly convert the time Quantity to a TimeDelta before adding
    instant = instant + TimeDelta(delta_instant_quantity)

    return instant, star, delta, vel, pa, ca


def _calculate_position_angle(pa):
    """
    Calculate the position angle perpendicular to the path direction.

    Parameters
    ----------
    pa : Angle
        Initial position angle.

    Returns
    -------
    Angle
        Adjusted position angle, perpendicular to the input.
    """
    # A 90 degree rotation
    return Angle(pa.deg + 90, unit=u.deg).wrap_at(180 * u.deg)


def _generate_instants_array(vel):
    """
    Generate the array of time offsets from the central instant.

    Parameters
    ----------
    vel : Quantity
        Object velocity in km/s.

    Returns
    -------
    astropy.units.Quantity
        Array of time offsets in seconds.
    """
    # Time for object to cross Earth's radius
    max_time_s = const.R_earth.to_value(u.km) / abs(vel.to_value(u.km / u.s))
    dtimes = np.linspace(0, int(max_time_s * 1.2), 100)  # Extend slightly
    dtimes = np.concatenate([-dtimes[1:][::-1], dtimes])
    return dtimes * u.s


def _create_star_positions_array(star, instants):
    """
    Create an array of star positions in the GCRS frame projected onto Earth.

    Parameters
    ----------
    star : SkyCoord
        Star coordinates.
    instants : astropy.time.Time
        Array of time instances.

    Returns
    -------
    EarthLocation
        Sub-stellar points (projection of star onto Earth's surface) in the ITRS frame.
    """
    star_ras = np.repeat(star.ra, len(instants))
    star_decs = np.repeat(star.dec, len(instants))

    # Create an instance of the GCRS frame directly
    centers_gcrs = GCRS(
        ra=star_ras, dec=star_decs, distance=1 * u.R_earth, obstime=instants
    )

    # Use the correct .transform_to() method for frame conversion
    centers_itrs = centers_gcrs.transform_to(ITRS(obstime=instants))

    return centers_itrs.earth_location


def _check_nighttime(location, instant):
    """
    Check if the occultation happens at nighttime for a given location.

    Parameters
    ----------
    location : EarthLocation
        The geographic location of the observer.
    instant : Time
        The time at which the occultation event occurs.

    Returns
    -------
    bool
        True if the event occurs during nighttime, False otherwise.
    """
    try:
        # Use Astropy's AltAz frame to get the Sun's altitude
        frame = AltAz(obstime=instant, location=location)
        sun_altaz = get_sun(instant).transform_to(frame)
        # Nighttime is when the sun's center is below the horizon.
        # We can use -6 degrees for civil twilight as a practical limit.
        return bool(np.any(sun_altaz.alt < -6 * u.deg))
    except Exception:
        # If any calculation fails, default to True to not incorrectly discard a visible event.
        return True


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
    Calculate latitude and longitude polynomial coefficients for a given path.

    Parameters
    ----------
    (Same as before)

    Returns
    -------
    tuple
        Tuple containing lon/lat coefficients, min/max values, and nighttime flag.
    """
    path_coeff_profiler = Profiler()

    with path_coeff_profiler("Calculate Arc Coordinates"):
        arc_x, arc_y = _calculate_arc_coordinates(
            delta, ca, pa, dtimes, vel, pa_plus, radius
        )

    with path_coeff_profiler("XY to LatLon Transformation"):
        lon, lat = _xy2latlon(arc_x, arc_y, centers.lon.deg, centers.lat.deg, instants)

    with path_coeff_profiler("Filter, Fit, and Process"):
        valid_coordinates = lon < 1e31
        lon_valid = lon[valid_coordinates]
        lat_valid = lat[valid_coordinates]
        times_valid = dtimes.value[valid_coordinates]

        if len(lon_valid) > degree + 1:
            try:
                location = EarthLocation.from_geodetic(
                    lat=lat_valid * u.deg, lon=lon_valid * u.deg
                )
                nighttime = _check_nighttime(location, central_instant)

                lon_continuous = _handle_longitude_discontinuities(lon_valid)
                lon_coeff = np.polyfit(times_valid, lon_continuous, degree)
                lat_coeff = np.polyfit(times_valid, lat_valid, degree)

                path_coeff_profiler.sub_report()
                return (
                    lon_coeff.tolist(),
                    lat_coeff.tolist(),
                    lon_continuous.max(),
                    lon_continuous.min(),
                    lat_valid.max(),
                    lat_valid.min(),
                    nighttime,
                )
            except Exception:
                path_coeff_profiler.sub_report()
                return [], [], None, None, None, None, False
        else:
            path_coeff_profiler.sub_report()
            return [], [], None, None, None, None, False


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
    degree: int = 19,
):
    """
    Calculate the polynomial coefficients for the occultation path.

    Parameters
    ----------
    (Same as before)

    Returns
    -------
    dict
        Dictionary containing the calculated coefficients and other relevant information.
    """
    profiler = Profiler()

    if isinstance(date_time, str):
        # fromisoformat handles timezone offsets like +00:00 correctly
        date_time_obj = datetime.fromisoformat(date_time)
    else:
        # It's already a datetime object
        date_time_obj = date_time

    star_coordinates = f"{ra_star_candidate} {dec_star_candidate}"
    offset = (offset_ra, offset_dec)

    object_radius = float(object_diameter / 2) if object_diameter is not None else 0
    object_radius_error = (
        float(object_diameter_error / 2) if object_diameter_error is not None else 0
    )
    ca_error_km = (
        (closest_approach_error * u.arcsec).to_value(u.rad)
        * (delta_distance * u.AU).to_value(u.km)
        if closest_approach_error is not None
        else 0
    )
    total_radius = object_radius + object_radius_error + ca_error_km

    with profiler("Setup Initial Variables"):
        instant, star, delta, vel, pa, ca = _setup_initial_variables(
            date_time_obj,
            star_coordinates,
            delta_distance,
            velocity,
            position_angle,
            closest_approach,
            offset,
        )

    with profiler("Calculate Position Angle"):
        pa_plus = _calculate_position_angle(pa)

    with profiler("Generate Instants Array"):
        dtimes = _generate_instants_array(vel)

    # FIX: Explicitly convert the time Quantity to a TimeDelta before adding
    instants = instant + TimeDelta(dtimes)

    with profiler("Create Star Positions Array"):
        centers = _create_star_positions_array(star, instants)

    output = {
        "t0": instants[0].isot,
        "t1": instants[-1].isot,
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

    all_lons, all_lats, all_nightsides = [], [], []

    with profiler("Calculate Central Path Coefficients"):
        (lon_c, lat_c, max_lon, min_lon, max_lat, min_lat, night) = _path_latlon_coeff(
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
        output.update({"coeff_longitude": lon_c, "coeff_latitude": lat_c})
        if max_lon is not None:
            all_lons.extend([max_lon, min_lon])
            all_lats.extend([max_lat, min_lat])
            all_nightsides.append(night)

    with profiler("Calculate Upper and Lower Limit Coefficients"):
        if total_radius > 0:
            (ulon_c, ulat_c, umax_lon, umin_lon, umax_lat, umin_lat, unight) = (
                _path_latlon_coeff(
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
            )
            output.update(
                {
                    "body_upper_coeff_longitude": ulon_c,
                    "body_upper_coeff_latitude": ulat_c,
                }
            )
            if umax_lon is not None:
                all_lons.extend([umax_lon, umin_lon])
                all_lats.extend([umax_lat, umin_lat])
                all_nightsides.append(unight)

            (llon_c, llat_c, lmax_lon, lmin_lon, lmax_lat, lmin_lat, lnight) = (
                _path_latlon_coeff(
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
            )
            output.update(
                {
                    "body_lower_coeff_longitude": llon_c,
                    "body_lower_coeff_latitude": llat_c,
                }
            )
            if lmax_lon is not None:
                all_lons.extend([lmax_lon, lmin_lon])
                all_lats.extend([lmax_lat, lmin_lat])
                all_nightsides.append(lnight)

    with profiler("Finalize Output"):
        if all_lons:
            longitudes = np.array(all_lons)
            latitudes = np.array(all_lats)
            output.update(
                {
                    "min_longitude": longitudes.min(),
                    "max_longitude": longitudes.max(),
                    "min_latitude": latitudes.min(),
                    "max_latitude": latitudes.max(),
                }
            )

        output["nightside"] = any(all_nightsides)

    profiler.sub_report()
    return output
