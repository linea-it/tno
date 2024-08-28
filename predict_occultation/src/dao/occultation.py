from dao.db_base import DBBase
from sqlalchemy.sql import and_, delete


class OccultationDao(DBBase):
    def __init__(self, log):
        super(OccultationDao, self).__init__()

        self.tbl = self.get_table("tno_occultation")

        self.log = log

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
            self.log.info(
                f"Removed {rows} events for {name} in period {start_period} - {end_period}"
            )
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
            f"COPY {self.tbl} (name, number, date_time, gaia_source_id, ra_star_candidate, dec_star_candidate, ra_target, dec_target, closest_approach, position_angle, velocity, delta, g, j_star, h, k_star, long, loc_t, off_ra, off_dec, proper_motion, ct, multiplicity_flag, e_ra, e_dec, pmra, pmdec, ra_star_deg, dec_star_deg, ra_target_deg, dec_target_deg, created_at, apparent_diameter, aphelion, apparent_magnitude, dec_star_to_date, dec_star_with_pm, dec_target_apparent, diameter, e_dec_target, e_ra_target, eccentricity, ephemeris_version, g_mag_vel_corrected, h_mag_vel_corrected, inclination, instant_uncertainty, magnitude_drop, perihelion, ra_star_to_date, ra_star_with_pm, ra_target_apparent, rp_mag_vel_corrected, semimajor_axis, have_path_coeff, occ_path_max_longitude, occ_path_min_longitude, occ_path_coeff, occ_path_is_nightside, occ_path_max_latitude, occ_path_min_latitude, base_dynclass, bsp_planetary, bsp_source, catalog, dynclass, job_id, leap_seconds, nima, obs_source, orb_ele_source, predict_step, albedo, albedo_err_max, albedo_err_min, alias, arg_perihelion, astorb_dynbaseclass, astorb_dynsubclass, density, density_err_max, density_err_min, diameter_err_max, diameter_err_min, epoch, last_obs_included, long_asc_node, mass, mass_err_max, mass_err_min, mean_anomaly, mean_daily_motion, mpc_critical_list, pha_flag, principal_designation, rms, g_star, h_star, event_duration, moon_separation, sun_elongation, closest_approach_uncertainty, moon_illuminated_fraction, probability_of_centrality, hash_id, closest_approach_uncertainty_km) "
            "FROM STDIN with (FORMAT CSV, DELIMITER '|', HEADER);"
        )

        rowcount = self.import_with_copy_expert(sql, data)

        return rowcount
