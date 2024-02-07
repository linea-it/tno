from tno.db import DBBase

from sqlalchemy.sql import and_, select
from sqlalchemy import func


class SkybotPositionsDao(DBBase):
    def __init__(self, pool=True):
        super(SkybotPositionsDao, self).__init__(pool)
        schema = self.get_base_schema()
        self.tablename = "skybot_position"
        self.tbl = self.get_table(self.tablename, schema)

    def get_tbl(self):
        return self.tbl

    def count_asteroids(self):
        stm = select([func.count(func.distinct(self.tbl.c.name)).label("asteroids")])

        return self.fetch_scalar(stm)

    def distinct_dynclass(self):
        stm = select([func.distinct(self.tbl.c.dynclass).label("dynclass")])

        return self.fetch_all_dict(stm)

    def count_asteroids_by_dynclass(self):
        stm = select(
            [self.tbl.c.dynclass, func.count(self.tbl.c.name).label("count")]
        ).group_by(self.tbl.c.dynclass)

        return self.fetch_all_dict(stm)

    def count_asteroids_by_class(self):
        cls = list(
            [
                "KBO%",
                "Centaur",
                "Trojan",
                "MB%",
            ]
        )

        results = []
        for c in cls:
            stm = select([func.count(self.tbl.c.name).label("count")]).where(
                and_(self.tbl.c.dynclass.ilike(c))
            )

            count = self.fetch_scalar(stm)
            results.append(dict({"class_name": c.strip("%"), "count": count}))
        return results

    def histogram(self, column, bin):
        """

        :param column: Nome da coluna
        :param bin: Intervalo que sera criado os grupos
        :return:
        """

        stm = select(
            [
                (func.floor(self.tbl.c[column] / bin) * bin).label("bin"),
                func.count("*").label("count"),
            ]
        ).group_by("1")

        return self.fetch_all_dict(stm)

    def positions_by_ticket(self, ticket):
        """
        Retorna todas as linhas da tabela skybotoutput
        relacionadas a um skybot Ticket.
        """
        stm = select(self.tbl.c).where(and_(self.tbl.c.ticket == ticket))

        self.debug_query(stm, True)

        rows = self.fetch_all_dict(stm)

        return rows

    def positions_by_skybot_job(self, job_id):
        """
        Retorna todas as linhas da tabela skybotoutput
        relacionadas a um skybot Job.
        """
        stm = select(self.tbl.c).where(and_(self.tbl.c.skybot_job == job_id))

        self.debug_query(stm, True)

        rows = self.fetch_all_dict(stm)

        return rows

    def distinct_asteroids(self):
        stm = select(
            [
                func.distinct(self.tbl.c.name).label("name"),
                self.tbl.c.number,
                self.tbl.c.base_dynclass,
                self.tbl.c.dynclass,
            ]
        )

        return self.fetch_all_dict(stm)

    # def positions_by_object(self, name, only_in_ccd=False):
    #     """
    #         Retorna todas as linhas da tabela skybotoutput
    #         relacionadas a um objeto.
    #     """
    #     tbl = self.get_table_skybot()

    #     stm = select([tbl.c.id, tbl.c.expnum, tbl.c.ccdnum, tbl.c.band])

    #     terms = list([tbl.c.name == name])

    #     if only_in_ccd:
    #         terms.append(tbl.c.ccdnum.isnot(None))

    #     stm = stm.where(and_(*terms))

    #     totalSize = self.stm_count(stm)

    #     stm = stm.order_by(tbl.c.expnum.asc(), tbl.c.ccdnum.asc())

    #     self.debug_query(stm, True)

    #     rows = self.fetch_all_dict(stm)

    #     return rows, totalSize
