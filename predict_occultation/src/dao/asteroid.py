from sqlalchemy.sql import select, and_

from dao.db_base import DBBase

class AsteroidDao(DBBase):
    def __init__(self):
        super(AsteroidDao, self).__init__()

        self.tbl = self.get_table('tno_asteroid')

    def get_by_name(self, name):

        stm = select(self.tbl.c).where(and_(self.tbl.c.name == name))

        rows = self.fetch_one_dict(stm)

        return rows

    def get_asteroids_by_names(self, names):

        stm = select(
            self.tbl.c.name, self.tbl.c.number, self.tbl.c.base_dynclass, self.tbl.c.dynclass)\
                .where(and_(self.tbl.c.name.in_(names)))

        rows = self.fetch_all_dict(stm)

        return rows

    def get_asteroids_by_base_dynclass(self, dynclass):

        stm = select(self.tbl.c).where(
            and_(self.tbl.c.base_dynclass == dynclass))

        rows = self.fetch_all_dict(stm)

        return rows

    def get_asteroids_by_dynclass(self, dynclass):

        stm = select(self.tbl.c).where(and_(self.tbl.c.dynclass == dynclass))

        rows = self.fetch_all_dict(stm)

        return rows

    def ccds_by_asteroid(self, asteroid_name):

        # des_exposure
        de = self.get_table('des_exposure')
        # des_ccd
        dc = self.get_table('des_ccd')
        # Des skybot position
        ds = self.get_table('des_skybotposition')
        # Skybot Position
        sp = self.get_table('skybot_position')

        # Clausula where pelo nome do objeto OBRIGATORIO.
        clause = list([sp.c.name == asteroid_name])

        columns = [dc.c.id, de.c.date_obs,
                   de.c.exptime, dc.c.path, dc.c.filename]

        stm = select(columns).\
            select_from(
            ds.join(
                sp, ds.c.position_id == sp.c.id
            ).join(
                dc, ds.c.ccd_id == dc.c.id
            ).join(
                de, ds.c.exposure_id == de.c.id
            )
        ).\
            where(and_(and_(*clause)))

        rows = self.fetch_all_dict(stm)

        return rows