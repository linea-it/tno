from tno.db import CatalogDB
import os
from common.convert import sextodec
from datetime import datetime
from django.conf import settings
import parsl
from parsl import *

class StellarCatalog(CatalogDB):
    def generate_catalog(self, ephemeris, output_path):
        print("TESTE")

        print("Converte")
        ra_hms = "10 25 34.3312"
        dec_hms = "-00 27 44.998"

        print("RA: %s -> %s" % (ra_hms, (15 * sextodec(ra_hms))))
        print("Dec: %s -> %s" % (dec_hms, sextodec(dec_hms)))

        t0 = datetime.now()

        # Ler o Arquivo de ephemeris e converter as coordenadas
        if not os.path.exists(ephemeris):
            raise Exception("Ephemeris archive does not exist. [%s]" % ephemeris)


        # Configuracao do Parsl
        try:
            dfk = DataFlowKernel(config=dict(settings.PARSL_CONFIG))
        except Exception as e:
            # self.logger.error(e)
            raise e

        # # Configuracao do Parsl Log.
        # parsl.set_file_logger(os.path.join(output_path, 'stellar_catalog_parsl.log'))
        #
        # # Declaracao do Parsl APP
        # @App('python', dfk)
        # def start_parsl_job(line):
        #
        #     result = self.read_ephemeris_line(line)
        #
        #     return result
        #
        # results = []
        # count = 0
        # with open(ephemeris) as fp:
        #     for l in fp:
        #         line = l.strip()
        #         if line:
        #             results.append(start_parsl_job(line))
        #
        #             count += 1
        #
        # # Espera o Resultado de todos os jobs.
        # outputs = [i.result() for i in results]
        #
        # for i in results:
        #     i.done()
        #
        # dfk.cleanup()

        # t1 = datetime.now()
        #
        # tdelta = t1 - t0
        # print("Count: %s" % count)
        # print("Terminou: %s" % tdelta)

    def read_ephemeris_line(self, line):

        result = dict({
            "date": None,
            "ra": None,
            "dec": None,
            "ra_hms": None,
            "dec_hms": None
        })

        date = line[0:68].strip()
        if len(date) == 24:
            ra_hms = line[68:83].strip()
            dec_hms = line[83:131].strip()

            result.update({
                "date": date,
                "ra_hms": ra_hms,
                "dec_hms": dec_hms,
                # multiplica RA por 15 para transformar de decimal para graus
                "ra": (15 * sextodec(ra_hms)),
                "dec": sextodec(dec_hms),
            })

            # print(result)

    def teste(self):
        pass


"""
Tempo sem paralelismo
Count: 525601
Terminou: 0:00:05.584710
"""
