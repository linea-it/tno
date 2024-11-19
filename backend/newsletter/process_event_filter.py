import os
import sys
import traceback
from datetime import datetime, time, timedelta, timezone
from pathlib import Path

import colorlog
import pandas as pd
from dateutil.relativedelta import SU, relativedelta
from django.conf import settings
from django.db.models import Q
from newsletter.models import Attachment, EventFilter, Submission

from tno.models import Occultation
from tno.occviz import visibility_from_coeff
from tno.serializers import OccultationSerializer


class ProcessEventFilters:

    def __init__(self, stdout=False):
        self.log = colorlog.getLogger("subscription")

        # Prevent adding multiple handlers if they already exist
        if not self.log.hasHandlers():
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

    def query_occultation(self, date_start, date_end, filter_set):
        """
        Query the occultation table with the filters defined by the user.

        """
        results = []
        try:
            # filtro de ocultações por data
            occultation_queryset = Occultation.objects.filter(
                date_time__range=[date_start, date_end]
            )

            if not occultation_queryset.exists():
                return results

            self.log.info(
                "Number of events after applying time range: %d",
                occultation_queryset.values().count(),
            )

            # Se houver filtro por nome, classe ou subclasse filtra de acordo
            filter_type = filter_set.get("filter_type", None)
            filter_value = filter_set.get("filter_value", None)
            if filter_type == "name":
                objects = filter_value.split(",")
                occultation_queryset = occultation_queryset.filter(name__in=objects)
            elif filter_type == "base_dynclass":
                occultation_queryset = occultation_queryset.filter(
                    base_dynclass=filter_value
                )
            elif filter_type == "dynclass":
                occultation_queryset = occultation_queryset.filter(
                    dynclass=filter_value
                )
            else:
                pass

            self.log.info(
                "Filter type applied: %s", "Empty" if filter_type == "" else filter_type
            )
            self.log.info(
                "Number of events after applying filter type: %d",
                occultation_queryset.values().count(),
            )

            # se magmax estiver definida, filtra por magnitude
            magmax = filter_set.get("magnitude_max", None)
            if magmax:
                occultation_queryset = occultation_queryset.filter(g_star__lte=magmax)
                self.log.info(
                    "Number of events after applying magnitude filter: %d",
                    occultation_queryset.values().count(),
                )

            # se local_solar_time foi definido
            local_solar_time_after = filter_set.get("local_solar_time_after", None)
            local_solar_time_before = filter_set.get("local_solar_time_before", None)
            self.log.info(
                "Local Solar Time: %s - %s",
                local_solar_time_after,
                local_solar_time_before,
            )

            if local_solar_time_after and local_solar_time_before:
                # Filtro por Solar Time 18:00 - 06:00
                after_hour = local_solar_time_after.hour
                after_minute = local_solar_time_after.minute
                before_hour = local_solar_time_before.hour
                before_minute = local_solar_time_before.minute
                after = Q(
                    loc_t__gte=time(after_hour, after_minute, 0),
                    loc_t__lte=time(23, 59, 59),
                )
                before = Q(
                    loc_t__gte=time(0, 0, 0),
                    loc_t__lte=time(before_hour, before_minute, 0),
                )
                occultation_queryset = occultation_queryset.filter(Q(after | before))
                self.log.info(
                    "Number of events after applying local solar time filter: %d",
                    occultation_queryset.values().count(),
                )

            # se event_duration foi definido
            event_duration = filter_set.get("event_duration", None)
            if event_duration:
                occultation_queryset = occultation_queryset.filter(
                    event_duration__gte=event_duration
                )
                self.log.info(
                    "Number of events after applying event duration filter: %d",
                    occultation_queryset.values().count(),
                )

            # se diametro for definido
            diameter_max = filter_set.get("diameter_max", None)
            diameter_min = filter_set.get("diameter_min", None)

            if diameter_max is not None:
                occultation_queryset = occultation_queryset.filter(
                    diameter__lte=diameter_max
                )
            if diameter_min is not None:
                occultation_queryset = occultation_queryset.filter(
                    diameter__gte=diameter_min
                )
            if diameter_max or diameter_min:
                self.log.info(
                    "Number of events after applying diameter filter: %d",
                    occultation_queryset.count(),
                )

            # se incerteza em km foi definida, filtra por incerteza
            uncertainty_km = filter_set.get("closest_approach_uncertainty_km", None)
            if uncertainty_km:
                occultation_queryset = occultation_queryset.filter(
                    closest_approach_uncertainty_km__lte=uncertainty_km
                )
                self.log.info(
                    "Number of events after applying uncertainty filter: %d",
                    occultation_queryset.values().count(),
                )

            # o geofiltro fica definido quando o usuario informa a latitude, a longitude e o raio de busca
            latitude = filter_set.get("latitude", None)
            longitude = filter_set.get("longitude", None)
            loc_radius = filter_set.get("location_radius", None)
            if latitude and longitude and loc_radius:
                # filtar as latitudes
                occultation_queryset = occultation_queryset.filter(
                    occ_path_min_latitude__lte=latitude,
                    occ_path_max_latitude__gte=latitude,
                    occ_path_min_longitude__lte=longitude,
                    occ_path_max_longitude__gte=longitude,
                )
                self.log.info(
                    "Number of events after applying latitude and longitude limits: %d",
                    occultation_queryset.values().count(),
                )

                # para evitar a ocasiação de o occultatio queryset ser vazio
                if occultation_queryset.exists():
                    for prediction in occultation_queryset:
                        is_visible = visibility_from_coeff(
                            latitude=latitude,
                            longitude=longitude,
                            radius=loc_radius,
                            date_time=prediction.date_time,
                            inputdict=prediction.occ_path_coeff,
                            # opcionais
                            # n_elements= 1500,
                            # latitudinal= False
                        )
                        # se for visivel adiciona ao resultado
                        if is_visible:
                            result = OccultationSerializer(prediction).data
                            result["url"] = (
                                settings.SITE_URL
                                + "/prediction-event-detail/"
                                + prediction.hash_id
                            )
                            results.append(result)
                            self.log.warning(
                                "Object %s is visible at %s",
                                prediction.name,
                                prediction.date_time,
                            )
                    self.log.info(
                        "Number of events after applying location visibility filter: %d",
                        len(results),
                    )
                    return results
            else:
                for prediction in occultation_queryset:
                    result = OccultationSerializer(prediction).data
                    result["url"] = (
                        settings.SITE_URL
                        + "/prediction-event-detail/"
                        + prediction.hash_id
                    )
                    results.append(result)
                self.log.info(
                    "Final number of events after applying the filters: %d",
                    len(results),
                )

            return results

        except Exception as e:
            raise Exception(f"Failed to query subscription time. {e}")

    def process_subscription_filter(self, filter_set, output_path, force_run=False):
        self.log.info("Processing subscription filter: %s", filter_set["filter_name"])
        # preciso da identificacao do usuario e do filtro para calcular o processamento
        submission_queryset = Submission.objects.filter(eventFilter_id=filter_set["id"])
        now = datetime.now().astimezone(tz=timezone.utc)
        if submission_queryset.exists():
            latest_processing_date = submission_queryset.latest(
                "process_date"
            ).process_date
        else:
            # se ainda não existir é definido como a data e hora atual
            latest_processing_date = now

        self.log.info("Latest processing date: %s", latest_processing_date)

        # definir as datas inicial e final para o processamento a partir da ultima data de processamento
        # caso mensal processa até 7 dias antes do final do mes
        if filter_set["frequency"] == 1:
            date_start = (latest_processing_date + relativedelta(months=1)).replace(
                day=1, hour=0, minute=0, second=0, microsecond=0
            )
            allow_process = (
                True if (date_start - latest_processing_date).days <= 7 else False
            )
            already_processed = (
                True if (now - latest_processing_date).days < 7 else False
            )
            if force_run:
                date_end = (
                    date_start + relativedelta(months=1) - relativedelta(microseconds=1)
                )
            elif allow_process and not already_processed:
                date_end = (
                    date_start + relativedelta(months=1) - relativedelta(microseconds=1)
                )
            else:
                return None

        # caso semanal, processa até 3 dias antes do final da semana
        # sempre considera o proximo domingo como inicio da semana
        if filter_set["frequency"] == 2:
            date_start = (
                latest_processing_date + relativedelta(weekday=SU(+1))
            ).replace(hour=0, minute=0, second=0, microsecond=0)
            allow_process = (
                True if (date_start - latest_processing_date).days <= 3 else False
            )  # verifica se deve ser processado
            already_processed = (
                True if (now - latest_processing_date).days < 3 else False
            )
            if force_run:
                date_end = (
                    date_start
                    + relativedelta(weekday=SU(+2))
                    - relativedelta(microseconds=1)
                )
            elif allow_process and not already_processed:
                date_end = (
                    date_start
                    + relativedelta(weekday=SU(+2))
                    - relativedelta(microseconds=1)
                )
            else:
                return None

        # caso diario, processa no intervalo de 24 horas
        if filter_set["frequency"] == 3:
            date_start = (latest_processing_date + relativedelta(days=1)).replace(
                hour=0, minute=0, second=0, microsecond=0
            )
            allow_process = (
                True if (date_start - latest_processing_date).seconds < 86400 else False
            )
            already_processed = (
                True if (now - latest_processing_date).seconds < 43200 else False
            )
            if force_run:
                date_end = (
                    date_start + relativedelta(days=1) - relativedelta(microseconds=1)
                )
            elif allow_process and not already_processed:
                date_end = (
                    date_start + relativedelta(days=1) - relativedelta(microseconds=1)
                )
            else:
                return None

        # garantir objeto time zone aware
        date_start = date_start.astimezone(tz=timezone.utc)
        date_end = date_end.astimezone(tz=timezone.utc)

        self.log.info("Processing date range: %s - %s", date_start, date_end)

        results = self.query_occultation(date_start, date_end, filter_set)

        filename = (
            "_".join(filter_set["filter_name"].strip().lower().split())
            + "_"
            + date_start.strftime("%Y%m%d%H%M%S")
            + "_"
            + date_end.strftime("%Y%m%d%H%M%S")
        )

        # salvar o status do processo na tabela submission
        record = Submission(
            eventFilter_id=EventFilter.objects.get(pk=filter_set["id"]),
            process_date=datetime.now(tz=timezone.utc),
            events_count=len(results),
            prepared=True,
            title=filename,
        )
        record.save()

        self.log.info("Updating event processing status.")
        self.create_csv(results, output_path, filename, record.id)

        return None

    def run_filter(self, force_run=False):
        tmp_path = Path("/archive/public/newsletter/")
        if not os.path.exists(tmp_path):
            os.makedirs(tmp_path)
        result = self.get_filters()
        _ = [
            self.process_subscription_filter(r, tmp_path, force_run=force_run)
            for r in result
        ]
        return None

    def create_csv(self, filter_results, tmp_path, name_file, id_submission):
        csv_file = os.path.join(
            tmp_path, name_file + "_results_filter_newsletter.csv"
        ).replace(" ", "_")

        if filter_results:
            df = pd.DataFrame(
                filter_results,
                columns=[
                    "id",
                    "name",
                    "principal_designation",
                    "date_time",
                    "gaia_source_id",
                    "ra_star_candidate",
                    "dec_star_candidate",
                    "closest_approach",
                    "position_angle",
                    "velocity",
                    "delta",
                    "g_star",
                    "magnitude_drop",
                    "instant_uncertainty",
                    "closest_approach_uncertainty_km",
                    "moon_separation",
                    "moon_illuminated_fraction",
                    "sun_elongation",
                    "created_at",
                    "updated_at",
                    "url",
                ],
            )
            df.rename(
                columns={
                    "principal_designation": "provisional_designation",
                    "gaia_source_id": "gaia_dr3_source_id",
                    "ra_star_candidate": "star_ra_icrf",
                    "dec_star_candidate": "star_dec_icrf",
                    "delta": "geocentric_distance",
                    "g_star": "gaia_magnitude",
                },
                inplace=True,
            )
            df.to_csv(csv_file, sep=";", header=True, index=False)
            self.log.info("An archive was created with the Results.")

            try:
                size = os.path.getsize(csv_file)
            except OSError:
                self.log.warning(
                    "Path '%s' does not exist or is inaccessible", csv_file
                )
                sys.exit()

            self.log.info("Size (In bytes) of '%s': %d", csv_file, size)
            csv_name = os.path.join(
                name_file + "_results_filter_newsletter.csv"
            ).replace(" ", "_")
            record = Attachment(
                submission_id=Submission.objects.get(pk=id_submission),
                filename=csv_name,
                size=size,
            )
            self.log.info("Updating status of stored file...")
            record.save()

        return csv_file
