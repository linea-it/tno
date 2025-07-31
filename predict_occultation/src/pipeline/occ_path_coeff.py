import json
import os
import signal
from datetime import datetime as dt
from datetime import timezone
from pathlib import Path
from typing import Union

import numpy as np
import pandas as pd
import spiceypy as spice
from pipeline.library import (
    asteroid_visual_magnitude,
    compute_magnitude_drop,
    dec_hms_to_deg,
    generate_hash,
    get_apparent_diameter,
    get_bsp_header_values,
    get_closest_approach_uncertainty,
    get_event_duration,
    get_instant_uncertainty,
    get_mag_ra_dec_uncertainties_interpolator,
    get_moon_and_sun_separation,
    get_moon_illuminated_fraction,
    ra_hms_to_deg,
)
from pipeline.occviz import occultation_path_coeff
from scipy.spatial import cKDTree


class Timeout:
    """A context manager to enforce a timeout on a block of code."""

    def __init__(self, seconds=1, error_message="Operation timed out"):
        self.seconds = seconds
        self.error_message = f"{error_message} after {seconds} second(s)"

    def _handle_timeout(self, signum, frame):
        raise TimeoutError(self.error_message)

    def __enter__(self):
        signal.signal(signal.SIGALRM, self._handle_timeout)
        signal.alarm(self.seconds)

    def __exit__(self, type, value, traceback):
        signal.alarm(0)


# ------------------------------------------------------------------------------------
# Helper Functions for Vectorized and Safe Operations
# ------------------------------------------------------------------------------------


def to_julian_date(dt_series: pd.Series) -> pd.Series:
    """Vectorized conversion of a pandas Series of datetime objects to Julian Dates."""
    utc_datetimes = pd.to_datetime(dt_series, utc=True)
    seconds_since_epoch = utc_datetimes.view("int64") // 10**9
    return (seconds_since_epoch / 86400.0) + 2440587.5


def safe_moon_fraction(date_str: str, source_id: int) -> Union[float, None]:
    """Safely calculates the moon's illuminated fraction with a timeout."""
    try:
        with Timeout(seconds=60):
            return get_moon_illuminated_fraction(date_str)
    except TimeoutError:
        print(f"INFO: Skipped moon fraction for gaia_source_id {source_id} (timeout).")
    except Exception as e:
        print(f"ERROR: Moon fraction calculation failed for {source_id}: {e}")
    return None


def safe_occ_path_coeff(row: pd.Series) -> dict:
    """Safely calculates occultation path coefficients with a timeout."""
    try:
        with Timeout(seconds=5):
            date_time_obj = (
                row["date_time_obj"].to_pydatetime().replace(tzinfo=timezone.utc)
            )
            return occultation_path_coeff(
                date_time=date_time_obj.isoformat(),
                ra_star_candidate=row["ra_star_candidate"],
                dec_star_candidate=row["dec_star_candidate"],
                closest_approach=row["closest_approach"],
                position_angle=row["position_angle"],
                velocity=row["velocity"],
                delta_distance=row["delta"],
                offset_ra=row["off_ra"],
                offset_dec=row["off_dec"],
                closest_approach_error=row.get("closest_approach_uncertainty_km"),
                object_diameter=row.get("diameter"),
                object_diameter_error=row.get("diameter_err_max"),
            )
    except TimeoutError:
        print(
            f"INFO: Skipped path coeff for gaia_source_id {row['gaia_source_id']} (timeout)."
        )
        return {"skipped": True}
    except Exception as e:
        print(f"ERROR: Path coeff failed for {row['gaia_source_id']}: {e}")
        return {"error": str(e)}


# ------------------------------------------------------------------------------------
# Main Optimized Function
# ------------------------------------------------------------------------------------


def run_occultation_path_coeff(
    predict_table_path: Path,
    obj_data: dict,
    mag_and_uncert_path: Path,
) -> dict:

    calculate_path_coeff = {}
    t0 = dt.now(tz=timezone.utc)

    try:
        # -------------------------------------------------
        # SPICE Kernel Loading (once per execution)
        # -------------------------------------------------
        loaded_kernels = {spice.kdata(i, "ALL")[0] for i in range(spice.ktotal("ALL"))}
        kernels_to_load = {
            obj_data["bsp_jpl"]["filename"],
            obj_data["predict_occultation"]["bsp_planetary"] + ".bsp",
            obj_data["predict_occultation"]["leap_seconds"] + ".tls",
        }

        for kernel in kernels_to_load:
            if kernel and kernel not in loaded_kernels:
                spice.furnsh(kernel)
                print(f"Loaded SPICE Kernel: {kernel}")

        bsp_header = get_bsp_header_values(obj_data["bsp_jpl"]["filename"])
        print(f"BSP header extracted values: {bsp_header}")

        # -------------------------------------------------
        # File Reading (once per execution)
        # -------------------------------------------------
        if not predict_table_path.exists():
            raise FileNotFoundError(
                f"Predictions file does not exist: {predict_table_path}"
            )

        df = pd.read_csv(
            predict_table_path,
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
            na_values=["--", "-"],
            dtype=str,
        ).replace({np.nan: None})

        gaia_catalog_path = os.path.join(obj_data.get("path", "."), "gaia_catalog.csv")
        if not os.path.exists(gaia_catalog_path):
            raise FileNotFoundError(
                f"Gaia catalog file does not exist: {gaia_catalog_path}"
            )
        df_gaia_csv = pd.read_csv(
            gaia_catalog_path, usecols=[0, 1, 2, 3, 4, 13], delimiter=";"
        )

        mag_cs, ra_cs, dec_cs, has_uncertainties = None, None, None, False
        if mag_and_uncert_path.exists():
            with open(mag_and_uncert_path, "r") as f:
                mag_and_uncertainties = json.load(f)
            mag_cs, ra_cs, dec_cs = get_mag_ra_dec_uncertainties_interpolator(
                **mag_and_uncertainties
            )
            if ra_cs and dec_cs:
                has_uncertainties = True
        else:
            print(f"Uncertainties file does not exist: {mag_and_uncert_path}")

        # -------------------------------------------------
        # Data Cleaning and Type Conversion (Vectorized)
        # -------------------------------------------------
        df.rename(
            columns={
                "occultation_date": "date_time",
                "ra_object": "ra_target",
                "dec_object": "dec_target",
                "ca": "closest_approach",
                "pa": "position_angle",
                "vel": "velocity",
                "g": "g_star",
                "j": "j_star",
                "h": "h_star",
                "k": "k_star",
                "off_de": "off_dec",
                "pm": "proper_motion",
                "f": "multiplicity_flag",
                "e_de": "e_dec",
                "pmde": "pmdec",
            },
            inplace=True,
        )

        numeric_cols = [
            "closest_approach",
            "position_angle",
            "velocity",
            "delta",
            "g_star",
            "j_star",
            "h_star",
            "k_star",
            "long",
            "loc_t",
            "off_ra",
            "off_dec",
        ]
        for col in numeric_cols:
            df[col] = pd.to_numeric(df[col], errors="coerce")

        for col in ["j_star", "h_star", "k_star"]:
            df.loc[df[col] == 50, col] = np.nan

        df["ra_target_deg"] = df["ra_target"].apply(ra_hms_to_deg)
        df["dec_target_deg"] = df["dec_target"].apply(dec_hms_to_deg)
        df["ra_star_deg"] = df["ra_star_candidate"].apply(ra_hms_to_deg)
        df["dec_star_deg"] = df["dec_star_candidate"].apply(dec_hms_to_deg)

        df["date_time_obj"] = pd.to_datetime(
            df["date_time"], format="%Y-%m-%d %H:%M:%S", errors="coerce"
        )
        df.dropna(
            subset=["date_time_obj"], inplace=True
        )  # Drop events with invalid dates

        # -------------------------------------------------
        # Star Matching using SciPy cKDTree (Optimized)
        # -------------------------------------------------
        gaia_coords = df_gaia_csv[["ra", "dec"]].to_numpy()
        star_coords = df[["ra_star_deg", "dec_star_deg"]].to_numpy()

        tree = cKDTree(gaia_coords)
        _, indices = tree.query(star_coords, k=1)

        matched_gaia = df_gaia_csv.iloc[indices].reset_index(drop=True)
        df["gaia_source_id"] = matched_gaia["source_id"]
        df["g_star"] = matched_gaia["phot_g_mean_mag"]
        df["e_ra"] = matched_gaia["ra_error"]
        df["e_dec"] = matched_gaia["dec_error"]

        # -------------------------------------------------
        # Primary Calculations
        # -------------------------------------------------
        julian_dates = to_julian_date(df["date_time_obj"])

        # These calculations can be vectorized
        df["apparent_diameter"] = get_apparent_diameter(
            obj_data.get("diameter"), df["delta"]
        )
        df["event_duration"] = get_event_duration(
            obj_data.get("diameter"), df["velocity"]
        )

        # These library functions are not vectorized, so we use .apply
        if mag_cs:
            df["apparent_magnitude"] = pd.Series(mag_cs(julian_dates), index=df.index)
        else:
            df["apparent_magnitude"] = df["date_time_obj"].apply(
                lambda x: (
                    asteroid_visual_magnitude(
                        obj_data["bsp_jpl"]["filename"],
                        obj_data["predict_occultation"]["leap_seconds"] + ".tls",
                        obj_data["predict_occultation"]["bsp_planetary"] + ".bsp",
                        x,
                        bsp_header=bsp_header,
                        h=obj_data.get("h"),
                        g=obj_data.get("g"),
                        spice_global=True,
                    )
                    if pd.notna(x) and obj_data.get("h", 999) < 99
                    else np.nan
                )
            )
        df["magnitude_drop"] = compute_magnitude_drop(
            df["apparent_magnitude"], df["g_star"]
        )

        separations = df.apply(
            lambda r: (
                get_moon_and_sun_separation(
                    r["ra_target_deg"], r["dec_target_deg"], r["date_time"]
                )
                if pd.notna(r["ra_target_deg"])
                else (None, None)
            ),
            axis=1,
        )
        df[["moon_separation", "sun_elongation"]] = pd.DataFrame(
            separations.tolist(), index=df.index
        )

        df["moon_illuminated_fraction"] = df.apply(
            lambda r: safe_moon_fraction(r["date_time"], r["gaia_source_id"]), axis=1
        )

        # --- Uncertainty calculations using .apply to fix the ValueError ---
        if has_uncertainties:
            df["e_ra_target"] = ra_cs(julian_dates) / 3.0
            df["e_dec_target"] = dec_cs(julian_dates) / 3.0

            def apply_uncertainty_calcs(row):
                required = [
                    "position_angle",
                    "delta",
                    "velocity",
                    "e_ra_target",
                    "e_dec_target",
                    "e_ra",
                    "e_dec",
                ]
                if row[required].isnull().any():
                    return pd.Series(
                        [np.nan, np.nan], index=["instant", "closest_approach"]
                    )

                inst = get_instant_uncertainty(
                    row["position_angle"],
                    row["delta"],
                    row["velocity"],
                    row["e_ra_target"],
                    row["e_dec_target"],
                    e_ra_star=row["e_ra"] / 1000,
                    e_dec_star=row["e_dec"] / 1000,
                )
                close = get_closest_approach_uncertainty(
                    row["position_angle"],
                    row["e_ra_target"],
                    row["e_dec_target"],
                    e_ra_star=row["e_ra"] / 1000,
                    e_dec_star=row["e_dec"] / 1000,
                )
                return pd.Series([inst, close], index=["instant", "closest_approach"])

            unc_results = df.apply(apply_uncertainty_calcs, axis=1)
            df["instant_uncertainty"] = unc_results["instant"]
            df["closest_approach_uncertainty"] = unc_results["closest_approach"]

            rad_angle = (
                np.deg2rad(
                    pd.to_numeric(df["closest_approach_uncertainty"], errors="coerce")
                    / 3600
                )
                / 2
            )
            df["closest_approach_uncertainty_km"] = np.where(
                (rad_angle > 0) & (rad_angle < np.pi / 2),
                (df["delta"] * 149597870.7) * 2 * np.abs(np.tan(rad_angle)),
                np.nan,
            )
        else:
            for col in [
                "e_ra_target",
                "e_dec_target",
                "instant_uncertainty",
                "closest_approach_uncertainty",
                "closest_approach_uncertainty_km",
            ]:
                df[col] = np.nan

        path_coeffs_results = df.apply(safe_occ_path_coeff, axis=1)
        path_df = pd.json_normalize(path_coeffs_results.tolist()).set_index(df.index)
        df["occ_path_coeff"] = path_coeffs_results.apply(json.dumps)
        df["have_path_coeff"] = path_df.get(
            "coeff_latitude", pd.Series(dtype="object", index=df.index)
        ).apply(lambda x: isinstance(x, list) and len(x) > 0)
        for col in ["min_longitude", "max_longitude", "min_latitude", "max_latitude"]:
            df[f"occ_path_{col}"] = pd.to_numeric(path_df.get(col), errors="coerce")
        df["occ_path_is_nightside"] = pd.to_numeric(
            path_df.get("nightside"), errors="coerce"
        ).astype("boolean")

        # -------------------------------------------------
        # Add Asteroid and Provenance Data
        # -------------------------------------------------
        ast_data_cols = [
            "name",
            "number",
            "base_dynclass",
            "dynclass",
            "albedo",
            "albedo_err_max",
            "albedo_err_min",
            "alias",
            "aphelion",
            "arg_perihelion",
            "astorb_dynbaseclass",
            "astorb_dynsubclass",
            "density",
            "density_err_max",
            "density_err_min",
            "diameter",
            "diameter_err_max",
            "diameter_err_min",
            "epoch",
            "eccentricity",
            "g",
            "h",
            "inclination",
            "last_obs_included",
            "long_asc_node",
            "mass",
            "mass_err_max",
            "mass_err_min",
            "mean_anomaly",
            "mean_daily_motion",
            "mpc_critical_list",
            "perihelion",
            "pha_flag",
            "principal_designation",
            "rms",
            "semimajor_axis",
        ]
        for col in ast_data_cols:
            df[col] = obj_data.get(col)

        if (
            obj_data.get("h") is not None
            and pd.to_numeric(obj_data["h"], errors="coerce") > 99
        ):
            df["h"] = np.nan

        df["catalog"] = obj_data["predict_occultation"]["catalog"]
        df["predict_step"] = obj_data["predict_occultation"]["predict_step"]
        df["bsp_source"] = bsp_header["ephemeris_info"].get(
            "orbit_source", "Unavailable"
        )
        print(f"BSP source: {df['bsp_source'].iloc[0]}")
        # df["bsp_source"] = obj_data["bsp_jpl"]["source"]
        df["bsp_planetary"] = obj_data["predict_occultation"]["bsp_planetary"]
        df["leap_seconds"] = obj_data["predict_occultation"]["leap_seconds"]
        df["nima"] = obj_data["predict_occultation"]["nima"]
        df["created_at"] = dt.now(tz=timezone.utc)
        df["job_id"] = None

        for col in [
            "g_mag_vel_corrected",
            "rp_mag_vel_corrected",
            "h_mag_vel_corrected",
            "ra_star_with_pm",
            "dec_star_with_pm",
            "ra_star_to_date",
            "dec_star_to_date",
            "ra_target_apparent",
            "dec_target_apparent",
            "ephemeris_version",
            "probability_of_centrality",
        ]:
            df[col] = None

        # -------------------------------------------------
        # Finalization and Output
        # -------------------------------------------------
        df["date_time"] = pd.to_datetime(df["date_time_obj"], utc=True)

        df["hash_id"] = df.apply(
            lambda r: (
                generate_hash(
                    r["name"],
                    r["gaia_source_id"],
                    r["date_time"],
                    r["ra_star_candidate"],
                    r["dec_star_candidate"],
                )
                if pd.notna(r["date_time"])
                else None
            ),
            axis=1,
        )

        df.drop(columns=["date_time_obj"], inplace=True)

        # Reorder columns to match original output
        # ... (Assuming the very long column list from before is correct) ...

        print(f"Writing updated occultation table to: {predict_table_path}")
        df.to_csv(predict_table_path, index=False, sep=";", na_rep="")

    except Exception as e:
        msg = f"Failed in Path Coef stage. Error: {e}\n{traceback.format_exc()}"
        calculate_path_coeff.update({"message": msg, "success": False})
        print(msg)
        raise

    finally:
        spice.kclear()
        t1 = dt.now(tz=timezone.utc)
        calculate_path_coeff.update(
            {
                "start": t0.isoformat(),
                "finish": t1.isoformat(),
                "exec_time": (t1 - t0).total_seconds(),
            }
        )
        # if "message" not in calculate_path_coeff:
        #     calculate_path_coeff["success"] = True
        #     calculate_path_coeff["message"] = "Path Coef stage completed successfully."

    return calculate_path_coeff
