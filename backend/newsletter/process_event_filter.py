import os
import sys
from datetime import datetime, time, timedelta, timezone
from pathlib import Path

import colorlog
import pandas as pd
import requests
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

        try:

            date_end = date_start
            date_start = datetime.fromisoformat(date_start).astimezone(tz=timezone.utc)
            date_end = datetime.fromisoformat(date_end).astimezone(tz=timezone.utc)

            # a data será passada no momento de fazer a rodada
            # por exemplo, periodo weekly = data + 7 dias
            # periodo month = data + 30 dias
            # monta a data de acordo com a frequencia de envio
            # frequency == 1 periodo weekly
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

            # query baseado no intervalo temporal
            # TODO: adaptar isso ao intervalo weekly e monthly
            # print("occultation objects", Occultation.objects.values("hash_id"))
            query_occultation = Occultation.objects.filter(
                date_time__range=[date_start, date_end]
            )

            print("total query occultation date", query_occultation.values().count())

            # TODO filtro por nome
            name = input.get("filter_value", None)
            print("name", name)
            if name:
                query_occultation = query_occultation.filter(name=name)
            print(
                "total query occultation name",
                query_occultation.values().count(),
            )

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

            # radius = self.get_filters().values_list("location_radius", flat=True)
            # print("radius", radius[0])
            # """
            ## array para guardar os eventos filtrados por is_visible
            results = []

            radius = input.get("location_radius", None)  # r  # radius[0]  # 150
            print("r", radius)

            host = settings.SITE_URL.rstrip("/")
            # for r in radius:
            for event in query_occultation:
                # print("query filtered....", events, r)
                long = event.occ_path_min_longitude
                lat = event.occ_path_min_latitude

                is_visible = visibility_from_coeff(
                    latitude=lat,
                    longitude=long,
                    radius=radius,
                    date_time=date_end,
                    inputdict=event.occ_path_coeff,
                    # opcionais
                    # n_elements= 1500,
                    # latitudinal= False
                )
                # print(
                #     "lat",
                #     lat,
                #     "lon",
                #     long,
                #     "radius",
                #     radius,
                #     "isvisible",
                #     is_visible,
                #     "events.hash_id",
                #     event.hash_id,
                # )

                if is_visible:
                    # print("entrei no isvisible")
                    # """
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
                        event.hash_id,
                    )
                    # """
                    link_event = (
                        "http:" + host + "/prediction-event-detail/" + event.hash_id
                    )

                    # print("montando o link....")
                    # print("vars do event", vars(event))
                    result = OccultationSerializer(event).data
                    result["link_event"] = link_event

                    print(link_event)

                    results.append(result)

                    # print("result", result)

            # print("sai do for events....")
            return results

        except Exception as e:
            raise Exception(f"Failed to query subscription time. {e}")

    # roda os filtros comparando com as opções definidas no envent_filter
    def run_filter(self, frequency, date_initial):
        # print("entrei no run_filter....")

        # seta caminho para escrever o arquivo
        tmp_path = Path("/archive/newsletter/")
        # print("dir... ", tmp_path)

        # period = self.get_filters().values_list("frequency", flat=True)

        date_time = date_initial  # "2024-09-01"  # data inicial da rodada

        # frequency 1 == monthly, frequency 2 == weekly
        num_frequency = frequency

        result = self.get_filters()
        # print(num_frequency)

        for i, r in enumerate(result):
            # print("entrei no for enumerate....")
            if result[i]["frequency"] == num_frequency:
                # print("if dentro do enumerate", result[i]["frequency"])
                # define o radius
                radius = self.get_filters().values_list("location_radius", flat=True)[i]
                print("radius", radius)
                filter_results = self.query_occultation(r, num_frequency, date_time)

                # chama a função que escreve o .csv
                # print("r", result)
                name_file = result[i]["filter_name"]

                count = len(filter_results)

                if filter_results:
                    # print("run_filter_results csv")
                    # id = Submission.objects.filter("id")  # [i]['id']
                    print(
                        "submission_id....",
                        Submission.objects.values_list("id", flat=True)[i],
                    )
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
                # print("gravando registro...")
                record.save()

        # print("sai do for enumerate")

    ##TODO  escreve os resultados em um .csv
    def create_csv(self, filter_results, tmp_path, name_file, id_submission):
        # print("entrei no create csv...")

        csv_file = os.path.join(
            tmp_path, name_file + "_results_filter_newsletter.csv"
        ).replace(" ", "_")

        if filter_results:
            # print("filter_results", filter_results)
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

            # logger.debug("Results File: [%s]" % csv_file)
            # print("escrevendo os resultados...")

            # else:
            #    self.log.info("Events not found....")
            # print("sai do create csv...")
            # grava status do arquivo
            try:
                size = os.path.getsize(csv_file)

            except OSError:
                self.log.warning(
                    "Path '%s' does not exists or is inaccessible" % csv_file
                )
                sys.exit()

            print("Size (In bytes) of '% s':" % csv_file, size)

            csv_name = os.path.join(
                name_file + "_results_filter_newsletter.csv"
            ).replace(" ", "_")
            print(csv_name)
            record = Attachment(
                submission_id=Submission.objects.get(pk=id_submission),
                filename=csv_name,
                size=size,
            )
            print("gravando registro...", record)
            record.save()

        return csv_file
