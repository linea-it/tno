from tno.db import CatalogDB
import os
from common.convert import sextodec
from datetime import datetime
from django.conf import settings
import parsl
from parsl import *
from pprint import pprint
import csv
from common.jsonfile import JsonFile
import shutil


class StellarCatalog(CatalogDB):
    def __init__(self, pool=True):
        super(StellarCatalog, self).__init__(pool)

        self.catalog = None
        self.radius = 0.05
        self.columns = []
        self.output_path = None

        self.total_count = 0

    def generate_catalog(self, catalog, ephemeris, output_path):

        self.catalog = catalog
        self.radius = 0.5
        self.columns = ["source_id", "ra", "dec", "ra_error", "dec_error", "ref_epoch", "parallax", "parallax_error",
                        "pmra", "pmra_error", "pmdec", "pmdec_error", "phot_g_mean_flux", "phot_g_mean_flux_error",
                        "phot_g_mean_mag", "phot_bp_mean_flux", "phot_bp_mean_flux_error", "phot_rp_mean_flux",
                        "phot_rp_mean_flux_error", "phot_rp_mean_mag", "radial_velocity", "radial_velocity_error",
                        "astrometric_excess_noise", "astrometric_excess_noise_sig"]

        self.output_path = output_path

        t0 = datetime.now()

        # Ler o Arquivo de ephemeris e converter as coordenadas
        if not os.path.exists(ephemeris):
            raise Exception("Ephemeris archive does not exist. [%s]" % ephemeris)

        # Configuracao do Parsl
        try:
            dfk = DataFlowKernel(config=dict(settings.PARSL_CONFIG))
            # Configuracao do Parsl Log.
            # parsl.set_file_logger(os.path.join(output_path, 'stellar_catalog_parsl.log'))

        except Exception as e:
            # self.logger.error(e)
            raise e

        # Declaracao do Parsl APP
        @App('python', dfk)
        def start_parsl_job(line, id):

            result = self.read_ephemeris_line(line)
            if result is not None:

                q_t0 = datetime.now()

                rows = self.execute_query(result)

                q_t1 = datetime.now()
                q_delta = q_t1 - q_t0

                w_t0 = datetime.now()

                count = len(rows)
                self.total_count += count

                if count > 0:
                    filename = self.writer_csv(os.path.join(self.output_path, "stellar_catalog_%s.csv" % id), rows)

                w_t1 = datetime.now()
                w_delta = w_t1 - w_t0

                result.update({'id': id,
                               'rows': count,
                               'query_time': q_delta.total_seconds(),
                               'writer_time': w_delta.total_seconds(),
                               'filename': filename,
                               'file_size': os.path.getsize(filename)
                               })

            return result

        parsl_results = []
        id = 0
        with open(ephemeris) as fp:
            for l in fp:
                line = l.strip()
                if line:
                    parsl_results.append(start_parsl_job(line, id))
                    id += 1

        # Espera o Resultado de todos os jobs.
        outputs = [i.result() for i in parsl_results]

        for i in parsl_results:
            i.done()

        dfk.cleanup()

        # Concat CSVs
        stellar_catalog = self.concat_csvs(os.path.join(self.output_path, "stellar_catalog.csv"), outputs)

        t1 = datetime.now()

        tdelta = t1 - t0

        json_log = dict({
            'catalog_id': self.catalog.id,
            'columns': self.columns,
            'start_time': t0.strftime("%Y-%m-%d %H:%M:%S"),
            'finish_time': t1.strftime("%Y-%m-%d %H:%M:%S"),
            'execution_time': tdelta.total_seconds(),
            'records': self.total_count,
            'count_steps': len(outputs),
            'steps_detail': outputs,
            'filename': stellar_catalog,
            'file_size': os.path.getsize(stellar_catalog)
        })

        JsonFile().write(json_log, os.path.join(self.output_path, 'stellar_log.json'))

        print("Iteracoes: %s" % len(outputs))
        print("Estrelas: %s" % self.total_count)
        print("Terminou: %s" % tdelta)

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

            return result
        else:
            return None

    def execute_query(self, position):

        rows = self.radial_query(
            tablename=self.catalog.tablename,
            schema=self.catalog.schema,
            ra_property=self.catalog.ra_property,
            dec_property=self.catalog.dec_property,
            ra=position.get("ra"),
            dec=position.get("dec"),
            radius=self.radius,
            columns=self.columns,
            limit=None)

        if len(self.columns) == 0 and len(rows) > 0:
            self.columns = rows[0].keys()

        return rows

    def writer_csv(self, filename, rows):
        with open(filename, 'w', newline='') as csvfile:
            fieldnames = self.columns
            writer = csv.DictWriter(csvfile, fieldnames=fieldnames,delimiter=';')
            writer.writerows(rows)

        return filename

    def concat_csvs(self, filename, results):
        with open(filename, 'w', newline='') as csvfile:
            fieldnames = self.columns
            writer = csv.DictWriter(csvfile, fieldnames=fieldnames, delimiter=';')
            writer.writeheader()

            for row in results:
                if row is not None:
                    with open(row.get("filename"), 'r') as readfile:
                        shutil.copyfileobj(readfile, csvfile)

                    os.remove(row.get("filename"))

        return filename
