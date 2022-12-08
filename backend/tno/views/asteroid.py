import logging

from rest_framework import viewsets
from rest_framework.decorators import action
from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response

from tno.dao.asteroids import AsteroidDao
from tno.models import Asteroid, Occultation
from des.models import Observation
from tno.serializers import AsteroidSerializer

from datetime import datetime
import humanize


class AsteroidViewSet(viewsets.ReadOnlyModelViewSet):

    queryset = Asteroid.objects.all()
    serializer_class = AsteroidSerializer
    filter_fields = ("number", "name")

    @action(
        detail=False, methods=["POST", "GET"], permission_classes=(IsAuthenticated,)
    )
    def update_asteroid_table(self, request):
        """Esta função é utilizada para povoar a tabela Asteroid.
        Faz uma query nas tabelas de resultados do skybot, e efetua um insert/update
        na tabela asteroid, inserindo informações de Nome, numero, classe

        Returns:
            dict: {
                "success": bool,
                "count_before": int Quantidade de Asteroids antes do Insert/Update,
                "count_after": int Quantidade de Asteroids depois do Insert/Update,
                "new_asteroids": int Quantidade de novos Asteroids,
                "execution_time": str Tempo de execução,
                "h_execution_time": str Tempo de execução Humanizado
            }
        """
        # TODO: Deveria ser executada apenas por Admin.
        try:
            t0 = datetime.now()

            log = logging.getLogger("asteroids")

            log.info("--------------------------------------------------------")
            log.info("Update Asteroid Table Started!")

            dao = AsteroidDao(pool=False)

            count_before = dao.count()
            log.info(f"Total Asteroid Before Update: [{count_before}]")

            count_affected = dao.insert_update()

            count_after = dao.count()
            log.info(f"Total Asteroid After Update: [{count_after}]")

            log.info(f"Affected Rows: [{count_affected}]")

            new_asteroids = count_after - count_before
            log.info(f"New Asteroids: {new_asteroids}")

            t1 = datetime.now()
            tdelta = t1 - t0

            result = dict(
                {
                    "success": True,
                    "count_before": count_before,
                    "count_after": count_after,
                    "new_asteroids": new_asteroids,
                    "execution_time": tdelta,
                    "h_execution_time": str(
                        humanize.naturaldelta(tdelta, minimum_unit="seconds")
                    ),
                }
            )

            return Response(result)

        except Exception as e:
            # TODO Implementar error handling
            pass

    @action(
        detail=False, methods=["GET"], permission_classes=(IsAuthenticated,)
    )
    def count_asteroid_table(self, request):

        count = Asteroid.objects.count()

        return Response(dict({"count":count}))

    @action(
        detail=False, methods=["POST"], permission_classes=(IsAuthenticated,)
    )
    def delete_all(self, request):
        # Deleta todas as observações de posições de asteroids no DES.
        Observation.objects.all().delete()
        # Deleta todas as ocultações antes de apagar os asteroids
        Occultation.objects.all().delete()
        Asteroid.objects.all().delete()

        return Response(dict({"success": True}))        