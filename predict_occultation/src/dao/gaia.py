#!/usr/bin/python2.7
# -*- coding: utf-8 -*-

import collections
import os

import numpy as np
import pandas as pd
from sqlalchemy import MetaData, Table, create_engine
from sqlalchemy.pool import NullPool
from sqlalchemy.sql import text


def compute_strip_boundaries(ra, dec, angdiam):
    """
    Compute the upper and lower boundaries of a strip centered on a given RA/Dec path.

    The boundaries are computed by projecting the RA/Dec coordinates to a tangent plane,
    calculating the normal vector to the path, offsetting by half the angular diameter, and
    then transforming back to celestial coordinates.

    Parameters:
        ra (array-like): Right ascension values in degrees.
        dec (array-like): Declination values in degrees.
        angdiam (float): Angular diameter (width of the strip) in degrees.

    Returns:
        tuple: A tuple containing:
            - (ra_upper, dec_upper): Arrays of RA and Dec for the upper boundary (in degrees).
            - (ra_lower, dec_lower): Arrays of RA and Dec for the lower boundary (in degrees).
    """
    ra = np.array(ra)
    dec = np.array(dec)
    ra_rad = np.radians(ra)
    dec_rad = np.radians(dec)

    # Project to a tangent plane: x corresponds to RA adjusted by cos(dec), y corresponds to Dec.
    x = ra_rad * np.cos(dec_rad)
    y = dec_rad

    # Compute gradients along the center line to get the tangent vector.
    dx = np.gradient(x)
    dy = np.gradient(y)
    norm = np.sqrt(dx**2 + dy**2)
    tx = dx / norm
    ty = dy / norm
    # Rotate tangent vector by 90° to obtain the normal vector.
    nx = -ty
    ny = tx

    # Compute half the angular diameter in radians.
    half_width = np.radians(angdiam) / 2

    # Offset the center line by the normal vector to obtain upper and lower boundaries.
    x_upper = x + half_width * nx
    y_upper = y + half_width * ny
    x_lower = x - half_width * nx
    y_lower = y - half_width * ny

    # Convert the projected coordinates back to RA and Dec.
    ra_upper = x_upper / np.cos(y_upper)
    ra_lower = x_lower / np.cos(y_lower)

    return (np.degrees(ra_upper), np.degrees(y_upper)), (
        np.degrees(ra_lower),
        np.degrees(y_lower),
    )


def build_ra_dec_chunks(ra, dec, angular_diameter, chunk_size=1, overlap=10):
    """
    Divide RA, Dec, and angular diameter arrays into chunks based on a distance threshold.

    The function iterates over the input arrays and creates chunks when the Euclidean distance
    between the starting point of the current chunk and a subsequent point exceeds the given
    chunk_size (in degrees). An extra element is included for overlap between chunks.

    Parameters:
        ra (array-like): Right ascension values in degrees.
        dec (array-like): Declination values in degrees.
        angular_diameter (array-like): Angular diameter values in degrees.
        chunk_size (float): Distance threshold (in degrees) to start a new chunk.
        overlap (int): Overlap between chunks.

    Returns:
        tuple: Three lists containing the RA, Dec, and angular diameter chunks.
    """
    ra = np.array(ra)
    dec = np.array(dec)
    angular_diameter = np.array(angular_diameter)
    n = len(ra)

    chunks_ra = []
    chunks_dec = []
    chunks_angdiam = []

    i_start = 0

    for i in range(1, n):
        if (
            np.sqrt((ra[i] - ra[i_start]) ** 2 + (dec[i] - dec[i_start]) ** 2)
            >= chunk_size
        ):
            i_end = min(
                i + overlap, n
            )  # Ensure the overlap doesn't exceed array bounds
            chunks_ra.append(ra[i_start:i_end])
            chunks_dec.append(dec[i_start:i_end])
            chunks_angdiam.append(angular_diameter[i_start:i_end])
            i_start = max(
                i - overlap, i
            )  # Ensure overlap inclusion without getting stuck

    # Append the remaining elements if not yet included
    if i_start < n:
        chunks_ra.append(ra[i_start:])
        chunks_dec.append(dec[i_start:])
        chunks_angdiam.append(angular_diameter[i_start:])

    return chunks_ra, chunks_dec, chunks_angdiam


def compute_polygons(ra, dec, angular_diameter):
    """
    Compute a complex polygon and a simplified quadrilateral enclosing the data.

    Parameters:
        ra (array-like): Right ascension values in degrees.
        dec (array-like): Declination values in degrees.
        angular_diameter (float): Angular diameter in degrees.

    Returns:
        tuple: A tuple containing:
            - complex_polygon (numpy.ndarray): Full boundary polygon.
            - simplified_polygon (numpy.ndarray): A quadrilateral (4 vertices).
    """
    (ra_upper, dec_upper), (ra_lower, dec_lower) = compute_strip_boundaries(
        ra, dec, angular_diameter
    )

    # Construir polígono complexo
    upper_forward = np.column_stack((ra_upper, dec_upper))
    lower_reversed = np.column_stack((ra_lower[::-1], dec_lower[::-1]))
    complex_polygon = np.vstack(
        [upper_forward, lower_reversed, upper_forward[0]]
    )  # Fechar o polígono

    # Criar conjunto de pontos para simplificação
    all_points = np.vstack([upper_forward, lower_reversed])

    # Calcular matriz de covariância para encontrar os eixos principais
    mean_ra, mean_dec = np.mean(all_points, axis=0)
    centered_points = all_points - [mean_ra, mean_dec]
    cov_matrix = np.dot(centered_points.T, centered_points) / (len(all_points) - 1)

    # Calcular autovalores e autovetores
    eigenvalues, eigenvectors = np.linalg.eig(cov_matrix)
    sorted_indices = np.argsort(eigenvalues)[::-1]
    principal_axes = eigenvectors[:, sorted_indices]

    # Transformar pontos para o espaço dos eixos principais
    transformed_points = np.dot(centered_points, principal_axes)

    # Encontrar limites mínimos e máximos no novo sistema de coordenadas
    min_x, max_x = np.min(transformed_points[:, 0]), np.max(transformed_points[:, 0])
    min_y, max_y = np.min(transformed_points[:, 1]), np.max(transformed_points[:, 1])

    # Definir os 4 vértices do retângulo mínimo
    box_corners = np.array(
        [
            [min_x, min_y],
            [min_x, max_y],
            [max_x, max_y],
            [max_x, min_y],
            [min_x, min_y],  # Fechar quadrilátero
        ]
    )

    # Reverter a transformação para o espaço original de RA/Dec
    simplified_polygon = np.dot(box_corners, principal_axes.T) + [mean_ra, mean_dec]

    return complex_polygon, simplified_polygon


class MissingDBURIException(Exception):
    pass


class Dao:
    engine = None

    def get_db_uri(self):
        try:
            db_uri = os.environ["DB_CATALOG_URI"]
            return db_uri
        except:
            raise MissingDBURIException(
                "Required environment variable with URI to access the database where GAIA DR2 is."
                "example DB_CATALOG_URI=postgresql+psycopg2://USER:PASS@HOST:PORT/DB_NAME"
            )

    def get_db_engine(self):

        if self.engine is None:

            self.engine = create_engine(self.get_db_uri(), poolclass=NullPool)

        return self.engine

    def get_table(self, tablename, schema=None):
        engine = self.get_db_engine()
        tbl = Table(tablename, MetaData(engine), autoload=True, schema=schema)
        return tbl

    def fetch_all_dict(self, stm):
        engine = self.get_db_engine()
        with engine.connect() as con:

            queryset = con.execute(stm)

            rows = []
            for row in queryset:
                d = dict(collections.OrderedDict(row))
                rows.append(d)

            return rows

    def fetch_one_dict(self, stm):
        engine = self.get_db_engine()
        with engine.connect() as con:

            queryset = con.execute(stm).fetchone()

            if queryset is not None:
                d = dict(collections.OrderedDict(queryset))
                return d
            else:
                return None


class GaiaDao(Dao):

    # Para alterar o catalogo GAIA para DR3 por exemplo criar uma nova classe igual a essa
    # e alterar os atributos do catalogo.
    # e na hora de usar criar um parametro para escolher qual classe instanciar.
    def __init__(
        self,
        name: str,
        display_name: str,
        schema: str,
        tablename: str,
        ra_property: str,
        dec_property: str,
    ):
        self.internal_name = name
        self.catalog_name = display_name
        self.schema = schema
        self.ra_property = ra_property
        self.dec_property = dec_property

        if schema is not None:
            self.tablename = f"{schema}.{tablename}"
        else:
            tablename = tablename

        self.gaia_properties = [
            "source_id",
            "ra",
            "ra_error",
            "dec",
            "dec_error",
            "parallax",
            "pmra",
            "pmra_error",
            "pmdec",
            "pmdec_error",
            "duplicated_source",
            "phot_g_mean_flux",
            "phot_g_mean_flux_error",
            "phot_g_mean_mag",
            "phot_variable_flag",
        ]

        # Quantas posições por query.
        self.POSITION_GROUP = 5

    def chunks_positions(self, l, n):
        n = max(1, n)
        return (l[i : i + n] for i in range(0, len(l), n))

    def q3c_clause(self, ra, dec, radius):

        clause = 'q3c_radial_query("%s", "%s", %s, %s, %s)' % (
            self.ra_property,
            self.dec_property,
            ra,
            dec,
            radius,
        )

        return clause

    def mag_max_clause(self, mag_max):

        clause = "phot_g_mean_mag <= %f" % (mag_max)

        return clause

    def catalog_by_polygons(self, ra, dec, angular_diameter, max_mag=18):
        try:
            columns = ", ".join(self.gaia_properties)
            df_results = pd.DataFrame()

            print("GAIA Querys:")
            print("-----------------------------------")
            # Agrupar clausulas em grupos para diminuir a quantidade de querys

            # Create the polygons for q3c query
            chunks_ra, chunks_dec, chunks_angdiam = build_ra_dec_chunks(
                ra, dec, angular_diameter, chunk_size=1, overlap=5
            )

            polygons = []
            for cra, cdec, angdiam in zip(chunks_ra, chunks_dec, chunks_angdiam):
                _, spol = compute_polygons(
                    cra,
                    cdec,
                    angdiam,
                )
                polygons.append(spol)

            # Build queries
            n_chunks = len(polygons)
            for i, chunk in enumerate(polygons):
                where_clause = 'q3c_poly_query("ra", "dec", ARRAY['
                for pos in chunk:
                    where_clause += f"[{pos[0]}, {pos[1]}], "
                where_clause = where_clause[:-2] + "])"
                if i == 0:
                    q3c_radial = f' OR q3c_radial_query("ra", "dec", {chunk[0][0]}, {chunk[0][1] - (chunk[0][1] - chunk[-1][1])/2}, {abs(chunk[-1][1]-chunk[-2][1])})'
                elif i == n_chunks - 1:
                    q3c_radial = f' OR q3c_radial_query("ra", "dec", {chunk[0][0]}, {chunk[1][1] + (chunk[2][1] - chunk[1][1])/2}, {abs(chunk[2][1]-chunk[1][1])})'
                else:
                    q3c_radial = ""

                where_clause = where_clause + q3c_radial

                if max_mag:
                    where_clause = "%s AND (%s)" % (
                        self.mag_max_clause(max_mag),
                        where_clause,
                    )

                stm = """SELECT %s FROM %s WHERE %s """ % (
                    columns,
                    self.tablename,
                    where_clause,
                )

                print(text(stm))
                df_rows = pd.read_sql(text(stm), con=self.get_db_engine())

                if df_results is None:
                    df_results = df_rows
                else:
                    # Concatena o resultado da nova query com os resultados anteriores.
                    # Tratando possiveis duplicatas.
                    df_results = (
                        pd.concat([df_results, df_rows])
                        .drop_duplicates(subset=["source_id"])
                        .reset_index(drop=True)
                    )

                del df_rows
            print("-----------------------------------")

            if df_results.shape[0] >= 2100000:
                pass
                # self.logger.warning("Stellar Catalog too big")
                # TODO marcar o status do Asteroid como warning.
                # TODO implementar funcao para dividir o resutado em lista menores e executar em loop.

            return df_results

        except Exception as e:
            print(e)
            return None

    # Build final query
    def catalog_by_positions(self, positions, radius=0.15, max_mag=None):

        try:

            columns = ", ".join(self.gaia_properties)

            df_results = pd.DataFrame()

            print("GAIA Querys:")
            print("-----------------------------------")
            # Agrupar clausulas em grupos para diminuir a quantidade de querys
            for gpos in self.chunks_positions(positions, self.POSITION_GROUP):
                print(gpos)
                clauses = []

                for pos in gpos:
                    clauses.append(self.q3c_clause(pos[0], pos[1], radius))

                where = " OR ".join(clauses)

                if max_mag:
                    where = "%s AND (%s)" % (self.mag_max_clause(max_mag), where)

                stm = """SELECT %s FROM %s WHERE %s """ % (
                    columns,
                    self.tablename,
                    where,
                )

                print(text(stm))
                df_rows = pd.read_sql(text(stm), con=self.get_db_engine())

                if df_results is None:
                    df_results = df_rows
                else:
                    # Concatena o resultado da nova query com os resultados anteriores.
                    # Tratando possiveis duplicatas.
                    df_results = (
                        pd.concat([df_results, df_rows])
                        .drop_duplicates()
                        .reset_index(drop=True)
                    )

                del df_rows
                del clauses
            print("-----------------------------------")

            if df_results.shape[0] >= 2100000:
                pass
                # self.logger.warning("Stellar Catalog too big")
                # TODO marcar o status do Asteroid como warning.
                # TODO implementar funcao para dividir o resutado em lista menores e executar em loop.

            return df_results

        except Exception as e:
            # logger.error(e)
            print(e)
            raise e

    def write_gaia_catalog(self, rows, filename):

        # Propriedades do GAIA http://vizier.u-strasbg.fr/viz-bin/VizieR-3?-source=I/345/gaia2&-out.add=_r
        # RA_ICRS   = ra                     = 0
        # e_RA_ICRS = ra_error               = 1
        # DE_ICRS   = dec                    = 2
        # e_DE_ICRS = dec_error              = 3
        # Plx       = parallax               = 4
        # pmRA      = pmra                   = 5
        # e_pmRA    = pmra_error             = 6
        # pmDE      = pmdec                  = 7
        # e_pmDE    = pmdec_error            = 8
        # Dup       = duplicated_source      = 9
        # FG        = phot_g_mean_flux       = 10
        # e_FG      = phot_g_mean_flux_error = 11
        # Gmag      = phot_g_mean_mag        = 12
        # Var       = phot_variable_flag     = 13

        app_path = os.environ.get("APP_PATH").rstrip("/")
        data_dir = os.environ.get("DIR_DATA").rstrip("/")

        output = os.path.join(data_dir, filename)
        out_link = os.path.join(app_path, filename)

        magJ, magH, magK = 99.000, 99.000, 99.000
        JD = 15.0 * 365.25 + 2451545

        # filename = os.path.join(path, "gaia_catalog.cat")
        with open(output, "w") as fp:
            for row in rows:

                # Converter os valores nulos para 0
                for prop in row:
                    if row[prop] is None or pd.isna(row[prop]):
                        row[prop] = 0

                fp.write(" ".ljust(64))
                fp.write(("%.3f" % row["phot_g_mean_mag"]).rjust(6))
                fp.write(" ".ljust(7))
                fp.write(" " + ("%.3f" % magJ).rjust(6))
                fp.write(" " + ("%.3f" % magH).rjust(6))
                fp.write(" " + ("%.3f" % magK).rjust(6))
                fp.write(" ".rjust(35))
                fp.write(" " + ("%.3f" % (row["pmra"] / 1000.0)).rjust(7))
                fp.write(" " + ("%.3f" % (row["pmdec"] / 1000.0)).rjust(7))
                fp.write(" " + ("%.3f" % (row["pmra_error"] / 1000.0)).rjust(7))
                fp.write(" " + ("%.3f" % (row["pmdec_error"] / 1000.0)).rjust(7))
                fp.write(" ".rjust(71))
                fp.write(" " + ("%.9f" % (row["ra"] / 15.0)).rjust(13))
                fp.write(" " + ("%.9f" % row["dec"]).rjust(13))
                fp.write(" ".ljust(24))
                fp.write(("%.8f" % JD).rjust(16))
                fp.write(" ".ljust(119))
                fp.write("  " + ("%.3f" % (row["ra_error"] / 1000.0)).rjust(6))
                fp.write("  " + ("%.3f" % (row["dec_error"] / 1000.0)).rjust(6))
                fp.write("\n")

            fp.close()

        if os.path.exists(output):
            # Altera permissão do arquivo para escrita do grupo
            os.chmod(output, 0o664)
            # Cria um link simbolico no diretório app
            os.symlink(output, out_link)

            return output
        else:
            raise (Exception("Gaia Catalog file not generated. [%s]" % output))

    def gaia_catalog_to_csv(self, df_catalog, filename):

        app_path = os.environ.get("APP_PATH").rstrip("/")
        data_dir = os.environ.get("DIR_DATA").rstrip("/")

        output = os.path.join(data_dir, filename)
        out_link = os.path.join(app_path, filename)

        df_catalog.to_csv(output, index=False, sep=";")

        if os.path.exists(output):
            # Altera permissão do arquivo para escrita do grupo
            os.chmod(output, 0o664)
            # Cria um link simbolico no diretório app
            os.symlink(output, out_link)

            return output
        else:
            raise (Exception("Gaia Catalog file not generated. [%s]" % output))


# if __name__ == "__main__":
# dao = GaiaDao()

# print("Teste")

# import csv

# positions = []
# with open('/data/centers_deg.csv', 'r') as csvfile:
#     reader = csv.DictReader(csvfile)
#     for row in reader:
#         positions.append([row['ra'], row['dec']])

# df_catalog = dao.catalog_by_positions(positions, radius=0.15)

# print(df_catalog.shape[0])
# print(df_catalog.head().to_dict('records'))
