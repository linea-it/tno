from datetime import timedelta

from dao.db_base import DBBase
from sqlalchemy.sql import and_, delete


class PredictOccultationJobResultDao(DBBase):
    def __init__(self):
        super(PredictOccultationJobResultDao, self).__init__()

        self.tbl = self.get_table("tno_predictionjobresult")

    def import_predict_occultation_results(self, data):

        # Sql Copy com todas as colunas que vão ser importadas e o formato do csv.
        sql = (
            f"COPY {self.tbl} (name, number, base_dynclass, dynclass, status, des_obs, obs_source, "
            "orb_ele_source, occultations, ing_occ_count, exec_time, messages, job_id, "
            "des_obs_start, des_obs_finish, des_obs_exec_time, bsp_jpl_start, bsp_jpl_finish, "
            "bsp_jpl_dw_time, obs_start, obs_finish, obs_dw_time, orb_ele_start, orb_ele_finish, "
            "orb_ele_dw_time, ref_orb_start, ref_orb_finish, ref_orb_exec_time, pre_occ_start, "
            "pre_occ_finish, pre_occ_exec_time, ing_occ_start, ing_occ_finish, ing_occ_exec_time, "
            "calc_path_coeff_start, calc_path_coeff_finish, calc_path_coeff_exec_time) "
            "FROM STDIN with (FORMAT CSV, DELIMITER '|', HEADER);"
        )

        rowcount = self.import_with_copy_expert(sql, data)

        return rowcount

    def delete_by_job_id(self, job_id):

        stm = delete(self.tbl).where(and_(self.tbl.c.job_id == job_id))

        engine = self.get_db_engine()
        with engine.connect() as con:
            rows = con.execute(stm)

            return rows

    def insert(self, data):
        engine = self.get_db_engine()
        with engine.connect() as con:
            result = con.execute(self.tbl.insert(), data)
            return result.inserted_primary_key[0]

    def update(self, id, data):

        if "exec_time" in data:
            data["exec_time"] = timedelta(seconds=data["exec_time"])
        if "pre_occ_exec_time" in data:
            data["pre_occ_exec_time"] = timedelta(seconds=data["pre_occ_exec_time"])
        if "calc_path_coeff_exec_time" in data:
            data["calc_path_coeff_exec_time"] = timedelta(
                seconds=data["calc_path_coeff_exec_time"]
            )
        if "ing_occ_exec_time" in data:
            data["ing_occ_exec_time"] = timedelta(seconds=data["ing_occ_exec_time"])

        engine = self.get_db_engine()
        with engine.connect() as con:
            result = con.execute(self.tbl.update().where(self.tbl.c.id == id), data)
            return result.rowcount
