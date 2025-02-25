# #!/usr/bin/python2.7
# # -*- coding: utf-8 -*-

# import collections
# import os

# import pandas as pd
# from sqlalchemy import MetaData, Table, create_engine
# from sqlalchemy.pool import NullPool
# from sqlalchemy.sql import text


# class MissingDBURIException(Exception):
#     pass


# class Dao:
#     engine = None

#     def get_db_uri(self):
#         try:
#             db_uri = os.environ["DB_ADMIN_URI"]
#             return db_uri
#         except:
#             raise MissingDBURIException(
#                 "Required environment variable with URI to access the portal admin database."
#                 "example DB_ADMIN_URI=postgresql+psycopg2://USER:PASS@HOST:PORT/DB_NAME"
#             )

#     def get_db_engine(self):

#         if self.engine is None:

#             self.engine = create_engine(self.get_db_uri(), poolclass=NullPool)

#         return self.engine

#     def get_table(self, tablename, schema=None):
#         engine = self.get_db_engine()
#         tbl = Table(tablename, MetaData(engine), autoload=True, schema=schema)
#         return tbl

#     def fetch_all_dict(self, stm):
#         engine = self.get_db_engine()
#         with engine.connect() as con:

#             queryset = con.execute(stm)

#             rows = []
#             for row in queryset:
#                 d = dict(collections.OrderedDict(row))
#                 rows.append(d)

#             return rows

#     def fetch_one_dict(self, stm):
#         engine = self.get_db_engine()
#         with engine.connect() as con:

#             queryset = con.execute(stm).fetchone()

#             if queryset is not None:
#                 d = dict(collections.OrderedDict(queryset))
#                 return d
#             else:
#                 return None


# # class PredictOccultationJobResultDao(Dao):
# #     def __init__(self):
# #         super(PredictOccultationJobResultDao, self).__init__()

# #         self.tbl = self.get_table("tno_predictionjobresult")

# #     def update(self, id, data):
# #         engine = self.get_db_engine()
# #         with engine.connect() as con:
# #             result = con.execute(self.tbl.update().where(self.tbl.c.id == id), data)
# #             return result.rowcount


# class GaiaDao(Dao):
#     def get_db_uri(self):
#         try:
#             db_uri = os.environ["DB_CATALOG_URI"]
#             return db_uri
#         except:
#             raise MissingDBURIException(
#                 "Required environment variable with URI to access the database where GAIA DR2 is."
#                 "example DB_CATALOG_URI=postgresql+psycopg2://USER:PASS@HOST:PORT/DB_NAME"
#             )

#     # Para alterar o catalogo GAIA para DR3 por exemplo criar uma nova classe igual a essa
#     # e alterar os atributos do catalogo.
#     # e na hora de usar criar um parametro para escolher qual classe instanciar.
#     def __init__(
#         self,
#         name: str,
#         display_name: str,
#         schema: str,
#         tablename: str,
#         ra_property: str,
#         dec_property: str,
#     ):
#         self.internal_name = name
#         self.catalog_name = display_name
#         self.schema = schema
#         self.ra_property = ra_property
#         self.dec_property = dec_property

#         if schema is not None:
#             self.tablename = f"{schema}.{tablename}"
#         else:
#             tablename = tablename

#         self.gaia_properties = [
#             "source_id",
#             "ra",
#             "ra_error",
#             "dec",
#             "dec_error",
#             "parallax",
#             "pmra",
#             "pmra_error",
#             "pmdec",
#             "pmdec_error",
#             "duplicated_source",
#             "phot_g_mean_flux",
#             "phot_g_mean_flux_error",
#             "phot_g_mean_mag",
#             "phot_variable_flag",
#         ]

#         # Quantas posições por query.
#         self.POSITION_GROUP = 5

#     def chunks_positions(self, l, n):
#         n = max(1, n)
#         return (l[i : i + n] for i in range(0, len(l), n))

#     def q3c_clause(self, ra, dec, radius):

#         clause = 'q3c_radial_query("%s", "%s", %s, %s, %s)' % (
#             self.ra_property,
#             self.dec_property,
#             ra,
#             dec,
#             radius,
#         )

#         return clause

#     def mag_max_clause(self, mag_max):

#         clause = "phot_g_mean_mag <= %f" % (mag_max)

#         return clause

#     def catalog_by_positions(self, positions, radius=0.15, max_mag=None):

#         try:

#             columns = ", ".join(self.gaia_properties)

#             df_results = pd.DataFrame()

#             print("GAIA Querys:")
#             print("-----------------------------------")
#             # Agrupar clausulas em grupos para diminuir a quantidade de querys
#             for gpos in self.chunks_positions(positions, self.POSITION_GROUP):
#                 print(gpos)
#                 clauses = []

#                 for pos in gpos:
#                     clauses.append(self.q3c_clause(pos[0], pos[1], radius))

#                 where = " OR ".join(clauses)

#                 if max_mag:
#                     where = "%s AND (%s)" % (self.mag_max_clause(max_mag), where)

#                 stm = """SELECT %s FROM %s WHERE %s """ % (
#                     columns,
#                     self.tablename,
#                     where,
#                 )

#                 print(text(stm))
#                 df_rows = pd.read_sql(text(stm), con=self.get_db_engine())

#                 if df_results is None:
#                     df_results = df_rows
#                 else:
#                     # Concatena o resultado da nova query com os resultados anteriores.
#                     # Tratando possiveis duplicatas.
#                     df_results = (
#                         pd.concat([df_results, df_rows])
#                         .drop_duplicates()
#                         .reset_index(drop=True)
#                     )

#                 del df_rows
#                 del clauses
#             print("-----------------------------------")

#             if df_results.shape[0] >= 2100000:
#                 pass
#                 # self.logger.warning("Stellar Catalog too big")
#                 # TODO marcar o status do Asteroid como warning.
#                 # TODO implementar funcao para dividir o resutado em lista menores e executar em loop.

#             return df_results

#         except Exception as e:
#             # logger.error(e)
#             print(e)
#             raise e

#     def write_gaia_catalog(self, rows, filename):

#         # Propriedades do GAIA http://vizier.u-strasbg.fr/viz-bin/VizieR-3?-source=I/345/gaia2&-out.add=_r
#         # RA_ICRS   = ra                     = 0
#         # e_RA_ICRS = ra_error               = 1
#         # DE_ICRS   = dec                    = 2
#         # e_DE_ICRS = dec_error              = 3
#         # Plx       = parallax               = 4
#         # pmRA      = pmra                   = 5
#         # e_pmRA    = pmra_error             = 6
#         # pmDE      = pmdec                  = 7
#         # e_pmDE    = pmdec_error            = 8
#         # Dup       = duplicated_source      = 9
#         # FG        = phot_g_mean_flux       = 10
#         # e_FG      = phot_g_mean_flux_error = 11
#         # Gmag      = phot_g_mean_mag        = 12
#         # Var       = phot_variable_flag     = 13

#         app_path = os.environ.get("APP_PATH").rstrip("/")
#         data_dir = os.environ.get("DIR_DATA").rstrip("/")

#         output = os.path.join(data_dir, filename)
#         out_link = os.path.join(app_path, filename)

#         magJ, magH, magK = 99.000, 99.000, 99.000
#         JD = 15.0 * 365.25 + 2451545

#         # filename = os.path.join(path, "gaia_catalog.cat")
#         with open(output, "w") as fp:
#             for row in rows:

#                 # Converter os valores nulos para 0
#                 for prop in row:
#                     if row[prop] is None or pd.isna(row[prop]):
#                         row[prop] = 0

#                 fp.write(" ".ljust(64))
#                 fp.write(("%.3f" % row["phot_g_mean_mag"]).rjust(6))
#                 fp.write(" ".ljust(7))
#                 fp.write(" " + ("%.3f" % magJ).rjust(6))
#                 fp.write(" " + ("%.3f" % magH).rjust(6))
#                 fp.write(" " + ("%.3f" % magK).rjust(6))
#                 fp.write(" ".rjust(35))
#                 fp.write(" " + ("%.3f" % (row["pmra"] / 1000.0)).rjust(7))
#                 fp.write(" " + ("%.3f" % (row["pmdec"] / 1000.0)).rjust(7))
#                 fp.write(" " + ("%.3f" % (row["pmra_error"] / 1000.0)).rjust(7))
#                 fp.write(" " + ("%.3f" % (row["pmdec_error"] / 1000.0)).rjust(7))
#                 fp.write(" ".rjust(71))
#                 fp.write(" " + ("%.9f" % (row["ra"] / 15.0)).rjust(13))
#                 fp.write(" " + ("%.9f" % row["dec"]).rjust(13))
#                 fp.write(" ".ljust(24))
#                 fp.write(("%.8f" % JD).rjust(16))
#                 fp.write(" ".ljust(119))
#                 fp.write("  " + ("%.3f" % (row["ra_error"] / 1000.0)).rjust(6))
#                 fp.write("  " + ("%.3f" % (row["dec_error"] / 1000.0)).rjust(6))
#                 fp.write("\n")

#             fp.close()

#         if os.path.exists(output):
#             # Altera permissão do arquivo para escrita do grupo
#             os.chmod(output, 0o664)
#             # Cria um link simbolico no diretório app
#             os.symlink(output, out_link)

#             return output
#         else:
#             raise (Exception("Gaia Catalog file not generated. [%s]" % output))

#     def gaia_catalog_to_csv(self, df_catalog, filename):

#         app_path = os.environ.get("APP_PATH").rstrip("/")
#         data_dir = os.environ.get("DIR_DATA").rstrip("/")

#         output = os.path.join(data_dir, filename)
#         out_link = os.path.join(app_path, filename)

#         df_catalog.to_csv(output, index=False, sep=";")

#         if os.path.exists(output):
#             # Altera permissão do arquivo para escrita do grupo
#             os.chmod(output, 0o664)
#             # Cria um link simbolico no diretório app
#             os.symlink(output, out_link)

#             return output
#         else:
#             raise (Exception("Gaia Catalog file not generated. [%s]" % output))


# # if __name__ == "__main__":
#     # dao = GaiaDao()

#     # print("Teste")

#     # import csv

#     # positions = []
#     # with open('/data/centers_deg.csv', 'r') as csvfile:
#     #     reader = csv.DictReader(csvfile)
#     #     for row in reader:
#     #         positions.append([row['ra'], row['dec']])

#     # df_catalog = dao.catalog_by_positions(positions, radius=0.15)

#     # print(df_catalog.shape[0])
#     # print(df_catalog.head().to_dict('records'))
