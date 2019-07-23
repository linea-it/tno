import os
import csv
from datetime import datetime, timezone, timedelta
from tno.db import CatalogDB

from praia.pipeline.register import register_input

def create_star_catalog(run_id, name, ccd_images_file, output_filepath, schema, tablename, ra_property, dec_property):
    # Criar um Catalogo de Estrelas para cada CCD do objeto
    start = datetime.now(timezone.utc)

    result = dict({
        'asteroid': name,
        'input_type': 'catalog',
        'filename': os.path.basename(output_filepath),
        'file_type': 'csv',
        'file_size': None,
        'file_path': output_filepath,
        'catalog_count': None,
        'error_msg': None
    })

    rows = []
    try:
        with open(ccd_images_file, 'r') as cfile:
            reader = csv.DictReader(cfile, delimiter=';')
            for row in reader:

                # Query no banco de catalogos
                coordinates = [
                    row['rac1'], row['decc1'], row['rac2'], row['decc2'], row['rac3'], row['decc3'], row['rac4'], row['decc4']]

                resultset = CatalogDB().poly_query(
                    schema=schema,
                    tablename=tablename,
                    ra_property=ra_property,
                    dec_property=dec_property,
                    positions=coordinates,
                )

                for star in resultset:
                    star.update({'ccd_id': row['id']})
                    rows.append(star)

        if len(rows) > 0:
            headers = []
            for head in rows[0]:
                headers.append(head)

            with open(output_filepath, 'w') as tempFile:
                writer = csv.DictWriter(
                    tempFile, delimiter=';', fieldnames=headers)
                writer.writeheader()
                writer.writerows(rows)

            if os.path.exists(output_filepath):
                result.update({
                    'file_size': os.path.getsize(output_filepath),
                    'catalog_count': len(rows)
                })
            else:
                result.update({
                    'error_msg': "Catalog file was not created",
                })
        else:
            result.update({
                'error_msg': "The query in the catalog did not return any results",
            })

    except Exception as e:
        result.update({
            'error_msg': e
        })

    finish = datetime.now(timezone.utc)
    result.update({
        'start_time': start,
        'finish_time': finish,
        'execution_time': finish - start
    })

    register_input(run_id, name, result)

    return result