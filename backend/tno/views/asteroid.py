import logging

from rest_framework import viewsets
from rest_framework.decorators import action
from rest_framework.permissions import IsAuthenticated, AllowAny
from rest_framework.response import Response

from tno.dao.asteroids import AsteroidDao
from tno.models import Asteroid, Occultation, PredictionJobResult
from des.models import Observation
from tno.serializers import AsteroidSerializer
from rest_framework.pagination import PageNumberPagination

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
        """Apaga todos os Asteroids e seus resultados do banco de dados. 
        Utilizada duranto o desenvolvimento dos pipelines ou quando se deseja gerar novos resultados.
        Isso implica em perder todos os resultados gerados pelas etapas posteriores ao Skybot Discovery que são:
            Orbit Trace: Cada posição encontrada pelo pipeline é associada a um Asteroid. Todos os registros na tabela DES_OBSERVATION serão apagados.
            Predict Occultation: Toda Ocultação encontrada pelo pipeline é associada a um Asteroid. Todos os registros na tabela TNO_OCCULTATION serão apagados.
        
        Após está operação será necessário:
            Update Asteroid Table: Executar o função "Update Asteroid Table" para gerar novamente a lista de Asteroids.
            Orbit Trace: Executar o pipeline "Orbit Trace" para gerar novos registros de Observações na tabela DES_OBSERVATION.
            Predict Occultation: Executar o pipeline "Predict Occultation" para gerar novos resultados de Predição de Ocultação registrados na tabela TNO_OCCULTATION.
        """
        # TODO: Deveria ser executada apenas por Admin.
        # Deleta todas as observações de posições de asteroids no DES.
        Observation.objects.all().delete()
        # Deleta todas as ocultações antes de apagar os asteroids
        Occultation.objects.all().delete()
        Asteroid.objects.all().delete()

        return Response(dict({"success": True}))        

    @action(
        detail=False, methods=["GET"], permission_classes=(AllowAny,)
    )
    def dynclasses(self, request):
        """All Dynamic Classes.
        Distinct dynclass in tno_asteroid table.
        """

        rows = AsteroidDao(pool=False).distinct_dynclass()

        return Response(dict({"results": rows, "count": len(rows)}))        

    @action(
        detail=False, methods=["GET"], permission_classes=(AllowAny,)
    )
    def base_dynclasses(self, request):
        """All Base Dynamic Classes.
        Distinct base_dynclass in tno_asteroid table.
        Base Dynamic Class is dynclass split in >
        """

        rows = AsteroidDao(pool=False).distinct_base_dynclass()

        return Response(dict({"results": rows, "count": len(rows)}))  

    @action(detail=False, methods=["get"], permission_classes=(AllowAny,))
    def with_prediction(self, request):
        """
        #     Este endpoint obtem o asteroids com ao menos uma predicao.

        #     Returns:
        #         result (json): asteroid list.
        #     """
        paginator = PageNumberPagination()
        paginator.page_size = 100
        predictions = PredictionJobResult.objects.all()
        filtro = self.request.query_params.get('name', None)
        
        if filtro:
            aa = Asteroid.objects.filter(name__icontains=filtro, id__in=predictions.values('asteroid__id'))
        else:
            aa = Asteroid.objects.filter(id__in=predictions.values('asteroid__id'))  
        result_page = paginator.paginate_queryset(aa, request)
        serializer = AsteroidSerializer(result_page, many=True)
        return paginator.get_paginated_response(serializer.data)


    @action(detail=False, methods=["get"], permission_classes=(AllowAny,))
    def search(self, request):
        """
        #     Este endpoint obtem o lista de asteroids filtrada por parte do nome.

        #     Returns:
        #         result (json): asteroid list.
        #     """
        paginator = PageNumberPagination()
        paginator.page_size = 100
        aa = Asteroid.objects.filter(name__icontains=self.request.query_params.get('name', None))
        result_page = paginator.paginate_queryset(aa, request)
        serializer = AsteroidSerializer(result_page, many=True)
        return paginator.get_paginated_response(serializer.data)
        