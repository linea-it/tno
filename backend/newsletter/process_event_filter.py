import os
import sys
from datetime import datetime, time, timedelta, timezone
from pathlib import Path

import colorlog
import pandas as pd
from django.conf import settings
from django.db.models import Q
from newsletter.models import Attachment, EventFilter, Submission
from tno.models import Occultation
from tno.occviz import visibility_from_coeff
from tno.serializers import OccultationSerializer


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
        """
        Query the occultation table with the filters defined by the user.

        Parameters:
        input (dict): The filters defined by the user.
        frequency (int): The frequency defined by the user. 1 for monthly, 2 for weekly.
        date_start (str): The start date of the period to be queried.
        """

        try:

            date_end = date_start
            date_start = datetime.fromisoformat(date_start).astimezone(tz=timezone.utc)
            date_end = datetime.fromisoformat(date_end).astimezone(tz=timezone.utc)

            # a data é passada no momento de fazer a rodada
            # por exemplo, periodo weekly = data + 7 dias
            # periodo month = data + 30 dias
            # monta a data de acordo com a frequencia de envio
            # frequency == 2 periodo weekly
            if frequency == 2:

                date_end = date_start + timedelta(days=7)

                print(
                    "periodo weekly",
                    frequency,
                    "data inicial",
                    date_start,
                    "data final",
                    date_end,
                )

            else:
                # frequency == 1 periodo monthly
                date_end = date_start + timedelta(days=30)

                print(
                    "periodo monthly",
                    frequency,
                    "data inicial",
                    date_start,
                    "data final",
                    date_end,
                )

            # filtro de ocultações por data
            query_occultation = Occultation.objects.filter(
                date_time__range=[date_start, date_end]
            )

            print("total query occultation date", query_occultation.values().count())

            # Se houver filtro por nome, classe ou subclasse filtra de acordo
            filter_type = input.get("filter_type", None)
            filter_value = input.get("filter_value", None)
            if filter_type == "name":
                objects = filter_value.split(",")
                query_occultation = query_occultation.filter(name__in=objects)
                # query_occultation = query_occultation.filter(name=filter_value)
            elif filter_type == "base_dynclass":
                query_occultation = query_occultation.filter(base_dynclass=filter_value)
            elif filter_type == "dynclass":
                query_occultation = query_occultation.filter(dynclass=filter_value)
            else:
                pass

            print(
                f"total query after filter type {filter_type}: {filter_value}",
                query_occultation.values().count(),
            )

            # se magmax e magmin foram definidos, filtra por magnitude
            magmax = input.get("magnitude_max", None)
            # magmin = input.get("magnitude_min", None)
            if magmax:
                query_occultation = query_occultation.filter(g_star__lte=magmax)
            print("total query occultation mag", query_occultation.values().count())

            # se local_solar_time foi definido
            local_solar_time_after = input.get("local_solar_time_after", None)
            local_solar_time_before = input.get("local_solar_time_before", None)

            print(local_solar_time_after, local_solar_time_before)
            if local_solar_time_after and local_solar_time_before:
                # Filtro por Solar Time 18:00 - 06:00
                after = Q(loc_t__gte=time(18, 0, 0), loc_t__lte=time(23, 59, 59))
                before = Q(loc_t__gte=time(0, 0, 0), loc_t__lte=time(6, 0, 0))
                query_occultation = query_occultation.filter(Q(after | before))

            print("total query occultation lst", query_occultation.values().count())

            # se event_duration foi definido
            event_duration = input.get("event_duration", None)
            print("event_duration", event_duration)
            if event_duration:
                query_occultation = query_occultation.filter(
                    event_duration__gte=event_duration
                )
            print("total query occultation event", query_occultation.values().count())

            # se diameter_min e diameter_max foram definidos, filtra por diametro
            diameter_err_min = input.get("diameter_err_min", None)
            diameter_err_max = input.get("diameter_err_max", None)

            if diameter_err_min and diameter_err_max:
                query_occultation = query_occultation.filter(
                    diameter__range=[diameter_err_min, diameter_err_max]
                )
            print("total query occultation diam", query_occultation.values().count())

            # filtra por geofiltro (latitude, longitude, location_radius)
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

            # filtro por geolocation
            ## array para guardar os eventos filtrados por is_visible
            results = []

            radius = input.get("location_radius", None)  # r  # radius[0]  # 150
            print("r", radius)

            host = settings.SITE_URL.rstrip("/")

            for event in query_occultation:
                long = input.get("longitude", None)
                lat = input.get("latitude", None)
                # print('ok')
                is_visible = visibility_from_coeff(
                    latitude=lat,
                    longitude=long,
                    radius=radius,
                    date_time=event.date_time,
                    inputdict=event.occ_path_coeff,
                    # opcionais
                    # n_elements= 1500,
                    # latitudinal= False
                )
                # print('success', is_visible)
                if is_visible:
                    print(
                        event.date_time,
                        event.name,
                        is_visible,
                        event.hash_id,
                    )

                    link_event = (
                        "http:" + host + "/prediction-event-detail/" + event.hash_id
                    )

                    result = OccultationSerializer(event).data
                    result["link_event"] = link_event

                    self.log.info("Append result")

                    results.append(result)

            return results

        except Exception as e:
            raise Exception(f"Failed to query subscription time. {e}")

    # roda os filtros comparando com as opções definidas no envent_filter
    def run_filter(self, frequency, date_start):
        # seta caminho para escrever o arquivo
        tmp_path = Path("/archive/public/newsletter/")

        # cria diretorio se nao existir
        if not os.path.exists(tmp_path):
            os.makedirs("/archive/public/newsletter/")

        # frequency 1 == monthly, frequency 2 == weekly
        num_frequency = frequency

        result = self.get_filters()

        for i, r in enumerate(result):
            if result[i]["frequency"] == num_frequency:
                # radius = self.get_filters().values_list("location_radius", flat=True)[i]

                filter_results = self.query_occultation(r, num_frequency, date_start)

                # chama a função que escreve o .csv
                name_file = result[i]["filter_name"]

                count = len(filter_results)

                if filter_results:
                    id_submission = Submission.objects.values_list("id", flat=True)[i]
                    self.create_csv(
                        filter_results,
                        tmp_path,
                        name_file,
                        id_submission,
                    )
                else:
                    self.log.warning("Events not found....")

                ## salvar o status do processo na tabela submission
                id = result[i]["id"]
                record = Submission(
                    eventFilter_id=EventFilter.objects.get(pk=id),
                    process_date=datetime.now(tz=timezone.utc),
                    events_count=count,
                    prepared=True,
                    title=name_file,
                )
                self.log.info(
                    "Atualizando o status do processamento dos eventos encontrados."
                )
                record.save()

    ##escreve os resultados em um .csv
    def create_csv(self, filter_results, tmp_path, name_file, id_submission):

        csv_file = os.path.join(
            tmp_path, name_file + "_results_filter_newsletter.csv"
        ).replace(" ", "_")

        if filter_results:
            # monta um dataframe com os resultados
            # print("monta dataframe...")
            df = pd.DataFrame(
                filter_results,
                columns=[
                    "id",
                    "hash_id",
                    "date_time",
                    "name",
                    "number",
                    "base_dynclass",
                    "dynclass",
                    "ra_star_candidate",
                    "dec_star_candidate",
                    "closest_approach",
                    "position_angle",
                    "velocity",
                    "delta",
                    "g_star",
                    "long",
                    "loc_t",
                    "off_ra",
                    "off_dec",
                    "proper_motion",
                    "ra_star_deg",
                    "dec_star_deg",
                    "magnitude_drop",
                    "apparent_magnitude",
                    "event_duration",
                    "link_event",
                    "moon_separation",
                    "sun_elongation",
                    "instant_uncertainty",
                    "closest_approach_uncertainty",
                    "moon_illuminated_fraction",
                    "closest_approach_uncertainty_km",
                    "g",
                    "semimajor_axis",
                    "eccentricity",
                    "inclination",
                    "perihelion",
                    "aphelion",
                    "diameter",
                    "catalog",
                    "created_at",
                ],
                # index=[0],
            )

            # Escreve o dataframe em arquivo.
            df.to_csv(csv_file, sep=";", header=True, index=False)
            self.log.info("An archive was created with the Results.")

            try:
                size = os.path.getsize(csv_file)

            except OSError:
                self.log.warning(
                    "Path '%s' does not exists or is inaccessible" % csv_file
                )
                sys.exit()

            print(f"Size (In bytes) of '% s':" % csv_file, size)

            csv_name = os.path.join(
                name_file + "_results_filter_newsletter.csv"
            ).replace(" ", "_")

            record = Attachment(
                submission_id=Submission.objects.get(pk=id_submission),
                filename=csv_name,
                size=size,
            )
            self.log.info("Atualizando status do arquivo armazenado...")
            record.save()

        return csv_file
