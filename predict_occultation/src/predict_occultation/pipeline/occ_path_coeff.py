import json
import os
from datetime import datetime as dt
from datetime import timezone
from pathlib import Path

import numpy as np
import pandas as pd
import spiceypy as spice
from astropy.time import Time
from library import (
    asteroid_visual_magnitude,
    compute_magnitude_drop,
    dec_hms_to_deg,
    get_apparent_diameter,
    get_event_duration,
    get_instant_uncertainty,
    get_moon_and_sun_separation,
    get_ra_dec_uncertainties_interpolator,
    ra_hms_to_deg,
)
from occviz import occultation_path_coeff


def run_occultation_path_coeff(
    predict_table_path: Path, obj_data: dict, uncertainties_path: Path
) -> dict:

    calculate_path_coeff = {}
    t0 = dt.now(tz=timezone.utc)

    try:
        if not predict_table_path.exists():
            # Arquivo com resultados da predicao nao foi criado
            raise Exception(
                f"Predictions file does not exist. {str(predict_table_path)}"
            )

        # Le o arquivo de incertezas
        has_uncertainties = False
        if uncertainties_path.exists():
            # Arquivo com incertezas nao foi criado
            with open(uncertainties_path, "r") as f:
                uncertainties = json.load(f)
            # Interpolador para as incertezas
            ra_cs, dec_cs = get_ra_dec_uncertainties_interpolator(**uncertainties)
            has_uncertainties = True

        else:
            print(f"Uncertainties file does not exist. {str(uncertainties_path)}")

        # Le o arquivo occultation table e cria um dataframe

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
        )

        # Adiciona as colunas de coordenadas de target e star convertidas para degrees.
        df["ra_target_deg"] = df["ra_object"].apply(ra_hms_to_deg)
        df["dec_target_deg"] = df["dec_object"].apply(dec_hms_to_deg)
        df["ra_star_deg"] = df["ra_star_candidate"].apply(ra_hms_to_deg)
        df["dec_star_deg"] = df["dec_star_candidate"].apply(dec_hms_to_deg)

        # Remover valores como -- ou -
        df["ct"] = df["ct"].str.replace("--", "")
        df["f"] = df["f"].str.replace("-", "")

        # Altera o nome das colunas
        df = df.rename(
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
            }
        )

        # Correcao de valores nao validos
        # Fix https://github.com/linea-it/tno_pipelines/issues/10.
        df.loc[df["j_star"] == 50, "j_star"] = None
        df.loc[df["h_star"] == 50, "h_star"] = None
        df.loc[df["k_star"] == 50, "k_star"] = None

        # Le o source_id, ra, dec e g magnitude do catalogo gaia csv
        df_gaia_csv = pd.read_csv(
            os.path.join(obj_data["path"], "gaia_catalog.csv"),
            usecols=(0, 1, 2, 3, 4, 13),
            delimiter=";",
        )

        # -------------------------------------------------
        # Coeff paths e calculo de outros grandezas
        # -------------------------------------------------
        coeff_paths = []

        # Para cada Ocultacao e necessario calcular o occultation path.
        for row in df.to_dict(orient="records"):

            new_row = {
                "gaia_source_id": None,
                "gaia_g_mag": None,
                "apparent_magnitude": None,
                "magnitude_drop": None,
                "apparent_diameter": None,
                "event_duration": None,
                "instant_uncertainty": None,
                "moon_separation": None,
                "sun_elongation": None,
                "e_ra_target": None,
                "e_dec_target": None,
                "e_ra_star": None,
                "e_dec_star": None,
                "have_path_coeff": False,
                "occ_path_min_longitude": None,
                "occ_path_max_longitude": None,
                "occ_path_min_latitude": None,
                "occ_path_max_latitude": None,
                "occ_path_is_nightside": None,
                "occ_path_coeff": {},
            }

            # Obtem a magnitude da estrela do catalogo gaia (a magnitude retornada
            # pelo praia esta corrigida por padrão por velocidade da sombra, por isso é substituída)
            minimum_distance = np.sqrt(
                (df_gaia_csv["ra"] - row["ra_star_deg"]) ** 2
                + (df_gaia_csv["dec"] - row["dec_star_deg"]) ** 2
            )
            star_index = np.argmin(minimum_distance)
            source_id, gaia_g_mag = (
                df_gaia_csv["source_id"][star_index],
                df_gaia_csv["phot_g_mean_mag"][star_index],
            )
            new_row.update({"gaia_source_id": source_id, "gaia_g_mag": gaia_g_mag})

            e_ra_star, e_dec_star = (
                df_gaia_csv["ra_error"][star_index],
                df_gaia_csv["dec_error"][star_index],
            )
            new_row.update({"e_ra_star": e_ra_star, "e_dec_star": e_dec_star})

            # ------------------------------------------------------------------------
            # Calcula a magnitude visual do asteroide no instante da ocultação
            # Alerta: os arquivos bsp estão na memoria global por alguma razão,
            #         convém analisar esse comportamente no futuro.
            # ------------------------------------------------------------------------
            ast_vis_mag = None
            if (
                obj_data["h"] < 99
            ):  # some objects have h defined as 99.99 when unknown in the asteroid table inherited from MPC
                ast_vis_mag = asteroid_visual_magnitude(
                    obj_data["bsp_jpl"]["filename"],
                    obj_data["predict_occultation"]["leap_seconds"] + ".bsp",
                    obj_data["predict_occultation"]["bsp_planetary"] + ".bsp",
                    dt.strptime(row["date_time"], "%Y-%m-%d %H:%M:%S"),
                    h=obj_data["h"],
                    g=obj_data["g"],
                    spice_global=True,
                )

            # Calcula a queda em magnitude durante a ocultacao
            magnitude_drop = compute_magnitude_drop(ast_vis_mag, gaia_g_mag)

            # Calcula o diametro apararente o diametro em km existe
            apparent_diameter = get_apparent_diameter(
                obj_data["diameter"], row["delta"]
            )

            # Calcula a duração do evento se o diametro existir
            event_duration = get_event_duration(obj_data["diameter"], row["velocity"])

            # Calcula a separação angular da lua e do sol do objeto no instante da ocultação
            moon_separation, sun_elongation = get_moon_and_sun_separation(
                row["ra_target_deg"], row["dec_target_deg"], row["date_time"]
            )

            # Obtem o valor da incerteza do objeto no instante da ocultação
            # e calcula a incerteza no instante central
            e_ra_target, e_dec_target = None, None
            instant_uncertainty = None
            if has_uncertainties:
                datetime_object = dt.fromisoformat(row["date_time"])
                # Convert to Julian Date using astropy
                time_obj = Time(datetime_object)
                julian_date = time_obj.jd
                # Errors are divided by 3 because the interpolation is done using 3-sigma values
                e_ra_target = ra_cs(julian_date) / 3.0
                e_dec_target = dec_cs(julian_date) / 3.0

                instant_uncertainty = get_instant_uncertainty(
                    row["position_angle"],
                    row["delta"],
                    row["velocity"],
                    e_ra_target,
                    e_dec_target,
                    e_ra_star=0,
                    e_dec_star=0,
                )

                # instant_uncertainty = get_instant_uncertainty(row["position_angle"], row["delta"], row["velocity"],
                #     e_ra_target, e_dec_target, e_ra_star=df_gaia_csv["ra_error"][star_index]/1000, e_dec_star=df_gaia_csv["dec_error"][star_index]/1000)

            new_row.update(
                {
                    "apparent_magnitude": ast_vis_mag,
                    "magnitude_drop": magnitude_drop,
                    "apparent_diameter": apparent_diameter,
                    "event_duration": event_duration,
                    "instant_uncertainty": instant_uncertainty,
                    "moon_separation": moon_separation,
                    "sun_elongation": sun_elongation,
                    "e_ra_target": e_ra_target,
                    "e_dec_target": e_dec_target,
                }
            )

            occ_coeff = occultation_path_coeff(
                date_time=dt.strptime(row["date_time"], "%Y-%m-%d %H:%M:%S")
                .replace(tzinfo=timezone.utc)
                .isoformat(),
                ra_star_candidate=row["ra_star_candidate"],
                dec_star_candidate=row["dec_star_candidate"],
                closest_approach=row["closest_approach"],
                position_angle=row["position_angle"],
                velocity=row["velocity"],
                delta_distance=row["delta"],
                offset_ra=row["off_ra"],
                offset_dec=row["off_dec"],
                object_diameter=row.get("diameter", None),
                ring_radius=None,
            )

            if (
                len(occ_coeff["coeff_latitude"]) > 0
                and len(occ_coeff["coeff_longitude"]) > 0
            ):
                new_row.update(
                    {
                        "have_path_coeff": True,
                        "occ_path_min_longitude": (
                            float(occ_coeff["min_longitude"])
                            if occ_coeff["min_longitude"] != None
                            else None
                        ),
                        "occ_path_max_longitude": (
                            float(occ_coeff["max_longitude"])
                            if occ_coeff["max_longitude"] != None
                            else None
                        ),
                        "occ_path_min_latitude": (
                            float(occ_coeff["min_latitude"])
                            if occ_coeff["min_latitude"] != None
                            else None
                        ),
                        "occ_path_max_latitude": (
                            float(occ_coeff["max_latitude"])
                            if occ_coeff["max_latitude"] != None
                            else None
                        ),
                        "occ_path_is_nightside": bool(occ_coeff["nightside"]),
                        "occ_path_coeff": json.dumps(occ_coeff),
                    }
                )

            coeff_paths.append(new_row)

        if len(coeff_paths) > 0:
            df_coeff = pd.DataFrame.from_dict(coeff_paths)

            df["gaia_source_id"] = df_coeff["gaia_source_id"]
            df["g_star"] = df_coeff["gaia_g_mag"]
            df["apparent_magnitude"] = df_coeff["apparent_magnitude"]
            df["magnitude_drop"] = df_coeff["magnitude_drop"]
            df["apparent_diameter"] = df_coeff["apparent_diameter"]
            df["event_duration"] = df_coeff["event_duration"]
            df["instant_uncertainty"] = df_coeff["instant_uncertainty"]
            df["moon_separation"] = df_coeff["moon_separation"]
            df["sun_elongation"] = df_coeff["sun_elongation"]
            df["e_ra_target"] = df_coeff["e_ra_target"]
            df["e_dec_target"] = df_coeff["e_dec_target"]
            df["e_ra"] = df_coeff["e_ra_star"]
            df["e_dec"] = df_coeff["e_dec_star"]

            df["have_path_coeff"] = df_coeff["have_path_coeff"]
            df["occ_path_max_longitude"] = df_coeff["occ_path_max_longitude"]
            df["occ_path_min_longitude"] = df_coeff["occ_path_min_longitude"]
            df["occ_path_coeff"] = df_coeff["occ_path_coeff"]
            df["occ_path_is_nightside"] = df_coeff["occ_path_is_nightside"]
            df["occ_path_max_latitude"] = df_coeff["occ_path_max_latitude"]
            df["occ_path_min_latitude"] = df_coeff["occ_path_min_latitude"]

            del df_coeff
        else:
            df["gaia_source_id"] = None
            df["g_star"] = None
            df["apparent_magnitude"] = None
            df["magnitude_drop"] = None
            df["apparent_diameter"] = None
            df["event_duration"] = None
            df["instant_uncertainty"] = None
            df["moon_separation"] = None
            df["sun_elongation"] = None
            df["e_ra_target"] = None
            df["e_dec_target"] = None
            df["e_ra"] = None
            df["e_dec"] = None

            df["have_path_coeff"] = False
            df["occ_path_max_longitude"] = None
            df["occ_path_min_longitude"] = None
            df["occ_path_coeff"] = None
            df["occ_path_is_nightside"] = None
            df["occ_path_max_latitude"] = None
            df["occ_path_min_latitude"] = None

        # -------------------------------------------------
        # MPC asteroid data used for prediction
        # -------------------------------------------------
        ast_data_columns = [
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
        for column in ast_data_columns:
            df[column] = obj_data.get(column)

        # Correcao de valores nao validos para H (magnitude absoluta do asteroide)
        if obj_data["h"] > 99:
            df["h"] = None

        # -------------------------------------------------
        # Provenance Fields
        # Adiciona algumas informacoes de Proveniencia a cada evento de predicao
        # -------------------------------------------------
        df["catalog"] = obj_data["predict_occultation"]["catalog"]
        df["predict_step"] = obj_data["predict_occultation"]["predict_step"]
        df["bsp_source"] = obj_data["bsp_jpl"]["source"]
        df["obs_source"] = obj_data["observations"]["source"]
        df["orb_ele_source"] = obj_data["orbital_elements"]["source"]
        df["bsp_planetary"] = obj_data["predict_occultation"]["bsp_planetary"]
        df["leap_seconds"] = obj_data["predict_occultation"]["leap_seconds"]
        df["nima"] = obj_data["predict_occultation"]["nima"]
        df["created_at"] = dt.now(tz=timezone.utc)

        # Job Id sera preenchido na importacao.
        df["job_id"] = None

        # ------------------------------------------------------
        # Colunas que aparentemente não esto sendo preenchidas
        # ------------------------------------------------------
        columns_for_future = [
            "g_mag_vel_corrected",
            "rp_mag_vel_corrected",
            "h_mag_vel_corrected",
            # "instant_uncertainty",
            "ra_star_with_pm",
            "dec_star_with_pm",
            "ra_star_to_date",
            "dec_star_to_date",
            "ra_target_apparent",
            "dec_target_apparent",
            # "e_ra_target",
            # "e_dec_target",
            "ephemeris_version",
        ]
        for column in columns_for_future:
            df[column] = None

        # Converter as strings date_time do instante da ocultação em objetos datetime utc
        df["date_time"] = pd.to_datetime(df["date_time"], utc=True)

        # Altera a ordem das colunas para coincidir com a da tabela
        df = df.reindex(
            columns=[
                "name",
                "number",
                "date_time",
                "gaia_source_id",
                "ra_star_candidate",
                "dec_star_candidate",
                "ra_target",
                "dec_target",
                "closest_approach",
                "position_angle",
                "velocity",
                "delta",
                "g",
                "j_star",
                "h",
                "k_star",
                "long",
                "loc_t",
                "off_ra",
                "off_dec",
                "proper_motion",
                "ct",
                "multiplicity_flag",
                "e_ra",
                "e_dec",
                "pmra",
                "pmdec",
                "ra_star_deg",
                "dec_star_deg",
                "ra_target_deg",
                "dec_target_deg",
                "created_at",
                "apparent_diameter",
                "aphelion",
                "apparent_magnitude",
                "dec_star_to_date",
                "dec_star_with_pm",
                "dec_target_apparent",
                "diameter",
                "e_dec_target",
                "e_ra_target",
                "ephemeris_version",
                "g_mag_vel_corrected",
                "h_mag_vel_corrected",
                "inclination",
                "instant_uncertainty",
                "magnitude_drop",
                "perihelion",
                "ra_star_to_date",
                "ra_star_with_pm",
                "ra_target_apparent",
                "rp_mag_vel_corrected",
                "semimajor_axis",
                "have_path_coeff",
                "occ_path_max_longitude",
                "occ_path_min_longitude",
                "occ_path_coeff",
                "occ_path_is_nightside",
                "occ_path_max_latitude",
                "occ_path_min_latitude",
                "base_dynclass",
                "bsp_planetary",
                "bsp_source",
                "catalog",
                "dynclass",
                "job_id",
                "leap_seconds",
                "nima",
                "obs_source",
                "orb_ele_source",
                "predict_step",
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
                "diameter_err_max",
                "diameter_err_min",
                "epoch",
                "eccentricity",
                "last_obs_included",
                "long_asc_node",
                "mass",
                "mass_err_max",
                "mass_err_min",
                "mean_anomaly",
                "mean_daily_motion",
                "mpc_critical_list",
                "perihelion_dist",
                "pha_flag",
                "principal_designation",
                "rms",
                "g_star",
                "h_star",
                "event_duration",
                "moon_separation",
                "sun_elongation",
            ]
        )

        # ATENCAO! Sobrescreve o arquivo occultation_table.csv
        df.to_csv(predict_table_path, index=False, sep=";")

        del df

    except Exception as e:
        msg = "Failed in Path Coef stage. Error: %s" % e
        calculate_path_coeff.update({"message": msg})
        print(msg)
    finally:
        t1 = dt.now(tz=timezone.utc)
        tdelta = t1 - t0

        calculate_path_coeff.update(
            {
                "start": t0.isoformat(),
                "finish": t1.isoformat(),
                "exec_time": tdelta.total_seconds(),
            }
        )
        return calculate_path_coeff
