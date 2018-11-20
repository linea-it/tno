import os
from .db import DBBase
from sqlalchemy.sql import select, and_, or_, func, subquery, text
from sqlalchemy import create_engine, inspect, MetaData, func, Table, Column, Integer, String, Float, Boolean, \
    literal_column, null, between

from django.utils import timezone


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

    def get_objects_stm(self,
                        name=None, objectTable=None, magnitude=None, diffDateNights=None,
                        moreFilter=None, page=1, pageSize=100):

        """Applies the filters to the skybot output table and returns the list
        of objects that meet the requirements.

        Args:
            name (str): Object Name.
            objectTable (str): Object class, dynclass column in skybot output table.
            magnitude (float): magnitude less than or equal to
            diffDateNights

        """
        stm = self.get_base_stm()
        cols = self.table.c

        # Filtros
        terms = list([])

        if name:
            terms.append(cols.name.ilike("%" + name + "%"))

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
            # select name, min(mv), max(jdref) - min(jdref) as DiffDateNights from tno.skybot_output where dynclass like 'Centaur' group by name  HAVING max(jdref) - min(jdref) > 1000 limit 10 ;
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

        stm = self.get_objects_stm(
            name, objectTable, magnitude, diffDateNights, moreFilter, page, pageSize)

        totalSize = self.stm_count(stm)

        rows = self.fetch_all_dict(stm)

        return rows, totalSize

    def create_object_list(self,
                           tablename, name, objectTable,
                           magnitude, diffDateNights, moreFilter):

        start = timezone.now()

        # Recuperar o stm que retorna todos os objetos que atendem o filtro
        stm = self.get_objects_stm(
            name=name, objectTable=objectTable, magnitude=magnitude,
            diffDateNights=diffDateNights, moreFilter=moreFilter, pageSize=None
        )

        self.debug_query(stm, True)

        # Trocar as colunas, para retornar apenas os nomes dos objetos e retirar o limit.
        cols = self.table.c

        # Todos os objetos por nome
        stm_content = stm.with_only_columns([cols.name]).limit(None)
        self.debug_query(stm_content, True)

        # Query com todos as linhas que contem estes objetos, name in (stm_content).
        all_stm = select([self.table], cols.name.in_(stm_content))

        self.debug_query(all_stm, True)

        # Create table As
        # TODO este schema precisa ser revisto talvez criar um schema para conter todas as customLists ou um schema por procces_id.
        databse = self.get_database()
        schema = self.get_base_schema()

        try:
            create_stm = self.create_table_as(
                tablename, all_stm, schema=schema)

            new_tbl = self.get_table(tablename, schema)

            # Total de Objetos unicos na tabela
            asteroids = self.count_distinct_objects(tablename, schema)

            # Total de linhas na nova tabela
            total_count = self.get_count(new_tbl)

            # Infos de Status da nova tabela
            tbl_status = self.get_table_status(tablename, schema)

            # Colunas da nova tabela
            tbl_columns = self.get_table_columns(tablename, schema)
            total_columns = len(tbl_columns)

            finish = timezone.now()
            tdelta = finish - start
            seconds = tdelta.total_seconds()

            result = dict({
                "database": databse,
                "tablename": tablename,
                "schema": schema,
                "sql_content": self.stm_to_str(stm_content, True),
                "sql_creation": create_stm,
                "asteroids": asteroids,
                "rows": total_count,
                "n_columns": total_columns,
                "columns": tbl_columns,
                "size": tbl_status.get("total_bytes"),
                "creation_time": seconds
            })

            return result

        except Exception as e:
            raise (e)

    def list_objects_by_table(self, tablename, schema=None, page=1, pageSize=100):

        tbl = self.get_table(tablename, schema).alias('a')
        tbl_ccd = self.get_table_ccdimage().alias('b')

        stm_join = tbl.join(tbl_ccd, tbl.c.pointing_id == tbl_ccd.c.pointing_id, isouter=True)

        stm = select([tbl, tbl_ccd.c.filename, tbl_ccd.c.file_size]).select_from(stm_join)

        # Ordenacao
        stm = stm.order_by(tbl.c.name)

        # Paginacao
        stm = stm.limit(pageSize)

        if page and pageSize:
            offset = (int(page) * int(pageSize)) - int(pageSize)
            stm = stm.offset(offset)

        # Total de rows independente da paginacao
        totalSize = self.stm_count(stm)

        rows = self.fetch_all_dict(stm)

        return rows, totalSize

    def list_distinct_objects_by_table(self, tablename, schema=None, page=1, pageSize=None):

        tbl = self.get_table(tablename, schema)

        # TODO acrescentar mais colunas a query
        tbl = self.get_table(tablename, schema).alias('a')
        tbl_ccd = self.get_table_ccdimage().alias('b')

        stm_join = tbl.join(tbl_ccd, tbl.c.pointing_id == tbl_ccd.c.pointing_id, isouter=True)

        stm = select([tbl.c.name, tbl.c.num]).select_from(stm_join)

        # Agrupamento
        stm = stm.group_by(tbl.c.name, tbl.c.num)

        # Ordenacao
        stm = stm.order_by(tbl.c.name)

        # Paginacao
        stm = stm.limit(pageSize)

        if page and pageSize:
            offset = (int(page) * int(pageSize)) - int(pageSize)
            stm = stm.offset(offset)

        # Total de rows independente da paginacao
        totalSize = self.stm_count(stm)

        rows = self.fetch_all_dict(stm)

        return rows, totalSize

    def count_distinct_objects(self, tablename, schema=None):

        tbl = self.get_table(tablename, schema).alias('a')
        tbl_ccd = self.get_table_ccdimage().alias('b')

        stm_join = tbl.join(tbl_ccd, tbl.c.pointing_id == tbl_ccd.c.pointing_id, isouter=True)

        stm = select([func.count(func.distinct(tbl.c.name))]).select_from(stm_join)

        distinct_objects = self.fetch_scalar(stm)

        return distinct_objects

    def count_distinct_pointing(self, tablename, schema=None):

        tbl = self.get_table(tablename, schema).alias('a')
        tbl_ccd = self.get_table_ccdimage().alias('b')

        stm_join = tbl.join(tbl_ccd, tbl.c.pointing_id == tbl_ccd.c.pointing_id, isouter=True)

        stm = select([func.count(func.distinct(tbl_ccd.c.filename))]).select_from(stm_join)

        distinct_pointings = self.fetch_scalar(stm)

        return distinct_pointings

    def count_missing_pointing(self, tablename, schema=None):
        """
            Retorna o total de registros que esta na lista mais nao esta dentro 
            de nenhum apontamento ou CCD.
        """
        # SELECT COUNT(*) FROM <tablename> WHERE pointing_id is null;
        tbl = self.get_table(tablename, schema).alias('a')

        stm = select([func.count(tbl.c.id)]).where(tbl.c.pointing_id.is_(None))

        missing_pointings = self.fetch_scalar(stm)

        return missing_pointings

    def count_pointing_not_downloaded(self, tablename, schema=None):
        """
            Retorna o total de registros que esta associado a um CCD mais nao teve 
            as imagens baixadas ainda.
        """
        # SELECT COUNT(*) FROM <tablename> a LEFT JOIN tno_ccdimage b ON (a.pointing_id = b.pointing_id) WHERE a.pointing_id is not null AND b.filename is null;
        tbl = self.get_table(tablename, schema).alias('a')
        tbl_ccd = self.get_table_ccdimage().alias('b')

        stm_join = tbl.join(tbl_ccd, tbl.c.pointing_id == tbl_ccd.c.pointing_id, isouter=True)

        stm = select([func.count(tbl.c.name)]).select_from(stm_join)

        stm = stm.where(and_(tbl.c.pointing_id.isnot(None), tbl_ccd.c.filename.is_(None)))

        not_downloaded = self.fetch_scalar(stm)

        return not_downloaded

    def list_ccdimage_by_table(self, tablename, schema=None, page=1, pageSize=None):

        tbl = self.get_table(tablename, schema).alias('a')
        tbl_ccd = self.get_table_ccdimage().alias('b')

        stm_join = tbl.join(tbl_ccd, tbl.c.pointing_id == tbl_ccd.c.pointing_id, isouter=True)

        stm = select(tbl_ccd.c).select_from(stm_join)

        # Ordenacao
        stm = stm.order_by(tbl_ccd.c.filename)

        # Paginacao
        stm = stm.limit(pageSize)

        if page and pageSize:
            offset = (int(page) * int(pageSize)) - int(pageSize)
            stm = stm.offset(offset)

        # Total de rows independente da paginacao
        totalSize = self.stm_count(stm)

        rows = self.fetch_all_dict(stm)

        return rows, totalSize

    def count_ccdimage_size(self, tablename, schema=None):

        tbl = self.get_table(tablename, schema).alias('a')
        tbl_ccd = self.get_table_ccdimage().alias('b')

        stm_join = tbl.join(tbl_ccd, tbl.c.pointing_id == tbl_ccd.c.pointing_id, isouter=True)

        stm = select([func.sum(tbl_ccd.c.file_size)]).select_from(stm_join)

        image_size = self.fetch_scalar(stm)

        return image_size


class SkybotOutput(DBBase):
    def __init__(self):
        super(SkybotOutput, self).__init__()
        self.tbl = self.get_table_skybot()

    def count_lines(self):
        return self.get_count(self.tbl)

    def count_unique_ccds(self):
        stm = select([func.count(func.distinct(self.tbl.c.expnum, self.tbl.c.ccdnum)).label('unique_ccds')])

        return self.fetch_scalar(stm)

    def count_asteroids(self):
        stm = select([func.count(func.distinct(self.tbl.c.name)).label('asteroids')])

        return self.fetch_scalar(stm)

    def distinct_dynclass(self):
        stm = select([func.distinct(self.tbl.c.dynclass).label('dynclass')])

        return self.fetch_all_dict(stm)

    def count_asteroids_by_dynclass(self):
        stm = select([self.tbl.c.dynclass, func.count(self.tbl.c.name).label('count')]).group_by(self.tbl.c.dynclass)

        return self.fetch_all_dict(stm)

    def count_asteroids_by_class(self):
        cls = list(['KBO%', 'Centaur', 'Trojan', 'MB%', ])

        results = list()
        for c in cls:
            stm = select([func.count(self.tbl.c.name).label('count')]).where(
                and_(self.tbl.c.dynclass.ilike(c)))

            count = self.fetch_scalar(stm)
            results.append(dict({
                'class_name': c.strip('%'),
                'count': count
            }))
        return results

    def histogram(self, column, bin):
        """

        :param column: Nome da coluna
        :param bin: Intervalo que sera criado os grupos
        :return:
        """

        stm = select([
            (func.floor(self.tbl.c[column] / bin) * bin).label('bin'), func.count('*').label('count')
        ]).group_by('1')

        return self.fetch_all_dict(stm)


class Pointing(DBBase):
    def __init__(self):
        super(Pointing, self).__init__()
        self.tbl = self.get_table_pointing()

    def count_pointings(self):
        return self.get_count(self.tbl)

    def count_downloaded(self):
        stm = select().where(and_(self.tbl.c.downloaded.is_(True)))

        return self.stm_count(stm)

    def count_not_downloaded(self):
        stm = select([self.tbl]).where(and_(self.tbl.c.downloaded.isnot(True)))

        return self.stm_count(stm)

    def count_by_band(self, band):
        stm = select([self.tbl]).where(and_(self.tbl.c.band.ilike(str(band))))

        return self.stm_count(stm)

    def counts_by_bands(self):
        bands = ['u', 'g', 'r', 'i', 'z', 'Y']

        results = list()
        for band in bands:
            results.append(dict({'name': band, 'band': self.count_by_band(band)}))

        return results

    def last(self):
        stm = select([self.tbl]).order_by(self.tbl.c.date_obs.desc()).limit(1)

        return self.fetch_one_dict(stm)

    def first(self):
        stm = select([self.tbl]).order_by(self.tbl.c.date_obs).limit(1)

        return self.fetch_one_dict(stm)

    def count_unique_exposures(self):
        stm = select([func.count(func.distinct(self.tbl.c.expnum)).label('exposures')])

        return self.fetch_scalar(stm)

    # Count por faixa das exposições
    def count_range_exposures(self, start, end):
        
        stm = select([func.count()]).where(between(self.tbl.c.exptime, int(start.strip()), int(end.strip())))

        return self.fetch_scalar(stm)

    def counts_range_exposures(self):

        exptimes = ['0, 100', '100, 200', '200, 300', '300, 400']

        results = list()
        for exptime in exptimes:
            start, end = exptime.split(',')

            results.append(dict({'name' : exptime, 'exposure' : self.count_range_exposures(start, end)}))
        return results