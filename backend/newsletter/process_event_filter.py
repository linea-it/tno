import os
import sys
from datetime import datetime, time, timedelta, timezone
from pathlib import Path

import colorlog
import pandas as pd
from django.conf import settings
from django.db.models import Q
from newsletter.models import EventFilter
from tno.models import Occultation
from tno.occviz import visibility_from_coeff


class ProcessEventFilters:

    def __init__(self, stdout=False):

        self.log = colorlog.getLogger("subscription")
        if stdout:
            consoleFormatter = colorlog.ColoredFormatter("%(log_color)s%(message)s")
            consoleHandler = colorlog.StreamHandler(sys.stdout)
            consoleHandler.setFormatter(consoleFormatter)
            self.log.addHandler(consoleHandler)

    def get_filters(self):
        help = "Busca as preferencias do usuario salvas no banco."

        try:
            data = EventFilter.objects.all().values()
            if data:
                return data
            else:
                return None

        except Exception as e:
            raise Exception(f"Failed to query subscription filters. {e}")

    def query_occultation(self, input, frequency, date_start):
        e_true = []
        try:
            # filtro por data. Obs, os filtros salvos nao tem data
            # a data será passada no momento de fazer a rodada
            # por exemplo, periodo weekly = data + 7 dias
            # periodo month = data + 30 dias

            # period = self.get_filters().values_list(
            #    "frequency", flat=True
            # )

            date_end = date_start
            date_start = datetime.fromisoformat(date_start).astimezone(tz=timezone.utc)
            date_end = datetime.fromisoformat(date_end).astimezone(tz=timezone.utc)

            # frequency = input.get("frequency", None)
            ## for frequency in period:
            print("period", frequency)

            if frequency == 1:

                # frequency == 2
                date_end = date_start + timedelta(days=7)

                print(
                    "periodo monthly",
                    frequency,
                    "data inicial",
                    date_start,
                    "data final",
                    date_end,
                )
            else:
                # frequency == 2
                print("periodo weekly", frequency)
                date_end = date_start + timedelta(days=30)

                print(
                    "periodo weekly",
                    frequency,
                    "data inicial",
                    date_start,
                    "data final",
                    date_end,
                )

            # query baseado no intervalo temporal
            # TODO: adaptar isso ao intervalo weekly e monthly
            query_occultation = Occultation.objects.filter(
                date_time__range=[date_start, date_end]
            )

            print("total query occultation date", query_occultation.values().count())

            # se magmax e magmin foram definidos, filtra por magnitude
            magmax = input.get("magnitude_max", None)
            magmin = input.get("magnitude_min", None)
            if magmax and magmin:
                query_occultation = query_occultation.filter(
                    g_star__range=[magmin, magmax]
                )
            print("total query occultation mag", query_occultation.values().count())

            # TODO: Se filter_type foi definido, filtra por nome, classe ou subclasse
            # TODO: se magdrop foi definido, filtra por magdrop

            # se local_solar_time foi definido
            local_solar_time_after = input.get("local_solar_time_after", None)
            local_solar_time_before = input.get("local_solar_time_before", None)

            if local_solar_time_after and local_solar_time_before:
                """Rodrigo
                datetime_after = datetime.combine(datetime.min, local_solar_time_after)

                datetime_before = datetime.combine(
                    datetime.min, local_solar_time_before
                )
                time_difference = datetime_before - datetime_after
                print("diferenca", time_difference)
                if time_difference.seconds >= 0:
                    query_occultation = query_occultation.filter(
                        loc_t__range=[local_solar_time_after, local_solar_time_before]
                    )
                # if retorna query vazia por isso o erro
                print("local solar time... ", query_occultation)
                """
                """
                else:
                    after = Q(
                        loc_t__gte=local_solar_time_after,
                        loc_t__lte=time(23, 59, 59.999999),
                    )
                    before = Q(
                        loc_t__gte=time(0, 0, 0), loc_t__lte=local_solar_time_before
                    )
                    query_occultation = query_occultation.filter(after | before)
                    """
                # Filtro por Solar Time 18:00 - 06:00
                after = Q(loc_t__gte=time(18, 0, 0), loc_t__lte=time(23, 59, 59))
                before = Q(loc_t__gte=time(0, 0, 0), loc_t__lte=time(6, 0, 0))
                query_occultation = query_occultation.filter(Q(after | before))

            print("total query occultation lst", query_occultation.values().count())

            # TODO: se event_duration foi definido
            event_duration = input.get("event_duration", None)

            if event_duration:
                query_occultation = query_occultation.filter(
                    event_duration__gte=event_duration
                )
            print("total query occultation event", query_occultation.values().count())

            # TODO: se diameter_min e diameter_max foram definidos, filtra por diametro
            diameter_err_min = input.get("diameter_err_min", None)
            diameter_err_max = input.get("diameter_err_max", None)

            if diameter_err_min and diameter_err_max:
                query_occultation = query_occultation.filter(
                    diameter__range=[diameter_err_min, diameter_err_max]
                )
            print("total query occultation diam", query_occultation.values().count())

            # TODO: filtra por geofiltro (latitude, longitude, location_radius)
            occ_path_min_latitude = input.get("occ_path_min_latitude", None)

            if occ_path_min_latitude:
                query_occultation = query_occultation.filter(
                    occ_path_min_latitude__lte=occ_path_min_latitude
                )
            print("total query occultation lat", query_occultation.values().count())

            occ_path_min_longitude = input.get("occ_path_min_longitude", None)

            if occ_path_min_longitude:
                query_occultation = query_occultation.filter(
                    occ_path_min_longitude__lte=occ_path_min_longitude
                )
            print("total query occultation lon", query_occultation.values().count())

            # TODO: filtro por geolocation
            # fazer um loop sobre query_occultation chamando a funçõa geolocation

            radius = self.get_filters().values_list("location_radius", flat=True)
            # print("radius", radius[0])
            # """
            for r in radius:
                for events in query_occultation:
                    # print("query filtered....", events, r)
                    long = events.occ_path_min_longitude
                    lat = events.occ_path_min_latitude
                    # print("lat", lat, "lon", long)

                    radius = r  # radius[0]  # 150

                    is_visible = visibility_from_coeff(
                        latitude=lat,
                        longitude=long,
                        radius=radius,
                        date_time=date_end,  # event.date_time,
                        inputdict=events.occ_path_coeff,  # query_occultation.values_list("occ_path_coeff")[0],
                        # opcionais
                        # n_elements= 1500,
                        # latitudinal= False
                    )
                    # print("e id", e.hash_id)
                    # print("isvisible", is_visible)

                    if is_visible:
                        e_true.append(events)

                    print("events", e_true)
                    query_occultation = e_true
            # """
            # query_occultation = e_true
            # print("query.....", query_occultation)

            if query_occultation:
                return query_occultation
            else:
                return None

        except Exception as e:
            raise Exception(f"Failed to query subscription time. {e}")

    def run_filter(self):

        tmp_path = Path("/archive/subscription/")
        print("dir... ", tmp_path)

        period = self.get_filters().values_list("frequency", flat=True)
        print("count period", period.count())
        for frequency in period:

            result = self.get_filters()
            for i, r in enumerate(result):
                if i == 0:
                    # print(
                    #    "run_filter...",
                    #    self.query_occultation(r, frequency, "2024-12-03"),
                    # )  # .values())

                    run_filter_results = self.query_occultation(r, 1, "2024-12-03")

                    # print(
                    #    "run_filter...",
                    #    self.query_occultation(r, "2024-03-12").values_list(
                    #        "occ_path_coeff", flat=True
                    #    ),
                # chama a função create_csv
                print(
                    "run_filter_results csv",
                    self.create_csv(run_filter_results, tmp_path),
                )

    ##TODO  escrever os resultados em um csv
    # """
    def create_csv(self, filter_results, tmp_path):

        csv_file = os.path.join(tmp_path, "results_filter_subscription.csv")
        print("csv ", csv_file)

        if filter_results:
            results_valid = filter_results.values()

            df = pd.DataFrame(
                # events
                # filter_results.values(),
                results_valid,
                columns=[
                    # "id",
                    # "hash_id",
                    "date_time",
                    "name",
                    "magnitude_drop",
                    "ra_star_candidate",
                    "dec_star_candidate",
                    "velocity",
                    "event_duration",
                    #    "link event",
                ],
            )

            # print("df....", df)
            """
            # Sql Copy com todas as colunas que vão ser importadas e o formato do csv.
            # IMPORTANTA! A ORDEM DAS COLUNAS PRECISA SER IDENTICA A COMO ESTA NO DB!
            query occultation
            {'id', 'hash_id', 'name','number', 'principal_designation', 'alias','base_dynclass', 'dynclass',
            'astorb_dynbaseclass', 'astorb_dynsubclass', 'date_time', 'gaia_source_id', 'ra_star_candidate',
            'dec_star_candidate', 'ra_target','dec_taret', 'closest_approach', 'position_angle', 'velocity', 'delta',
            'g_star', 'j_star', 'h_star', 'k_star', 'long', 'loc_t', 'off_ra', 'off_dec','proper_motion', 'ct', 'multiplicity_flag',
            'e_ra', 'e_dec': 0.021296458, 'pmra': -2.0, 'pmdec': -6.0,'ra_star_deg', 'dec_star_deg', 'ra_target_deg',
            'dec_target_deg': -22.8804161111111, 'magnitude_drop', 'apparent_magnitude', 'apparent_diameter', 'event_duration',
            'moon_separation', 'sun_elongation','instant_uncertainty', 'closest_approach_uncertainty',
            'moon_illuminated_fraction', 'probability_of_centrality', 'closest_approach_uncertainty_km', 'g_mag_vel_corrected',
            'rp_mag_vel_corrected', 'h_mag_vel_corrected', 'ra_star_with_pm', 'dec_star_with_pm', 'ra_star_to_date', 'dec_star_to_date',
            'ra_target_apparent', 'dec_target_apparent', 'e_ra_target', 'e_dec_target', 'ephemeris_version', 'have_path_coeff',
            'occ_path_min_longitude', 'occ_path_max_longitude', 'occ_path_min_latitude', 'occ_path_max_latitude',
            'occ_path_is_nightside', 'occ_path_coeff': {'t0', 't1', 'nightside', 'max_latitude', 'min_latitude', 'max_longitude',
            'min_longitude','coeff_latitude', 'coeff_longitude', 'body_lower_coeff_latitude', 'body_upper_coeff_latitude',
            'body_lower_coeff_longitude', 'body_upper_coeff_longitude'},
            'h': 7.18, 'g': 0.15, 'epoch', 'semimajor_axis', 'eccentricity', 'inclination', 'long_asc_node', 'arg_perihelion',
            'mean_anomaly', 'mean_daily_motion', 'perihelion': 18.0076795, 'aphelion': 28.0182207, 'rms': 0.73, 'last_obs_included',
            'pha_flag', 'mpc_critical_list', 'albedo', 'albedo_err_min', 'albedo_err_max', 'density', 'density_err_min',
            'density_err_max', 'diameter', 'diameter_err_min', 'diameter_err_max', 'mass', 'mass_err_min',
            'mass_err_max', 'catalog', 'predict_step', 'bsp_source', 'obs_source', 'orb_ele_source', 'bsp_planetary',
            'leap_seconds': 'naif0012', 'nima': False, 'created_at','updated_at', 'job_id'}
            sql = (
                f"COPY {self.tbl} (name, number, date_time, ra_star_candidate, dec_star_candidate, "
                "ra_target, dec_target, closest_approach, position_angle, velocity, delta, g, j_star, h, "
                "k_star, long, loc_t, off_ra, off_dec, proper_motion, ct, multiplicity_flag, e_ra, e_dec, "
                "pmra, pmdec, ra_star_deg, dec_star_deg, ra_target_deg, dec_target_deg, created_at, "
                "aparent_diameter, aphelion, apparent_magnitude, dec_star_to_date, dec_star_with_pm, "
                "dec_target_apparent, diameter, e_dec_target, e_ra_target, eccentricity, ephemeris_version, "
                "g_mag_vel_corrected, h_mag_vel_corrected, inclination, instant_uncertainty, magnitude_drop, "
                "perihelion, ra_star_to_date, ra_star_with_pm, ra_target_apparent, rp_mag_vel_corrected, "
                "semimajor_axis, have_path_coeff, occ_path_max_longitude, occ_path_min_longitude, occ_path_coeff, "
                "occ_path_is_nightside, occ_path_max_latitude, occ_path_min_latitude, base_dynclass, bsp_planetary, "
                "bsp_source, catalog, dynclass, job_id, leap_seconds, nima, obs_source, orb_ele_source, predict_step, "
                "albedo, albedo_err_max, albedo_err_min, alias, aphelion_dist, arg_perihelion, astorb_dynbaseclass, "
                "astorb_dynsubclass, density, density_err_max, density_err_min, diameter_err_max, diameter_err_min, "
                "epoch, excentricity, last_obs_included, long_asc_node, mass, mass_err_max, mass_err_min, mean_anomaly, "
                "mean_daily_motion, mpc_critical_list, perihelion_dist, pha_flag, principal_designation, rms, g_star, h_star) "
                "FROM STDIN with (FORMAT CSV, DELIMITER '|', HEADER);"
            )
            """
            # print(i["hash_id"])
            # save.write("http://localhost/prediction-event-detail/%s\n" % i["hash_id"])

            # Escreve o dataframe em arquivo.
            df.to_csv(csv_file, sep=" ", header=True, index=False)
            self.log.info("An archive was created with the Results.")

            # logger.debug("Results File: [%s]" % csv_file)
            print("escrevendo os resultados...")
        else:
            print("Events not found....")

        return csv_file
        # """
