import os
import sys
from datetime import datetime, time, timedelta, timezone
from pathlib import Path

import colorlog
import pandas as pd
import requests
from django.conf import settings
from django.db.models import Q
from newsletter.models import EventFilter
from newsletter.models.event_filter import EventFilter
from newsletter.views.submission import action

from tno.models import Occultation
from tno.occviz import visibility_from_coeff

# from newsletter.views.submission import list_process


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
            # print("period", frequency)

            if frequency == 1:

                # frequency == 2
                date_end = date_start + timedelta(days=7)

                """
                print(
                    "periodo monthly",
                    frequency,
                    "data inicial",
                    date_start,
                    "data final",
                    date_end,
                )
                """
            else:
                # frequency == 2
                # print("periodo weekly", frequency)
                date_end = date_start + timedelta(days=30)

                """
                print(
                    "periodo weekly",
                    frequency,
                    "data inicial",
                    date_start,
                    "data final",
                    date_end,
                )
                """

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

                    """
                    print(
                        "lat",
                        lat,
                        "lon",
                        long,
                        "radius",
                        radius,
                        "isvisible",
                        is_visible,
                        "events.hash_id",
                        events.hash_id,
                    )
                    """

                    # print("events", e_true)
                    query_occultation = e_true
            # """
            # print("query.....", query_occultation)

            if query_occultation:
                return query_occultation
            else:
                return None

        except Exception as e:
            raise Exception(f"Failed to query subscription time. {e}")

    # roda os filtros comparando com as opções definidas no envent_filter
    def run_filter(self, p):
        # seta caminho para escrever o arquivo
        tmp_path = Path("/archive/newsletter/")
        print("dir... ", tmp_path)

        period = self.get_filters().values_list("frequency", flat=True)

        for frequency in period:
            # frequency 1 == monthly, frequency 2 == weekly
            if frequency == 2:
                result = self.get_filters()
                for i, r in enumerate(result):
                    # if i == 0:
                    run_filter_results = self.query_occultation(
                        r, frequency, "2024-09-01"
                    )

                    # chama a função que escreve o .csv
                    # print("r", result)
                    name_file = result[i]["filter_name"]
                    print(
                        "run_filter_results csv",
                        self.create_csv(run_filter_results, tmp_path, name_file),
                    )
                    id = result[i]["id"]

                    """
                    ## salvar o status do processo na tabela submission
                    ## no momento: dont work 
                    host = settings.SITE_URL.rstrip("/")
                    url = "http:" + host + "/api/submission/list_process/"
                    # url = "http://localhost/api/submission/list_process/"
                    print("url", url)
                    response = requests.get(url)  # action(detail="GET")
                    # Verificar o status e acessar os dados
                    if response.status_code == 200:
                        data = response.json()  # Obter dados em formato JSON
                        print(data)
                    else:
                        print(f"Erro: {response.status_code}")
                    """

    ##TODO  escreve os resultados em um .csv
    def create_csv(self, filter_results, tmp_path, name_file):

        csv_file = os.path.join(
            tmp_path, name_file + "_results_filter_newsletter.csv"
        ).replace(" ", "_")
        # print("csv ", csv_file.strip(" "))

        # print("in csv", vars(filter_results[0]))
        host = settings.SITE_URL.rstrip("/")
        # print(host)

        if filter_results:
            results_valid = vars(filter_results[0])
            link_event = (
                "http:" + host + "/prediction-event-detail/" + results_valid["hash_id"]
            )
            print(link_event)

            # monta um dataframe com os resultados
            df = pd.DataFrame(
                results_valid,
                columns=[
                    "id",
                    "hash_id",
                    "date_time",
                    "name",
                    "magnitude_drop",
                    "ra_star_candidate",
                    "dec_star_candidate",
                    "velocity",
                    "event_duration",
                    # "elevation"
                    link_event,
                ],
                index=[0],
            )

            # Escreve o dataframe em arquivo.
            df.to_csv(csv_file, sep=";", header=True, index=False)
            self.log.info("An archive was created with the Results.")

            # logger.debug("Results File: [%s]" % csv_file)
            print("escrevendo os resultados...")

        else:
            self.log.info("Events not found....")

        return csv_file
