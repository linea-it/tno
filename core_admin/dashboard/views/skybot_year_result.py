from rest_framework import viewsets
from rest_framework.decorators import action
from rest_framework.response import Response

from dashboard.models import SkybotYearResult
from dashboard.serializers import SkybotYearResultSerializer

from des.dao import ExposureDao, CcdDao, DesSkybotJobResultDao
from dashboard.dao import SkybotYearResultDao

import pandas as pd
from datetime import datetime
import threading

import time

import logging


class SkybotYearResultViewSet(viewsets.ModelViewSet):

    queryset = SkybotYearResult.objects.all()
    serializer_class = SkybotYearResultSerializer
    ordering_fields = ()
    ordering = ('year',)
    filter_fields = ('id', 'year', 'nights', 'exposures', 'ccds',
                     'nights_analyzed', 'exposures_analyzed', 'ccds_analyzed',)
    search_fields = ('year',)

    def import_results_by_year(self):

        logger = logging.getLogger('skybot')

        start = time.time()

        logger.debug('Start [%s]' % start)

        # Years to run
        years = {
            '2012': ['2012-11-10', '2012-12-31'],
            '2013': ['2013-01-01', '2013-12-31'],
            '2014': ['2014-01-01', '2014-12-31'],
            '2015': ['2015-01-01', '2015-12-31'],
            '2016': ['2016-01-01', '2016-12-31'],
            '2017': ['2017-01-01', '2017-12-31'],
            '2018': ['2018-01-01', '2018-12-31'],
            '2019': ['2019-01-01', '2019-12-31'],
        }

        epdao = ExposureDao(pool=False)
        ccdao = CcdDao(pool=False)
        dsdao = DesSkybotJobResultDao(pool=False)
        dydao = SkybotYearResultDao(pool=False)

        rows = []

        for year in years:
            logger.debug('Year [%s]: Start [%s], End [%s]' %
                         (year, years[year][0], years[year][1]))

            start = datetime.strptime(
                years[year][0], '%Y-%m-%d').strftime("%Y-%m-%d 00:00:00")

            end = datetime.strptime(
                years[year][1], '%Y-%m-%d').strftime("%Y-%m-%d 23:59:59")

            # Total nights with exposures by period
            nights = epdao.count_nights_by_period(start, end)

            # Total exposures by period
            exposures = epdao.count_exposures_by_period(start, end)

            # Total CCDs with exposures by period
            ccds = ccdao.count_ccds_by_period(start, end)

            # Total nights analyzed by period
            nights_analyzed = dsdao.count_nights_analyzed_by_period(
                start, end)

            # Total exposures analyzed by period
            exposures_analyzed = dsdao.count_exposures_analyzed_by_period(
                start, end)

            # Total ccds analyzed by period
            ccds_analyzed = dsdao.count_ccds_analyzed_by_period(start, end)

            rows.append({
                'year': year,
                'nights': nights,
                'exposures': exposures,
                'ccds': ccds,
                'nights_analyzed': nights_analyzed,
                'exposures_analyzed': exposures_analyzed,
                'ccds_analyzed': ccds_analyzed,
            })

            logger.debug('%s Row(s)' % len(rows))

        df = pd.DataFrame.from_records(rows, columns=[
                                       'year', 'nights', 'exposures', 'ccds',
                                       'nights_analyzed', 'exposures_analyzed',
                                       'ccds_analyzed'])

        # Clear table
        SkybotYearResult.objects.all().delete()
        logger.debug('Deleted table')

        # Import data
        dydao.import_data(df)
        logger.debug('Imported data into table')

        end = time.time()

        logger.debug('Finished [%s]' % end)

        return rows

    @action(detail=False, methods=['get'])
    def import_year_result(self, request, pk=None):
        """
        Este endpoint faz uma requisição com filtro, between, para cada ano
        e importa no banco na tabela dashboard_skybotyearresult.

        Returns:
            success ([bool]): indica se a função foi rodada corretamente.
        """
        results = self.import_results_by_year()

        t = threading.Thread(target=results)
        t.start()

        return Response({
            'success': True
        })
