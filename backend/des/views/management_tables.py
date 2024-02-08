from des.models import (
    Observation,
    SkybotByDynclass,
    SkybotByYear,
    SkybotJob,
    SkybotJobResult,
)
from des.models import SkybotPosition as DesSkybotPosition
from des.models import SummaryDynclass
from django.db import connection
from rest_framework.decorators import api_view, renderer_classes
from rest_framework.renderers import JSONRenderer
from rest_framework.response import Response
from skybot.models import Position


@api_view(["POST"])
@renderer_classes((JSONRenderer,))
def clear_des_data_preparation_tables(request):
    """Apaga tadas as tabelas relacionada ao Data Preparation do DES.
    Esta operação não afeta os dados gerados após a etapa de Orbit Trace.
    Quando deve ser usada:
        Durante o Desenvolvimento para apagar todas as rodadas do skybot/orbit trace.
        Quando houver a necessidade de atualizar todos os dados de entrada, com nova informações do skybot.
    Após executar a função:
        Necessário Executar o Skybot para todo o Periodo do DES novamente.
        Necessário Executar o Orbit Trace para as classes de Objetos desejados.
        Necessário Atualizar a lista de Asteroids.
    """
    # TODO: Deveria ser executada apenas por Admin.
    SkybotJobResult.objects.all().delete()
    SummaryDynclass.objects.all().delete()
    SkybotJob.objects.all().delete()
    DesSkybotPosition.objects.all().delete()
    Position.objects.all().delete()
    Observation.objects.all().delete()
    SkybotByDynclass.objects.all().delete()
    SkybotByYear.objects.all().delete()

    with connection.cursor() as cursor:
        sql = "VACUUM (VERBOSE, ANALYZE) skybot_position"
        cursor.execute(sql)

    result = dict(
        {
            "success": True,
        }
    )

    return Response(result)
