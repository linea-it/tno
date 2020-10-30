from rest_framework import viewsets
from rest_framework.decorators import action
from rest_framework.response import Response

from dashboard.models import SkybotDynclassResult
from dashboard.serializers import SkybotDynclassResultSerializer
from dashboard.dao import SkybotDynclassResultDao
from des.dao import DesSkybotPositionDao

import pandas as pd

import threading

import time

import logging


class SkybotDynclassResultViewSet(viewsets.ModelViewSet):

    queryset = SkybotDynclassResult.objects.all()
    serializer_class = SkybotDynclassResultSerializer
    ordering_fields = ()
    ordering = ('dynclass',)
    filter_fields = ('id', 'dynclass', 'nights', 'ccds',
                     'asteroids', 'positions', 'u', 'g', 'r', 'i', 'z', 'y',)
    search_fields = ('dynclass',)

    def import_result_by_dynclass(self):
        logger = logging.getLogger('skybot')

        start = time.time()

        logger.debug('Start [%s]' % start)

        dynclasses = ['Centaur', 'Comet', 'Hungaria', 'KBO',
                      'MB', 'Mars-Crosser', 'NEA', 'Planet', 'Trojan']

        dpdao = DesSkybotPositionDao(pool=False)
        dddao = SkybotDynclassResultDao(pool=False)

        rows = []

        for dynclass in dynclasses:
            nights = dpdao.count_nights_by_dynclass(dynclass)
            ccds = dpdao.count_ccds_by_dynclass(dynclass)
            asteroids = dpdao.count_asteroids_by_dynclass(dynclass)
            positions = dpdao.count_positions_by_dynclass(dynclass)
            bands = dpdao.count_bands_by_dynclass(dynclass)

            bands_dict = {
                'g': 0,
                'i': 0,
                'r': 0,
                'u': 0,
                'Y': 0,
                'z': 0,
            }

            for band in bands:
                bands_dict = {
                    **bands_dict,
                    band['band']: band['asteroids']
                }

            rows.append({
                'dynclass': dynclass,
                'nights': nights,
                'ccds': ccds,
                'asteroids': asteroids,
                'positions': positions,
                **bands_dict
            })

            logger.debug('%s Row(s)' % len(rows))

        df = pd.DataFrame.from_records(rows, columns=['dynclass', 'nights',
                                                      'ccds', 'asteroids',
                                                      'positions',
                                                      'g', 'i', 'r',
                                                      'u', 'Y', 'z'])

        df.rename(columns={'Y': 'y'})

        SkybotDynclassResult.objects.all().delete()
        logger.debug('Deleted table')

        dddao.import_data(df)
        logger.debug('Imported data into table')

        end = time.time()

        logger.debug('Finished [%s]' % end)

        return rows

    @action(detail=False, methods=['get'])
    def import_dynclass_result(self, request, pk=None):
        """
        Este endpoint faz uma requisição com filtro para cada dynamic class
        e importa no banco na tabela dashboard_skybotdynamicresult.

        Returns:
            success ([bool]): indica se a função foi rodada corretamente.
        """

        results = self.import_result_by_dynclass()

        t = threading.Thread(target=results)
        t.start()

        return Response(results)
