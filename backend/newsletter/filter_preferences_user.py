import socket
import sys

from django.core.mail import mail_admins, mail_managers, send_mail
from django.core.management.base import BaseCommand
from django.http import HttpResponse
from django.shortcuts import redirect, render
from django.template import loader
from django.template.loader import render_to_string
from django.utils import timezone
from newsletter.models import EventFilter
from tno.models import Occultation
from tno.views.occultation import OccultationFilter


def filter_preferences_user():
    help = "Busca eventos dentro da localidade escolhida pelo usuario."
    # selec_events = Occultation.objects.filter(
    #    minLtatitude_gte=EventFilter.objects.all().values()[0]["latitude"]
    # )
    # print(selec_events)

    # print("lat", lat)
    n_events = len(EventFilter.objects.all().values())
    n_databdall1 = len(Occultation.objects.all().values())
    # print(n_events)
    events_selected = []

    # print(EventFilter.objects.all().values()[0])
    for i in range(n_events):
        # print("i....", i)
        event_filter_list = EventFilter.objects.all().values()[i]
        # print("mydata ", event_filter_list)
        # loop para comparar as 2 tabelas
        lat = event_filter_list["latitude"]
        print(lat)
        if lat != "None":
            for n in range(n_databdall1):
                # print("entrei no for do n", n)
                if (
                    "min_latitude"
                    in Occultation.objects.all().values()[n]["occ_path_coeff"]
                ):
                    # print("O dicionário possui a chave")
                    allevents = Occultation.objects.all().values()[n]["occ_path_coeff"][
                        "min_latitude"
                    ]
                    # print("pesquisei em ocultation")
                    if allevents <= lat:
                        # print(databdall1)
                        # print(Occultation.objects.all().values()[i])
                        events_selected.append(Occultation.objects.all().values()[n])
                        print(f"Evento selecionado")
                    else:
                        print(f"Evento não esta dentro das corodenadas")

                        # montar arquivo csv com os links dos eventos encontrados
                        # http://localhost/prediction-event-detail/lm8I7mypaV87HOt1K8QxtQ
                        # escrever resultado no arquivo

    # print(events_selected[0]["hash_id"])
    print("n eventos", n_events, " eventos selecionados ", len(events_selected))
    with open("teste.csv", "w+") as save:
        for i in events_selected:
            print(i["hash_id"])
            save.write("http://localhost/prediction-event-detail/%s\n" % i["hash_id"])
        print("OK ...")
