import logging
import os
import urllib.parse

import matplotlib.pyplot as plt
import numpy as np
import pandas as pd
from django.conf import settings
from django.db.models import Count
from django.shortcuts import render
from rest_framework import viewsets
from rest_framework.decorators import action
from rest_framework.response import Response

from tno.models import Pointing

from . import signals
from .models import (
    AstrometryAsteroid,
    AstrometryInput,
    AstrometryOutput,
    Configuration,
    Run,
)
from .serializers import (
    AstrometryAsteroidSerializer,
    AstrometryInputSerializer,
    AstrometryOutputSerializer,
    ConfigurationSerializer,
    RunSerializer,
)

# import numpy as np


class PraiaRunViewSet(viewsets.ModelViewSet):
    queryset = Run.objects.all()
    serializer_class = RunSerializer
    filter_fields = (
        "id",
        "owner",
        "status",
    )
    search_fields = ("id",)
    ordering_fields = ("id", "owner", "status", "start_time", "finish_time")
    ordering = ("-start_time",)

    def perform_create(self, serializer):
        # Adiconar usuario logado
        if not self.request.user.pk:
            raise Exception(
                "It is necessary an active login to perform this operation."
            )
        serializer.save(owner=self.request.user)

    @action(detail=True, methods=["GET"])
    def count_asteroid_status(self, request, pk=None):

        astrometry_run = self.get_object()
        resultset = (
            astrometry_run.asteroids.all()
            .values("status")
            .annotate(total=Count("status"))
            .order_by("total")
        )

        result = dict(
            {
                "success": True,
                "status": {
                    "success": 0,
                    "failure": 0,
                    "warning": 0,
                    "not_executed": 0,
                },
            }
        )

        for status in resultset:
            result["status"][status["status"]] = status["total"]

        return Response(result)

    @action(detail=True, methods=["GET"])
    def step_execution_time(self, request, pk=None):
        """
        Retorna o tempo de execucao de cada etapa do pipeline
        """
        astrometry_run = self.get_object()

        result = dict(
            {
                "success": True,
                "execution_time": {
                    "ccd_images": astrometry_run.execution_ccd_images,
                    "bsp_jpl": astrometry_run.execution_bsp_jpl,
                    "catalog": astrometry_run.execution_catalog,
                    "astrometry": astrometry_run.execution_astrometry,
                },
            }
        )

        return Response(result)


class PraiaConfigurationViewSet(viewsets.ModelViewSet):
    queryset = Configuration.objects.all()
    serializer_class = ConfigurationSerializer
    filter_fields = (
        "id",
        "displayname",
    )
    search_fields = (
        "id",
        "displayname",
    )
    ordering_fields = ("id", "creation_date", "displayname", "owner")
    ordering = ("-creation_date",)

    def perform_create(self, serializer):
        # Adiconar usuario logado
        if not self.request.user.pk:
            raise Exception(
                "It is necessary an active login to perform this operation."
            )
        serializer.save(owner=self.request.user)


class AstrometryAsteroidViewSet(viewsets.ModelViewSet):
    queryset = AstrometryAsteroid.objects.all()
    serializer_class = AstrometryAsteroidSerializer
    search_fields = (
        "name",
        "number",
    )
    filter_fields = (
        "id",
        "astrometry_run",
        "name",
        "number",
        "status",
    )
    ordering_fields = (
        "id",
        "name",
        "number",
    )
    ordering = ("name",)

    @detail_route(methods=["GET"])
    def get_neighbors(self, request, pk=None):

        # Saber qual e o Asteroid
        asteroid = self.get_object()

        # Saber todos os asteroids que estao na mesma rodada deste asteroid.
        # Filtrando a lista de asteroids pelo astrometry_run == asteroid.astrometry_run
        aAsteroids = AstrometryAsteroid.objects.filter(
            astrometry_run=asteroid.astrometry_run
        )

        # Fazer a query para saber qual asteroid esta antes deste.
        # ordernar a lista de asteroids pelo id, e pegar o primeiro asteroid com id menor que id deste asteroid.
        prev_id = None
        try:
            prev_model = aAsteroids.filter(id__lt=asteroid.id).order_by("-id").first()
            prev_id = prev_model.id
        except:
            pass
        # Fazer a query para saber qual asteroid esta depois.
        # Ordenar a lista pelo id, e pega o primeiro asteroid com id maior que este asteroid.
        next_id = None
        try:
            next_model = aAsteroids.filter(id__gt=asteroid.id).order_by("id").first()
            next_id = next_model.id
        except:
            pass

        return Response(
            dict(
                {
                    "success": True,
                    "prev": prev_id,
                    "next": next_id,
                }
            )
        )

    def plotStarsCCD(self, ccd, stars, output):
        try:
            xx = np.concatenate((ccd[1:5], [ccd[1]]))
            yy = np.concatenate((ccd[5:9], [ccd[5]]))

            data = list(filter(lambda x: int(x[2]) == int(ccd[0]), stars))
            ra = [x[0] for x in data]
            dec = [x[1] for x in data]

            plt.figure()

            plt.plot(xx, yy, "k")
            plt.plot(ra, dec, ".r")

            plt.title("CCD %s" % ccd[0])
            plt.xlabel("RA (deg)")
            plt.ylabel("Dec (deg)")

            plt.axes().set_aspect("equal", "datalim")
            plt.savefig(output)
            plt.close()

        except Exception as e:
            raise e

    @detail_route(methods=["GET"])
    def plot_ccd_star(self, request, pk=None):

        # Recuperar a instancia do Asteroid
        asteroid = self.get_object()

        # Descobrir o path para o input do tipo catalog
        catalog = asteroid.input_file.get(input_type="catalog")

        # Descobrir o path para o input ccd_images
        ccd_image_list = asteroid.input_file.get(input_type="ccd_images_list")

        # Executar a funcao que cria o plot, salvar a imagem no dir /archive/tmp
        stars = np.loadtxt(
            catalog.file_path, usecols=(5, 7, 94), skiprows=1, delimiter=";"
        )

        ccds = np.loadtxt(
            ccd_image_list.file_path,
            usecols=(0, 21, 22, 23, 24, 25, 26, 27, 28),
            skiprows=1,
            delimiter=";",
        )

        # ccd = ccds[0]

        # plot_filename = 'ccd_object.png'

        # plot_file_path = os.path.join(settings.MEDIA_TMP_DIR, plot_filename)

        # self.plotStarsCCD(ccd, stars, plot_file_path)
        # plot = ccds_objects(
        #     file_path=plot_file_path,
        #     )

        # plot_filename = 'ccd_object_%s.png' % expnum
        # plot_file_path = os.path.join(settings.MEDIA_TMP_DIR, plot_filename)
        # # retornar a url para o plot.
        # plot_src = urllib.parse.urljoin(settings.MEDIA_TMP_URL, plot_filename)

        result = dict(
            {
                "success": True,
                # 'asteroid': asteroid.name,
                # 'plot_file_path': plot_file_path,
                # 'plot_src': plot_src,
                # 'plot_filename': plot_filename
                # 'teste': ccd_image_list.file_path,
                # 'teste2': catalog.file_path,
                # 'teste3': plot_file_path
            }
        )

        return Response(result)

    @detail_route(methods=["GET"])
    def astrometry_table(self, request, pk=None):
        # Recuperar a instancia do Asteroid
        asteroid = self.get_object()

        try:
            # Recuperar o filepath para o arquivo de Astrometria, um dos resultados do pipeline
            output = asteroid.ast_outputs.get(type="astrometry")
            filepath = os.path.join(asteroid.relative_path, output.filename)

            # Ler o arquivo
            df = pd.read_csv(
                filepath,
                header=None,
                delim_whitespace=True,
            )

            rows = []
            for record in df.itertuples():
                ra = "%s:%s:%s" % (
                    "{:02d}".format(int(record[1])),
                    "{:02d}".format(int(record[2])),
                    "{0:.4f}".format(float(record[3])),
                )

                dec = "%s:%s:%s" % (
                    "{:02d}".format(int(record[4])),
                    "{:02d}".format(int(record[5])),
                    "{0:.3f}".format(float(record[6])),
                )

                row = dict(
                    {
                        "ra": ra,
                        "dec": dec,
                        "mag": float("{0:.3f}".format(record[7])),
                        "julian_date": record[8],
                        "obs_code": record[9],
                        "catalog_code": record[10],
                    }
                )

                rows.append(row)

            result = dict(
                {
                    "success": True,
                    "rows": rows,
                }
            )

            return Response(result)

        except AstrometryOutput.DoesNotExist as e:
            return Response(
                dict(
                    {
                        "success": False,
                        "rows": [],
                        "msg": "There is no Astrometry result for this asteroid.",
                    }
                )
            )

    @detail_route(methods=["GET"])
    def outputs_by_ccd(self, request, pk=None):
        # Recuperar a instancia do Asteroid
        asteroid = self.get_object()

        # Parametro tree indica se o resultado vai ser retornado em tabela, ou arvore
        # no caso de arvore, os outputs estao agrupados por ccd.
        tree = bool(request.query_params.get("tree", False))

        # Recuperar o filepath para o arquivo de Astrometria, um dos resultados do pipeline
        queryset = asteroid.ast_outputs.filter(ccd_image__isnull=False)

        # Recuperar informacao do ccd.
        # TODO: o campo ccd_image e o id da tabela pointing,
        # talvez seja melhor fazer uma chave estrangeira nesta coluna ou usar expnum,ccd_num, band

        # Todos os diferentes apontamentos (CCDs)
        distinct_ids = queryset.values_list("ccd_image", flat=True).distinct(
            "ccd_image"
        )

        # converter os ids para inteiro
        distinct_ids = [int(x) for x in distinct_ids]

        # Recuperar na tabela pointings todos os apontamentos.
        pointings = Pointing.objects.filter(id__in=distinct_ids)

        data = []
        if tree:
            for pointing in pointings:
                outputs = queryset.filter(ccd_image=pointing.pk)
                serializer = AstrometryOutputSerializer(outputs, many=True)
                node = dict(
                    {
                        "pointing_id": pointing.pk,
                        "ccd_filename": pointing.filename,
                        "expnum": pointing.expnum,
                        "ccd_num": pointing.ccdnum,
                        "band": pointing.band,
                        "count_outputs": outputs.count(),
                        "outputs": serializer.data,
                    }
                )

                data.append(node)

        else:
            serializer = AstrometryOutputSerializer(queryset, many=True)

            rows = serializer.data

            # Adicionar o pointing filename a cada output
            for row in rows:
                pointing = pointings.get(pk=int(row.get("ccd_image")))
                row.update({"ccd_filename": pointing.filename})

            data = rows

        result = dict(
            {
                "success": True,
                "rows": data,
                "count_ccds": pointings.count(),
                "count_outputs": queryset.count(),
            }
        )

        return Response(result)

    @detail_route(methods=["GET"])
    def main_outputs(self, request, pk=None):
        # Recuperar a instancia do Asteroid
        asteroid = self.get_object()

        # Recuperar o filepath para o arquivo de Astrometria, um dos resultados do pipeline
        queryset = asteroid.ast_outputs.filter(ccd_image__isnull=True)

        # Adicionar informacoes do apontamento em cada output
        serializer = AstrometryOutputSerializer(queryset, many=True)
        rows = serializer.data

        result = dict(
            {
                "success": True,
                "rows": rows,
            }
        )

        return Response(result)

    @detail_route(methods=["GET"])
    def plot_ccd(self, request, pk=None):
        # Recuperar a instancia do Asteroid
        asteroid = self.get_object()

        # Recuperar todos os plots para este asteroid
        queryset = asteroid.ast_outputs.filter(type="astrometry_plot")

        # Recuperar informacao do ccd.
        # TODO: o campo ccd_image e o id da tabela pointing,
        # talvez seja melhor fazer uma chave estrangeira nesta coluna ou usar expnum,ccd_num, band

        # Todos os diferentes apontamentos (CCDs)
        distinct_ids = queryset.values_list("ccd_image", flat=True).distinct(
            "ccd_image"
        )

        # converter os ids para inteiro
        distinct_ids = [int(x) for x in distinct_ids]

        # Recuperar na tabela pointings todos os apontamentos.
        pointings = Pointing.objects.filter(id__in=distinct_ids)

        # Adicionar informacoes do apontamento em cada output
        serializer = AstrometryOutputSerializer(queryset, many=True)
        rows = serializer.data
        for row in rows:
            pointing = pointings.get(pk=int(row.get("ccd_image")))
            row.update(
                {
                    "ccd_filename": pointing.filename,
                    "expnum": pointing.expnum,
                    "ccd_num": pointing.ccdnum,
                    "band": pointing.band,
                    "src": urllib.parse.urljoin(
                        settings.MEDIA_URL, row.get("file_path").strip("/")
                    ),
                }
            )

        result = dict(
            {
                "success": True,
                "rows": rows,
            }
        )

        return Response(result)

    @detail_route(methods=["GET"])
    def plot_time_profile(self, request, pk=None):
        """
        Returns an object with the file's path, columns of the CSV and its rows.
        Endpoint created to setup the a time profile plot.
        """
        try:
            # Get the asteroid's instance:
            asteroid = self.get_object()

            # Get the file's path:
            filepath = os.path.join(asteroid.relative_path, "time_profile.csv")

            columns = ["object", "start", "finish", "execution_time", "ccd", "stage"]

            # Read the file:
            df = pd.read_csv(filepath, delimiter=",")

            # Fill non-numeric values with 0:
            df = df.fillna(0)

            # Parse dataframe to list:
            rows = df.values.tolist()

            return Response(
                dict(
                    {
                        "success": True,
                        "filepath": filepath,
                        "columns": columns,
                        "rows": rows,
                    }
                )
            )

        except AstrometryOutput.DoesNotExist as e:
            return Response(
                dict(
                    {
                        "success": False,
                        "rows": [],
                        "msg": "There is no Astrometry result for this asteroid.",
                    }
                )
            )


class AstrometryInputViewSet(viewsets.ModelViewSet):
    queryset = AstrometryInput.objects.all()
    serializer_class = AstrometryInputSerializer
    search_fields = ("filename",)
    filter_fields = (
        "id",
        "asteroid",
        "filename",
    )
    ordering_fields = (
        "id",
        "asteroid",
    )
    ordering = ("asteroid",)


class AstrometryOutputViewSet(viewsets.ModelViewSet):
    queryset = AstrometryOutput.objects.all()
    serializer_class = AstrometryOutputSerializer
    search_fields = ("filename",)
    filter_fields = ("id", "asteroid", "filename", "type", "ccd_image")
    ordering_fields = (
        "id",
        "asteroid",
    )
    ordering = ("asteroid",)
