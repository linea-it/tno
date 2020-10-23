import json
import os
from datetime import datetime, timedelta

import pandas as pd

from rest_framework import viewsets
from rest_framework.decorators import action
from rest_framework.response import Response

from des.models import SummaryDynclass, SkybotJob
from des.serializers import SummaryDynclassSerializer
from des.dao import DesSkybotJobResultDao, DesSummaryDynclassDao

import threading

import logging


class SummaryDynclassViewSet(viewsets.ModelViewSet):

    queryset = SummaryDynclass.objects.all()
    serializer_class = SummaryDynclassSerializer
    ordering_fields = ('id', 'job', 'dynclass', 'asteroids', 'ccds', 'positions', 'u', 'g', 'r', 'i', 'z', 'y')
    ordering = ('job',)
    filter_fields = ('id', 'job', 'dynclass',)
    search_fields = ('id', 'job', 'dynclass',)

    def delete_table(self, model):
        model.objects.all().delete()

    def run_update(self):
        logger = logging.getLogger("skybot")

        logger.debug('Started des_summarydynclass update')

        # Deletando todas as informações da tabela des_summarydynclass
        self.delete_table(SummaryDynclass)

        logger.debug('Deleted everything from des_summarydynclass table')

        # Lista de IDs de todos Jobs
        job_ids = SkybotJob.objects.values_list('id', flat=True)

        daoJobResult = DesSkybotJobResultDao(pool=False)
        daoSummaryDynclass = DesSummaryDynclassDao(pool=False)

        for job_id in job_ids:
            logger.debug('Running for Job ID [%s]' % job_id)

            asteroids = daoJobResult.dynclass_asteroids_by_job(job_id)

            if(len(asteroids) > 0):
                ccds = daoJobResult.dynclass_ccds_by_job(job_id)
                positions = daoJobResult.dynclass_positions_by_job(job_id)

                df_asteroids = pd.DataFrame(asteroids)
                df_asteroids.set_index('dynclass')
                df_asteroids = df_asteroids.fillna(0)

                df_ccds = pd.DataFrame(ccds)
                df_ccds.set_index('dynclass')
                df_ccds = df_ccds.fillna(0)

                df_positions = pd.DataFrame(positions)
                df_positions.set_index('dynclass')
                df_positions = df_positions.fillna(0)

                df = pd.concat([df_asteroids, df_ccds, df_positions], axis=1)
                df = df.fillna(0)

                df['g'] = 0
                df['r'] = 0
                df['i'] = 0
                df['z'] = 0
                df['Y'] = 0
                df['u'] = 0

                # Remove as colunas duplicadas
                df = df.loc[:, ~df.columns.duplicated()]

                for i in range(len(df)):
                    dynclass = str(df.iloc[i, 0])
                    bands = daoJobResult.dynclass_band_by_job(job_id, dynclass)

                    for band in bands:
                        df.at[i, str(band['band'])] = int(band['positions'])

                df = df.rename(columns={'Y': 'y'})
                df['job_id'] = job_id

                if not df.isnull().values.any():
                    daoSummaryDynclass.import_data(df)
                    logger.debug('Data imported!')

        logger.debug('Finished with success!')

    # @action(detail=False, methods=['get'])
    # def update_summary_dynclass(self, request, pk=None):
    #     """Retorna a quantidade de objetos unicos, ccds e posições agrupados por dynamic class.

    #     Exemplo: http://localhost/api/des/summary_dynclass/update_summary_dynclass/

    #     Returns:
    #         [bool]: um True se correu tudo bem com o update na tabela
    #     """

    #     run_update = self.run_update()

    #     t = threading.Thread(target=run_update)
    #     t.setDaemon(True)
    #     t.start()

    #     return Response({
    #         'success': True
    #     })

