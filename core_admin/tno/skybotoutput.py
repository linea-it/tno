

from .db import DBBase
from sqlalchemy.sql import select, and_, or_, func, subquery
from sqlalchemy import literal_column, null

class FilterObjects(DBBase):

    """

        Exemplo de Query com subquery para retornar a quantidade de bandas.
        - SELECT name, count(name) as freq, (SELECT COUNT(DISTINCT(band)) FROM tno.skybot_output WHERE name = a.name) as filters FROM tno.skybot_output a  GROUP BY name LIMIT 5
    """

    def __init__(self):
        super(FilterObjects, self).__init__()

        self.table = None


    def get_base_stm(self):

        if not self.table:
            self.table = self.get_table_skybot()

        cols = self.table.c

        stm = select([
                cols.dynclass.label("object_table"),
                cols.name,
                func.count(cols.name).label("freq"),
                null().label('filters'),
                func.min(cols.mv).label('mag_min'),
                func.max(cols.mv).label('mag_max'),
                func.min(cols.errpos).label('min_errpos'),
                func.max(cols.errpos).label('max_errpos'),
                func.count(func.distinct(cols.jdref)).label('diff_nights'),
                (func.max(cols.jdref) - func.min(cols.jdref)).label('diff_date_nights'),
                # func.count().over().label('totalCount')
            ])

        return stm


    def get_objects(self,
            name=None, objectTable=None, magnitude=None, diffDateNights=None,
            moreFilter=None, page=1, pageSize=100):

        """Applies the filters to the skybot output table and returns the list
        of objects that meet the requirements.

        Args:
            name (str): Object Name.
            objectTable (str): Object class, dynclass column in skybot output table.
            magnitude (float): magnitude less than or equal to
            diffDateNights

        Returns:
            (rows, count) Returns the list of objects and the total of found objects.
        """
        stm = self.get_base_stm()
        cols = self.table.c

        # Filtros
        terms = list([])

        if name:
            terms.append(cols.name.ilike("%"+name+"%"))

        if objectTable:
            if objectTable.find(";"):
                ltbls = list([])
                tbls = objectTable.split(";")

                for tbl in tbls:
                    ltbls.append(cols.dynclass.ilike(str(tbl.strip())))
                terms.append(
                    or_(*ltbls)
                )
            else:
                terms.append(
                    cols.dynclass.ilike(str(objectTable)))

        # Magnitude menor ou igual ao parametro
        if magnitude:
            terms.append(
                cols.mv.__le__(float(magnitude)))

        # Minimum difference between diff_date_nights
        if diffDateNights:
            # Exemplo query com where por diffDateNights
            #select name, min(mv), max(jdref) - min(jdref) as DiffDateNights from tno.skybot_output where dynclass like 'Centaur' group by name  HAVING max(jdref) - min(jdref) > 1000 limit 10 ;
            stm = stm.having((func.max(cols.jdref) - func.min(cols.jdref)) > float(diffDateNights))

        if len(terms):
            stm = stm.where(and_(*terms))

        # Agrupamento
        stm = stm.group_by(cols.name, cols.dynclass)

        # Ordenacao
        stm = stm.order_by(cols.name)

        # Paginacao
        stm = stm.limit(pageSize)

        if page and pageSize:
            offset = (int(page) * int(pageSize)) - int(pageSize)
            stm = stm.offset(offset)

        totalSize = self.stm_count(stm)

        rows = self.fetch_all_dict(stm)

        return rows, totalSize


    def create_object_list(self):
        print("create_object_list")
