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


def filter_preferences_user():
    help = "Busca eventos dentro da localidade escolhida pelo usuario."
    mydata = EventFilter.objects.all().values("latitude")

    # loop para comparar as 2 tabelas
    lat = mydata[4]["latitude"]
    #
    print("lat", lat)
    n_events = len(Occultation.objects.all().values())
    # print(n_events)
    events_selected = []
    for i in range(n_events):
        print("entrei no for")
        if "min_latitude" in Occultation.objects.all().values()[i]["occ_path_coeff"]:
            print("O dicionário possui a chave")
            databdall1 = Occultation.objects.all().values()[i]["occ_path_coeff"][
                "min_latitude"
            ]
            print("pesquisei em ocultation")
            if databdall1 <= lat:
                print(databdall1)
                # print(Occultation.objects.all().values()[i])
                events_selected.append(Occultation.objects.all().values()[i])
                print(f"Arquivo selecionado")
            else:
                print(f"Arquivo não esta dentro das corodenadas")

                # montar arquivo csv com os links dos eventos encontrados
                # http://localhost/prediction-event-detail/lm8I7mypaV87HOt1K8QxtQ
                # escrever resultado no arquivo

    # print(events_selected[0]["hash_id"])
    print("n eventos", n_events, " eventos selecionados ", len(events_selected))
    with open("teste.txt", "w+") as save:
        for i in events_selected:
            print(i["hash_id"])
            save.write("http://localhost/prediction-event-detail/%s\n" % i["hash_id"])
        print("OK ...")
