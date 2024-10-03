import os
import sys
from datetime import datetime, time, timezone

import colorlog
from newsletter.models import EventFilter

from tno.models import Occultation
from django.db.models import Q


class ProcessEventFilters:

    def __init__(self, stdout=False):

        self.log = colorlog.getLogger("subscription")
        if stdout:
            consoleFormatter = colorlog.ColoredFormatter("%(log_color)s%(message)s")
            consoleHandler = colorlog.StreamHandler(sys.stdout)
            consoleHandler.setFormatter(consoleFormatter)
            self.log.addHandler(consoleHandler)

    def get_filters(self):
        help = "Busca eventos que correspondem ás preferencias do usuario."
        try:
            data = EventFilter.objects.all().values()
            if data:
                return data
            else:
                return None

        except Exception as e:
            raise Exception(f"Failed to query subscription filters. {e}")

    def query_occultation(self, input, date_start):
        try:
            # filtro por data. Obs, os filtros salvos nao tem data
            # a data será passada no momento de fazer a rodada
            # por exemplo, periodo weekly = data + 7 dias
            # periodo month = data e o mes atual

            date_end = "2025-03-12 15:01:15"
            date_start = datetime.fromisoformat(date_start).astimezone(tz=timezone.utc)
            date_end = datetime.fromisoformat(date_end).astimezone(tz=timezone.utc)

            # query baseado no intervalo temporal
            #TODO: adaptar isso ao intervalo weekly e monthly
            query_occultation = Occultation.objects.filter(
                date_time__range=[date_start, date_end]
            )

            #se magmax e magmin foram definidos, filtra por magnitude
            magmax = input.get("magnitude_max", None)
            magmin = input.get("magnitude_min", None)
            if magmax and magmin:
                query_occultation = query_occultation.filter(
                    g_star__range=[magmin, magmax]
                )

            #TODO: Se filter_type foi definido, filtra por nome, classe ou subclasse
            #TODO: se magdrop foi definido, filtra por magdrop

            # se local_solar_time foi definido
            local_solar_time_after = input.get("local_solar_time_after", None)
            local_solar_time_before = input.get("local_solar_time_before", None)

            if local_solar_time_after and local_solar_time_before:
                datetime_after = datetime.combine(datetime.min, local_solar_time_after)
                datetime_before = datetime.combine(datetime.min, local_solar_time_before)
                time_difference = datetime_before - datetime_after

                if time_difference.seconds >= 0:
                    query_occultation = query_occultation.filter(
                        loc_t__range=[local_solar_time_after, local_solar_time_before]
                    )
                else:
                    after = Q(loc_t__gte=local_solar_time_after, loc_t__lte=time(23, 59, 59.999999))
                    before = Q(loc_t__gte=time(0, 0, 0), loc_t__lte=local_solar_time_before)
                    query_occultation = query_occultation.filter(after | before)
                    
            #TODO: se event_duration foi definido

            #TODO: se diameter_min e diameter_max foram definidos, filtra por diametro

            #TODO: filtra por geofiltro (latitude, longitude, location_radius)

            # print(query_occultation.values()[0])
            if query_occultation:
                return query_occultation
            else:
                return None

        except Exception as e:
            raise Exception(f"Failed to query subscription time. {e}")

    def run_filter(self):
        result = self.get_filters()
        for i, r in enumerate(result):
            if i == 0:
                print(r.keys())
