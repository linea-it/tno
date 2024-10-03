import os
import sys
from datetime import datetime, time, timezone

import colorlog
from newsletter.models import EventFilter

from tno.models import Occultation


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

    def query_occultation(self):
        try:
            # filtro por data. Obs, os filtros salvos nao tem data
            # a data será passada no momento de fazer a rodada
            # por exemplo, periodo weekly = data + 7 dias
            # periodo month = data e o mes atual

            date_start = "2025-03-12 15:01:15"
            # date_end = "2025-04-12 15:01:15"
            date_start = datetime.fromisoformat(date_start).astimezone(tz=timezone.utc)

            query_occultation = Occultation.objects.filter(
                date_time=date_start,
                have_path_coeff=True,
            )

            """
            # filtro por latitude
            query_occultation = []
            query_occultation_data = Occultation.objects.values()

            for i in query_occultation_data:
                query_occultation.append(i["occ_path_coeff"])
                # query_occultation.append(i["min_latitude"])
            query_occultation = query_occultation
            print("metodo query", query_occultation)  # [0]["min_latitude"])
            # query_occultation = query_occultation.
            #    print(i)

            # query_ocultation = Occultation.objects.filter(
            #    min_latitude="-65.46754083242169",
            # )
            """

            if query_occultation:
                return query_occultation
            else:
                return None

        except Exception as e:
            raise Exception(f"Failed to query subscription time. {e}")

    def run_filter(self):
        result = self.get_filters()
        for r in result:
            print(r)

        result_query = self.query_occultation()
        for rq in result_query:
            # print(rq)
            print("ok")
        # print(result_query)
