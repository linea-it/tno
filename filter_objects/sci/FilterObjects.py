

from common.db import DBBase
from sqlalchemy.sql import select, and_, or_, func
from sqlalchemy import literal_column, null

class FilterObjects():

    def __init__(self, app):
        self.db = DBBase(app)
        self.table = self.db.get_table_skybot()
        self.columns = self.table.c

    def get_objects(self,
            objectTable=None, magnitude=None, diffDateNights=None, moreFilter=None):

        stm = select([
                self.columns.dynclass.label("object_table"),
                self.columns.name,
                func.count(self.columns.name).label("freq"),
                null().label('filters'),
                func.min(self.columns.mv).label('mag_min'),
                func.max(self.columns.mv).label('mag_max'),
                func.min(self.columns.errpos).label('min_errpos'),
                func.max(self.columns.errpos).label('max_errpos'),
                func.count(func.distinct(self.columns.jdref)).label('diff_nights'),
                (func.max(self.columns.jdref) - func.min(self.columns.jdref)).label('diff_date_nights')
            ])

        # Filtros
        terms = list([])

        if objectTable:
            if objectTable.find(";"):
                print("Tem mais de uma tabela")
                ltbls = list([])
                tbls = objectTable.split(";")

                for tbl in tbls:
                    ltbls.append(self.columns.dynclass.ilike(str(tbl.strip())))
                terms.append(
                    or_(*ltbls)
                )
            else:
                terms.append(
                    self.columns.dynclass.ilike(str(objectTable)))

        # Magnitude menor ou igual ao parametro
        if magnitude:
            terms.append(
                self.columns.mv.__le__(float(magnitude)))

        # Minimum difference between diff_date_nights
        if diffDateNights:
            # Exemplo query com where por diffDateNights
            #select name, min(mv), max(jdref) - min(jdref) as DiffDateNights from tno.skybot_output where dynclass like 'Centaur' group by name  HAVING max(jdref) - min(jdref) > 1000 limit 10 ;
            stm = stm.having((func.max(self.columns.jdref) - func.min(self.columns.jdref)) > float(diffDateNights))



        if len(terms):
            stm = stm.where(and_(*terms))

        # Agrupamento
        stm = stm.group_by(self.columns.name, self.columns.dynclass)

        # Ordenacao
        stm = stm.order_by(self.columns.name)

        # Paginacao
        stm = stm.limit(10)

        print(str(stm))


        rows = self.db.fetch_all_dict(stm)
        print(rows)

        return rows, len(rows)




    def objects_by_name(self, name):
        """
        gavo=# select  name, count(name),  min(mv) as max_mv, max(mv) as min_mv , max(errpos) as max_errpos , min(errpos) as min_errpos , max(jdref) - min(jdref) as DiffDateNights, Count(Distinct jdref) as diff_nights from tno.skybot_output where name = '2002 TP36' group by name;
        -[ RECORD 1 ]--+----------
        name           | 2002 TP36
        count          | 22
        max_mv         | 19.5
        min_mv         | 20.3
        max_errpos     | 0.223
        min_errpos     | 0.207
        diffdatenights | 70
        diff_nights    | 7

        """

        stm = select([
                self.columns.name,
                func.count(self.columns.name).label("freq"),
                null().label('filters'),
                func.min(self.columns.mv).label('mag_min'),
                func.max(self.columns.mv).label('mag_max'),
                func.min(self.columns.errpos).label('min_errpos'),
                func.max(self.columns.errpos).label('max_errpos'),
                func.count(func.distinct(self.columns.jdref)).label('diff_nights'),
                (func.max(self.columns.jdref) - func.min(self.columns.jdref)).label('diff_date_nights')
            ]).\
            where(self.columns.name.ilike("%"+name+"%")).\
            group_by(self.columns.name)

        rows = self.db.fetch_all_dict(stm)
        print(rows)

        return rows, len(rows)
