import json
import os
from datetime import datetime, timedelta

from rest_framework import mixins, viewsets
from rest_framework.decorators import action
from rest_framework.response import Response

from des.models import AstrometryJob
from des.serializers import AstrometryJobSerializer
from tno.dao.asteroids import AsteroidDao


class AstrometryJobViewSet(
    mixins.RetrieveModelMixin, mixins.ListModelMixin, viewsets.GenericViewSet
):
    """
    Este end point esta com os metodos de Create, Update, Delete desabilitados.
    estas operações vão ficar na responsabilidades do pipeline des/astrometry.

    o Endpoint submit_job é responsavel por iniciar o pipeline que será executado em background.
    """

    queryset = AstrometryJob.objects.all()
    serializer_class = AstrometryJobSerializer
    ordering_fields = ("id", "status", "start", "finish")
    ordering = ("-start",)

    @action(detail=False, methods=["post"])
    def submit_job(self, request, pk=None):
        """
        Este endpoint apenas cria um novo registro na tabela Des/Astrometry Jobs.

        O Job é criado com status idle. uma daemon verifica
        de tempos em tempos os jobs neste status e inicia o processamento.

        Parameters:
            asteroids (string): Asteroids que serão processados, pode ser um unico asteroid name ou uma lista separada por ;.

            dynclass (string): Dynamic Class para executar todos os asteroids pela classe.

        Returns:
            job (SkybotJobSerializer): Job que acabou de ser criado.
        """
        params = request.data

        asteroids = params.get("asteroids", None)
        dynclass = params.get("dynclass", None)

        # Total de asteroids que serão executados.
        t_asteroids = 0

        if asteroids != None and asteroids != "":
            t_asteroids = len(asteroids.split(";"))
            dynclass = None

        elif dynclass != None and dynclass != "":
            # faz uma query para saber quantos asteroids serão executados.
            t_asteroids = AsteroidDao().count_asteroids_by_base_dynclass(dynclass)
            asteroids = None
        else:
            return Response(
                dict(
                    {
                        "msg": "The two selection parameters asteroids and dynclass cannot be null, one of them must have a value."
                    }
                )
            )

        # Estimativa de tempo baseada na qtd de asteroids a serem executadas.
        # TODO: Calcular o tempo estimado de execução
        estimated_time = 0

        # Recuperar o usuario que submeteu o Job.
        owner = self.request.user

        # Criar um model Skybot Job
        job = AstrometryJob(
            owner=owner,
            # Job começa com Status Idle.
            status=1,
            asteroids=asteroids,
            dynclass=dynclass,
            # Total de asteroids a serem executadas.
            t_asteroids=t_asteroids,
            # Tempo de execução estimado
            estimated_execution_time=timedelta(seconds=estimated_time),
        )
        job.save()

        result = AstrometryJobSerializer(job)

        return Response(result.data)

    # @action(detail=True, methods=['post'])
    # def cancel_job(self, request, pk=None):
    #     """
    #         Aborta um Skybot job,
    #         cria um arquivo com o status 'aborted' e as daemons do pipeline checam este status e cancelam a execução.
    #     """

    #     job = self.get_object()

    #     # Se o job estiver idle=1 ou running=2
    #     if job.status <= 2:

    #         # Criar um arquivo no diretório do Job para indicar ao pipeline que foi abortado.
    #         data = dict({
    #             'status': 'aborted',
    #         })

    #         filepath = os.path.join(job.path, 'status.json')
    #         with open(filepath, 'w') as f:
    #             json.dump(data, f)

    #     result = SkybotJobSerializer(job)
    #     return Response(result.data)

    # def estimate_execution_time(self, to_execute):

    #     dao = DesSkybotJobResultDao(pool=False)

    #     se = dao.skybot_estimate()

    #     try:
    #         average_time = se['t_exec_time'] / int(se['total'])
    #         estimated_time = (int(to_execute) * average_time).total_seconds()

    #     except:
    #         estimated_time = 0

    #     return estimated_time
