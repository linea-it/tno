# from sqlalchemy.dialects import postgresql
import io
import uuid

import pandas as pd
from dao.db_base import DBBase
from sqlalchemy.dialects.postgresql import insert
from sqlalchemy.sql import and_, delete, text


def occultations_upsert(table, conn, keys, data_iter):

    data = [dict(zip(keys, row)) for row in data_iter]

    insert_statement = insert(table.table).values(data)
    upsert_statement = insert_statement.on_conflict_do_update(
        constraint=f"tno_occultation_hash_id_key",
        set_={c.key: c for c in insert_statement.excluded},
    )
    # print(upsert_statement.compile(dialect=postgresql.dialect()))
    result = conn.execute(upsert_statement)
    return result.rowcount


class OccultationDao(DBBase):
    def __init__(self):
        super(OccultationDao, self).__init__()

        self.tbl = self.get_table("tno_occultation")

    def delete_by_job_id(self, job_id):
        stm = delete(self.tbl).where(self.tbl.c.job_id == job_id)

        engine = self.get_db_engine()
        with engine.connect() as con:
            rows = con.execute(stm)

            return rows

    def delete_by_asteroid_name(self, name):

        stm = delete(self.tbl).where(and_(self.tbl.c.name == name))

        engine = self.get_db_engine()
        with engine.connect() as con:
            rows = con.execute(stm)

            return rows

    def delete_by_asteroid_name_period(
        self, name: str, start_period: str, end_period: str
    ):

        stm = delete(self.tbl).where(
            and_(
                self.tbl.c.name == name,
                self.tbl.c.date_time.between(start_period, end_period),
            )
        )

        engine = self.get_db_engine()
        with engine.connect() as con:
            result = con.execute(stm)
            rows = result.rowcount
            return rows

    # def import_occultations(self, columns: list, data):
    def import_occultations(self, data):

        # Sql Copy com todas as colunas que vão ser importadas e o formato do csv.
        # IMPORTANTE! A ORDEM DAS COLUNAS PRECISA SER IDENTICA A COMO ESTA NO DB!
        # sql = (
        #     f"COPY {self.tbl} ({', '.join(columns)}) "
        #     "FROM STDIN with (FORMAT CSV, DELIMITER '|', HEADER);"
        # )

        sql = (
            f"COPY {self.tbl} (name, number, date_time, gaia_source_id, ra_star_candidate, dec_star_candidate, ra_target, dec_target, closest_approach, position_angle, velocity, delta, g, j_star, h, k_star, long, loc_t, off_ra, off_dec, proper_motion, ct, multiplicity_flag, e_ra, e_dec, pmra, pmdec, ra_star_deg, dec_star_deg, ra_target_deg, dec_target_deg, created_at, apparent_diameter, aphelion, apparent_magnitude, dec_star_to_date, dec_star_with_pm, dec_target_apparent, diameter, e_dec_target, e_ra_target, eccentricity, ephemeris_version, g_mag_vel_corrected, h_mag_vel_corrected, inclination, instant_uncertainty, magnitude_drop, perihelion, ra_star_to_date, ra_star_with_pm, ra_target_apparent, rp_mag_vel_corrected, semimajor_axis, have_path_coeff, occ_path_max_longitude, occ_path_min_longitude, occ_path_coeff, occ_path_is_nightside, occ_path_max_latitude, occ_path_min_latitude, base_dynclass, bsp_planetary, bsp_source, catalog, dynclass, job_id, leap_seconds, nima, predict_step, albedo, albedo_err_max, albedo_err_min, alias, arg_perihelion, astorb_dynbaseclass, astorb_dynsubclass, density, density_err_max, density_err_min, diameter_err_max, diameter_err_min, epoch, last_obs_included, long_asc_node, mass, mass_err_max, mass_err_min, mean_anomaly, mean_daily_motion, mpc_critical_list, pha_flag, principal_designation, rms, g_star, h_star, event_duration, moon_separation, sun_elongation, closest_approach_uncertainty, moon_illuminated_fraction, probability_of_centrality, hash_id, closest_approach_uncertainty_km) "
            "FROM STDIN with (FORMAT CSV, DELIMITER '|', HEADER);"
        )

        rowcount = self.import_with_copy_expert(sql, data)

        return rowcount

    def upinsert_occultations(self, df, conn=None):
        prepared = self._prepare_upsert_dataframe(df)

        if conn is not None:
            rowcount = prepared.to_sql(
                "tno_occultation",
                con=conn,
                if_exists="append",
                method=occultations_upsert,
                index=False,
            )
            return rowcount

        engine = self.get_db_engine()
        with engine.connect() as conn:
            rowcount = prepared.to_sql(
                "tno_occultation",
                con=conn,
                if_exists="append",
                method=occultations_upsert,
                index=False,
            )
            return rowcount

    def _prepare_upsert_dataframe(self, df):
        """Apply audit timestamp policy used by all upsert paths."""
        now_utc = pd.to_datetime("now", utc=True)
        prepared = df.copy()
        prepared["updated_at"] = now_utc
        if "created_at" not in prepared.columns:
            prepared["created_at"] = now_utc
        return prepared

    @staticmethod
    def _quote_sql_identifier(name):
        """Quote SQL identifiers used in dynamic COPY/UPSERT statements."""
        return f'"{str(name).replace(chr(34), chr(34) * 2)}"'

    def _copy_dataframe_to_temp_table(self, conn, tmp_table, prepared, insert_columns):
        quoted_insert_columns = [
            self._quote_sql_identifier(col) for col in insert_columns
        ]
        copy_columns_sql = ", ".join(quoted_insert_columns)
        copy_sql = (
            f"COPY {self._quote_sql_identifier(tmp_table)} ({copy_columns_sql}) "
            "FROM STDIN WITH (FORMAT CSV, NULL '\\N')"
        )
        copy_buffer = io.StringIO()
        prepared.loc[:, insert_columns].to_csv(
            copy_buffer,
            index=False,
            header=False,
            na_rep="\\N",
        )
        copy_buffer.seek(0)

        dbapi_connection = conn.connection
        cursor = dbapi_connection.cursor()
        try:
            cursor.copy_expert(copy_sql, copy_buffer)
        finally:
            cursor.close()

    def _upsert_from_temp_table(self, conn, tmp_table, insert_columns, update_columns):
        quoted_insert_columns = [
            self._quote_sql_identifier(col) for col in insert_columns
        ]
        insert_columns_sql = ", ".join(quoted_insert_columns)
        select_columns_sql = ", ".join(quoted_insert_columns)
        if not update_columns:
            upsert_sql = (
                f"INSERT INTO {self._quote_sql_identifier('tno_occultation')} ({insert_columns_sql}) "
                f"SELECT {select_columns_sql} FROM {self._quote_sql_identifier(tmp_table)} "
                "ON CONFLICT ON CONSTRAINT tno_occultation_hash_id_key DO NOTHING"
            )
            result = conn.execute(text(upsert_sql))
            return result.rowcount

        update_set_sql = ", ".join(
            f"{self._quote_sql_identifier(col)} = EXCLUDED.{self._quote_sql_identifier(col)}"
            for col in update_columns
        )
        # Skip no-op updates to reduce WAL/lock pressure while preserving idempotency.
        update_where_sql = " OR ".join(
            f"{self._quote_sql_identifier('tno_occultation')}.{self._quote_sql_identifier(col)} "
            f"IS DISTINCT FROM EXCLUDED.{self._quote_sql_identifier(col)}"
            for col in update_columns
        )
        upsert_sql = (
            f"INSERT INTO {self._quote_sql_identifier('tno_occultation')} ({insert_columns_sql}) "
            f"SELECT {select_columns_sql} FROM {self._quote_sql_identifier(tmp_table)} "
            "ON CONFLICT ON CONSTRAINT tno_occultation_hash_id_key "
            f"DO UPDATE SET {update_set_sql} "
            f"WHERE {update_where_sql}"
        )
        result = conn.execute(text(upsert_sql))
        return result.rowcount

    def upinsert_occultations_copy_staging(self, df, conn):
        if df is None or df.empty:
            return 0

        prepared = self._prepare_upsert_dataframe(df)
        target_columns = [col.name for col in self.tbl.columns]
        insert_columns = [col for col in target_columns if col in prepared.columns]
        if "hash_id" not in insert_columns:
            raise ValueError("Column 'hash_id' is required for copy_staging upsert.")

        # created_at is immutable; updated_at must be refreshed every upsert.
        update_columns = [
            col for col in insert_columns if col not in ("hash_id", "created_at")
        ]
        if "updated_at" not in update_columns and "updated_at" in insert_columns:
            update_columns.append("updated_at")

        tmp_table = f"tmp_tno_occultation_{uuid.uuid4().hex[:12]}"
        conn.execute(
            text(
                f"CREATE TEMP TABLE {tmp_table} AS "
                "SELECT * FROM tno_occultation WITH NO DATA"
            )
        )
        self._copy_dataframe_to_temp_table(conn, tmp_table, prepared, insert_columns)
        return self._upsert_from_temp_table(
            conn, tmp_table, insert_columns, update_columns
        )
